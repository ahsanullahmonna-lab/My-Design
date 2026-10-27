import { toPng, toBlob } from 'html-to-image';

/**
 * Universal Bengali Typography CSS to embed inside SVG foreignObject
 * to prevent font fallback, broken ligatures, clipping, or line wrapping discrepancies.
 */
export const BENGALI_FONT_EMBED_CSS = `
@font-face {
  font-family: 'SolaimanLipi';
  font-style: normal;
  font-weight: 400;
  src: url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-normal-v1.0.woff2') format('woff2'),
       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-normal-v1.0.ttf') format('truetype');
}
@font-face {
  font-family: 'SolaimanLipi';
  font-style: normal;
  font-weight: 700;
  src: url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-bold-v1.0.woff2') format('woff2'),
       url('https://fonts.maateen.me/solaiman-lipi/solaimanlipi-bold-v1.0.ttf') format('truetype');
}
@font-face {
  font-family: 'Kalpurush';
  font-style: normal;
  font-weight: 400;
  src: url('https://fonts.maateen.me/kalpurush/Kalpurush-v0.258.woff2') format('woff2'),
       url('https://fonts.maateen.me/kalpurush/Kalpurush-v0.258.ttf') format('truetype');
}
@font-face {
  font-family: 'Kalpurush';
  font-style: normal;
  font-weight: 700;
  src: url('https://fonts.maateen.me/kalpurush/Kalpurush-v0.258.woff2') format('woff2'),
       url('https://fonts.maateen.me/kalpurush/Kalpurush-v0.258.ttf') format('truetype');
}
* {
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  box-sizing: border-box !important;
  text-rendering: optimizeLegibility !important;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "locl" 1 !important;
  font-variant-ligatures: normal !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
}
`;

export interface PhotoCardExportOptions {
  filename?: string;
  minWidth?: number;
  quality?: number;
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16' | '4/5' | '9/16' | 'custom' | string;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Wait for all images inside a node and active fonts to complete loading & rasterizing
 */
export async function prepareNodeForExport(node: HTMLElement): Promise<void> {
  // 1. Wait for document fonts and explicitly preload key Bengali faces
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await Promise.all([
        (document as any).fonts.load('16px SolaimanLipi'),
        (document as any).fonts.load('bold 24px SolaimanLipi'),
        (document as any).fonts.load('bold 32px SolaimanLipi'),
        (document as any).fonts.load('16px Kalpurush'),
        (document as any).fonts.load('bold 24px Kalpurush'),
        (document as any).fonts.load('16px "Noto Sans Bengali"'),
        (document as any).fonts.load('bold 24px "Noto Sans Bengali"'),
        (document as any).fonts.ready,
      ]);
    } catch (fontErr) {
      console.warn('Font preload warning:', fontErr);
    }
  }

  // 2. Wait for all <img> elements inside node
  const images = Array.from(node.querySelectorAll('img'));
  if (images.length > 0) {
    await Promise.all(
      images.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>(resolve => {
          const onDone = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
            resolve();
          };
          img.addEventListener('load', onDone);
          img.addEventListener('error', onDone);
          // Safety timeout in case image never triggers
          setTimeout(onDone, 1200);
        });
      })
    );
  }

  // 3. Small tick to allow browser layout & glyph layout shaping to settle
  await new Promise(resolve => setTimeout(resolve, 80));
}

/**
 * Calculates optimal pixelRatio to produce a crisp HD banner (min 1200px width)
 * without exceeding browser memory limits.
 */
export function calculateOptimalPixelRatio(node: HTMLElement, targetMinWidth: number = 1200): number {
  const rect = node.getBoundingClientRect();
  const currentWidth = rect.width || node.offsetWidth || 360;
  if (currentWidth <= 0) return 3;
  const ratio = Math.ceil(targetMinWidth / currentWidth);
  return Math.min(Math.max(ratio, 2.5), 4);
}

/**
 * Exports a given DOM element to high-res PNG data URL with full typography & styling fidelity.
 * Applies exact custom dimensions when provided.
 */
export async function exportPhotoCardToPng(
  node: HTMLElement,
  options: PhotoCardExportOptions = {}
): Promise<string> {
  await prepareNodeForExport(node);

  const rect = node.getBoundingClientRect();
  const nodeW = rect.width || node.offsetWidth || 400;
  const nodeH = rect.height || node.offsetHeight || 400;

  // Determine exact canvas output dimensions
  const hasCustomDimensions = Boolean(options.targetWidth && options.targetHeight);
  const targetW = options.targetWidth || Math.max(options.minWidth || 1200, Math.round(nodeW * 2.5));
  const targetH = options.targetHeight || Math.round(targetW * (nodeH / Math.max(1, nodeW)));

  const exportConfig: any = {
    cacheBust: true,
    fontEmbedCSS: BENGALI_FONT_EMBED_CSS,
    style: {
      transform: 'none',
      margin: '0 auto',
      maxWidth: 'none',
      boxShadow: 'none',
    },
  };

  if (hasCustomDimensions) {
    exportConfig.canvasWidth = targetW;
    exportConfig.canvasHeight = targetH;
    exportConfig.pixelRatio = 1;
  } else {
    exportConfig.pixelRatio = calculateOptimalPixelRatio(node, options.minWidth || 1200);
  }

  try {
    return await toPng(node, exportConfig);
  } catch (primaryErr) {
    console.warn('Initial high-res toPng export failed, retrying with safe fallback:', primaryErr);
    return await toPng(node, {
      ...exportConfig,
      skipFonts: true,
      fontEmbedCSS: '',
      pixelRatio: hasCustomDimensions ? 1 : 2.5,
    });
  }
}

/**
 * Exports a given DOM element to Blob for clipboard copying or streaming.
 * Applies exact custom dimensions when provided.
 */
export async function exportPhotoCardToBlob(
  node: HTMLElement,
  options: PhotoCardExportOptions = {}
): Promise<Blob | null> {
  await prepareNodeForExport(node);

  const rect = node.getBoundingClientRect();
  const nodeW = rect.width || node.offsetWidth || 400;
  const nodeH = rect.height || node.offsetHeight || 400;

  const hasCustomDimensions = Boolean(options.targetWidth && options.targetHeight);
  const targetW = options.targetWidth || Math.max(options.minWidth || 1080, Math.round(nodeW * 2.5));
  const targetH = options.targetHeight || Math.round(targetW * (nodeH / Math.max(1, nodeW)));

  const exportConfig: any = {
    cacheBust: true,
    fontEmbedCSS: BENGALI_FONT_EMBED_CSS,
    style: {
      transform: 'none',
      margin: '0 auto',
      maxWidth: 'none',
      boxShadow: 'none',
    },
  };

  if (hasCustomDimensions) {
    exportConfig.canvasWidth = targetW;
    exportConfig.canvasHeight = targetH;
    exportConfig.pixelRatio = 1;
  } else {
    exportConfig.pixelRatio = calculateOptimalPixelRatio(node, options.minWidth || 1080);
  }

  try {
    return await toBlob(node, exportConfig);
  } catch (primaryErr) {
    console.warn('Initial toBlob export failed, retrying with safe fallback:', primaryErr);
    return await toBlob(node, {
      ...exportConfig,
      skipFonts: true,
      fontEmbedCSS: '',
      pixelRatio: 2,
    });
  }
}

/**
 * Triggers native 1-click PNG file download.
 */
export async function downloadPhotoCardImage(
  node: HTMLElement,
  filename: string,
  options: PhotoCardExportOptions = {}
): Promise<void> {
  const dataUrl = await exportPhotoCardToPng(node, options);
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
