/**
 * High-fidelity, self-contained SVG editorial imagery generator
 * Ensures zero broken images across all news categories and responsive cards.
 */

interface ImageOptions {
  theme?: 'judicial' | 'politics' | 'diplomacy' | 'cinema' | 'world' | 'water' | 'economy' | 'sports' | 'lifestyle' | 'science' | 'crime' | 'health';
  headline?: string;
  category?: string;
  badge?: string;
}

export function getEditorialImage(type: string, title?: string): string {
  // Return tailored inline SVG data URIs with rich gradients, editorial motifs, and news textures
  const svgs: Record<string, string> = {
    courtroom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgCourt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgCourt)"/>
      <g opacity="0.12">
        <path d="M0 0h800v480H0z" fill="none"/>
        <path d="M100 0v480M200 0v480M300 0v480M400 0v480M500 0v480M600 0v480M700 0v480" stroke="#fff" stroke-width="1"/>
      </g>
      <!-- Courtroom Pillars -->
      <path d="M120 420 L120 180 L160 180 L160 420" fill="#334155" opacity="0.4"/>
      <path d="M220 420 L220 180 L260 180 L260 420" fill="#334155" opacity="0.4"/>
      <path d="M680 420 L680 180 L720 180 L720 420" fill="#334155" opacity="0.4"/>
      <path d="M580 420 L580 180 L620 180 L620 420" fill="#334155" opacity="0.4"/>
      <!-- Scales of Justice -->
      <g transform="translate(400, 200)" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round">
        <line x1="0" y1="-80" x2="0" y2="120"/>
        <line x1="-120" y1="-40" x2="120" y2="-40"/>
        <!-- Left scale pan -->
        <path d="M-120 -40 L-160 20 L-80 20 Z" stroke-width="2"/>
        <path d="M-170 20 Q-120 50 -70 20" fill="rgba(245,158,11,0.2)"/>
        <!-- Right scale pan -->
        <path d="M120 -40 L80 20 L160 20 Z" stroke-width="2"/>
        <path d="M70 20 Q120 50 170 20" fill="rgba(245,158,11,0.2)"/>
        <!-- Base -->
        <path d="M-60 120 L60 120" stroke-width="8"/>
      </g>
      <!-- Press Microphones -->
      <g transform="translate(400, 380)">
        <rect x="-30" y="-30" width="60" height="70" rx="10" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
        <line x1="0" y1="40" x2="0" y2="90" stroke="#64748b" stroke-width="6"/>
        <circle cx="0" cy="-4" r="14" fill="#ef4444" opacity="0.8"/>
      </g>
      <!-- Vignette and editorial overlay -->
      <rect width="800" height="480" fill="black" opacity="0.25"/>
      <rect x="0" y="380" width="800" height="100" fill="url(#bgCourt)" opacity="0.85"/>
      <text x="30" y="440" fill="#f8fafc" font-size="20" font-weight="bold" font-family="sans-serif">বিশেষ প্রতিবেদন: আদালত ও বিচারিক কার্যবিবরণী</text>
    </svg>`,

    summit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgSummit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f2b48"/>
          <stop offset="50%" stop-color="#103c62"/>
          <stop offset="100%" stop-color="#091b2e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgSummit)"/>
      <!-- Conference table & flags -->
      <ellipse cx="400" cy="360" rx="360" ry="110" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <ellipse cx="400" cy="350" rx="320" ry="85" fill="#334155"/>
      <!-- Bangladesh Flag on table -->
      <g transform="translate(320, 200)">
        <rect x="0" y="0" width="60" height="36" rx="2" fill="#006a4e"/>
        <circle cx="28" cy="18" r="12" fill="#f42a41"/>
        <line x1="0" y1="0" x2="0" y2="60" stroke="#94a3b8" stroke-width="4"/>
      </g>
      <!-- India Flag on table -->
      <g transform="translate(420, 200)">
        <rect x="0" y="0" width="60" height="12" fill="#ff9933"/>
        <rect x="0" y="12" width="60" height="12" fill="#ffffff"/>
        <rect x="0" y="24" width="60" height="12" fill="#138808"/>
        <circle cx="30" cy="18" r="5" fill="#000080"/>
        <line x1="60" y1="0" x2="60" y2="60" stroke="#94a3b8" stroke-width="4"/>
      </g>
      <!-- Summit Header text -->
      <text x="400" y="100" text-anchor="middle" fill="#38bdf8" font-size="28" font-weight="700" font-family="sans-serif">দ্বিপাক্ষিক যৌথ ওয়ার্কিং গ্রুপ বৈঠক</text>
      <text x="400" y="130" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="sans-serif">নয়াদিল্লি-ঢাকা কৌশলগত সমন্বয় সম্মেলন</text>
    </svg>`,

    politics: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgPol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b0764"/>
          <stop offset="60%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#090514"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgPol)"/>
      <!-- Press conference microphones cluster -->
      <g transform="translate(400, 300)">
        <ellipse cx="0" cy="60" rx="220" ry="40" fill="#1e293b"/>
        <!-- Podium -->
        <rect x="-80" y="-80" width="160" height="150" fill="#334155" rx="6"/>
        <rect x="-70" y="-70" width="140" height="40" fill="#475569" rx="4"/>
        <text x="0" y="-45" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="bold">প্রেস ব্রিফিং</text>
        <!-- Mics -->
        <line x1="-50" y1="-80" x2="-70" y2="-130" stroke="#94a3b8" stroke-width="6"/>
        <circle cx="-70" cy="-130" r="10" fill="#ef4444"/>
        <line x1="-15" y1="-80" x2="-20" y2="-140" stroke="#94a3b8" stroke-width="6"/>
        <circle cx="-20" cy="-140" r="10" fill="#3b82f6"/>
        <line x1="20" y1="-80" x2="25" y2="-140" stroke="#94a3b8" stroke-width="6"/>
        <circle cx="25" cy="-140" r="10" fill="#10b981"/>
        <line x1="50" y1="-80" x2="70" y2="-130" stroke="#94a3b8" stroke-width="6"/>
        <circle cx="70" cy="-130" r="10" fill="#f59e0b"/>
      </g>
      <text x="400" y="80" text-anchor="middle" fill="#c084fc" font-size="28" font-weight="bold">রাজনৈতিক সংবাদ সম্মেলন</text>
    </svg>`,

    cinema: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgCinema" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#450a0a"/>
          <stop offset="50%" stop-color="#1f1013"/>
          <stop offset="100%" stop-color="#0a0506"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgCinema)"/>
      <g transform="translate(400, 240)">
        <!-- Film Reel & Spotlight -->
        <circle cx="0" cy="0" r="110" fill="#2d0f14" stroke="#f87171" stroke-width="4"/>
        <circle cx="0" cy="0" r="85" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="10 8"/>
        <circle cx="0" cy="0" r="30" fill="#fca5a5"/>
        <circle cx="-50" cy="-50" r="16" fill="#1f1013"/>
        <circle cx="50" cy="-50" r="16" fill="#1f1013"/>
        <circle cx="-50" cy="50" r="16" fill="#1f1013"/>
        <circle cx="50" cy="50" r="16" fill="#1f1013"/>
      </g>
      <text x="400" y="90" text-anchor="middle" fill="#fca5a5" font-size="26" font-weight="bold">বিনোদন ও চলচ্চিত্র অঙ্গন</text>
    </svg>`,

    world: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgWorld" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#082f49"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgWorld)"/>
      <!-- Globe grid -->
      <g transform="translate(400, 240)" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.7">
        <circle cx="0" cy="0" r="130"/>
        <ellipse cx="0" cy="0" rx="130" ry="50"/>
        <ellipse cx="0" cy="0" rx="130" ry="90"/>
        <ellipse cx="0" cy="0" rx="50" ry="130"/>
        <ellipse cx="0" cy="0" rx="90" ry="130"/>
        <line x1="-130" y1="0" x2="130" y2="0"/>
        <line x1="0" y1="-130" x2="0" y2="130"/>
      </g>
      <text x="400" y="80" text-anchor="middle" fill="#7dd3fc" font-size="28" font-weight="bold">আন্তর্জাতিক পরিক্রমা</text>
    </svg>`,

    water: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0369a1"/>
          <stop offset="70%" stop-color="#075985"/>
          <stop offset="100%" stop-color="#0c4a6e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgWater)"/>
      <path d="M0 260 Q200 210 400 250 T800 240 L800 480 L0 480 Z" fill="#0284c7" opacity="0.6"/>
      <path d="M0 320 Q200 280 400 310 T800 300 L800 480 L0 480 Z" fill="#38bdf8" opacity="0.4"/>
      <!-- River barrage gates -->
      <g transform="translate(200, 150)" fill="#64748b" stroke="#cbd5e1">
        <rect x="0" y="0" width="400" height="30" rx="4"/>
        <rect x="40" y="30" width="20" height="120"/>
        <rect x="120" y="30" width="20" height="120"/>
        <rect x="200" y="30" width="20" height="120"/>
        <rect x="280" y="30" width="20" height="120"/>
        <rect x="360" y="30" width="20" height="120"/>
      </g>
      <text x="400" y="90" text-anchor="middle" fill="#e0f2fe" font-size="26" font-weight="bold">অভিন্ন নদী ও পানির হিস্যা</text>
    </svg>`,

    economy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgEco" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="70%" stop-color="#022c22"/>
          <stop offset="100%" stop-color="#051b14"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgEco)"/>
      <g transform="translate(100, 360)">
        <path d="M0 0 L120 -80 L240 -40 L360 -180 L480 -140 L600 -240" fill="none" stroke="#34d399" stroke-width="6"/>
        <circle cx="600" cy="-240" r="10" fill="#10b981"/>
      </g>
      <text x="400" y="80" text-anchor="middle" fill="#6ee7b7" font-size="28" font-weight="bold">অর্থ ও বাণিজ্য প্রবাহ</text>
    </svg>`,

    sports: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgSports" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#14532d"/>
          <stop offset="80%" stop-color="#052e16"/>
          <stop offset="100%" stop-color="#021c0d"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgSports)"/>
      <g transform="translate(400, 240)">
        <circle cx="0" cy="0" r="100" fill="#dc2626" stroke="#fecaca" stroke-width="4"/>
        <line x1="-90" y1="0" x2="90" y2="0" stroke="#fef2f2" stroke-width="4" stroke-dasharray="6 4"/>
      </g>
      <text x="400" y="80" text-anchor="middle" fill="#86efac" font-size="28" font-weight="bold">খেলাধুলা ও ক্রিকেট অঙ্গন</text>
    </svg>`,

    lifestyle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
      <defs>
        <linearGradient id="bgLife" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#701a75"/>
          <stop offset="70%" stop-color="#4a044e"/>
          <stop offset="100%" stop-color="#2a022d"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#bgLife)"/>
      <circle cx="400" cy="240" r="90" fill="#f472b6" opacity="0.3"/>
      <circle cx="400" cy="240" r="60" fill="#ec4899" opacity="0.5"/>
      <text x="400" y="80" text-anchor="middle" fill="#fbcfe8" font-size="28" font-weight="bold">জীবনযাপন ও স্বাস্থ্য</text>
    </svg>`
  };

  const svg = svgs[type] || svgs.courtroom;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
