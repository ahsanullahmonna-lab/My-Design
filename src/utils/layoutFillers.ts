import { Article } from '../types/news';

/**
 * Ensures a section has the target number of articles by filling any shortage
 * with top trending, breaking, or latest published articles from the pool.
 */
export function fillArticlesToTarget(
  primaryArticles: Article[],
  allArticles: Article[],
  targetCount: number,
  excludeIds?: Set<string>
): Article[] {
  const result: Article[] = [...primaryArticles];
  const usedIds = new Set<string>(excludeIds || []);
  result.forEach(a => usedIds.add(a.id));

  if (result.length >= targetCount) {
    return result.slice(0, targetCount);
  }

  // Pool of potential fillers: published & not pending/rejected
  const validPool = allArticles.filter(
    a => !usedIds.has(a.id) && a.status !== 'pending' && a.status !== 'rejected'
  );

  // Sort fillers: trending first, then breaking, then by views/recency
  const sortedFillers = [...validPool].sort((a, b) => {
    if (a.trendRank && b.trendRank) return a.trendRank - b.trendRank;
    if (a.trendRank) return -1;
    if (b.trendRank) return 1;
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    return (b.views || 0) - (a.views || 0);
  });

  for (const filler of sortedFillers) {
    if (result.length >= targetCount) break;
    result.push(filler);
    usedIds.add(filler.id);
  }

  return result;
}

/**
 * Returns dynamic, balanced responsive Tailwind grid classes depending on article count.
 * Prevents awkward empty gaps when a section has fewer cards.
 */
export function getAdaptiveGridClass(count: number, maxCols: 2 | 3 | 4 = 4): string {
  if (count <= 0) return 'w-full';
  if (count === 1) {
    return 'grid grid-cols-1 max-w-2xl mx-auto w-full';
  }
  if (count === 2) {
    return 'grid grid-cols-1 sm:grid-cols-2';
  }
  if (count === 3) {
    if (maxCols === 2) return 'grid grid-cols-1 sm:grid-cols-2';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }
  // 4 or more
  if (maxCols === 2) return 'grid grid-cols-1 sm:grid-cols-2';
  if (maxCols === 3) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

/**
 * Returns dynamic CSS grid with repeat(auto-fit, minmax(...)) ensuring cards stretch or wrap gracefully.
 */
export function getAutoFitGridClass(minWidth: 'sm' | 'md' | 'lg' = 'md'): string {
  if (minWidth === 'sm') return 'dynamic-news-grid-sm';
  if (minWidth === 'lg') return 'dynamic-news-grid-lg';
  return 'dynamic-news-grid-md';
}
