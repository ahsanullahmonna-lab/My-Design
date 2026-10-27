/**
 * Database Query Indexing & Incremental Static Regeneration (ISR) Cache
 * Provides high-performance O(1) indexed lookups and stale-while-revalidate caching.
 */
import { Article } from '../types/news';

// ----------------------------------------------------
// 1. In-Memory Multi-Key Query Indexer
// ----------------------------------------------------
export class ArticleQueryIndex {
  private byId = new Map<string, Article>();
  private bySlug = new Map<string, string>();
  private byCategory = new Map<string, Set<string>>();
  private byAuthor = new Map<string, Set<string>>();
  private byDistrict = new Map<string, Set<string>>();
  private byTag = new Map<string, Set<string>>();
  private breakingSet = new Set<string>();
  private trendingList: string[] = [];
  private leadId: string | null = null;
  private lastIndexedTimestamp: number = 0;

  constructor(articles?: Article[]) {
    if (articles && articles.length > 0) {
      this.rebuildIndex(articles);
    }
  }

  /**
   * Rebuilds indexes in a single pass O(N)
   */
  public rebuildIndex(articles: Article[]): void {
    this.byId.clear();
    this.bySlug.clear();
    this.byCategory.clear();
    this.byAuthor.clear();
    this.byDistrict.clear();
    this.byTag.clear();
    this.breakingSet.clear();
    this.trendingList = [];
    this.leadId = null;

    for (const art of articles) {
      this.byId.set(art.id, art);
      if (art.slug) {
        this.bySlug.set(art.slug.toLowerCase(), art.id);
      }

      // Index by category
      if (art.category) {
        const catKey = art.category.trim();
        if (!this.byCategory.has(catKey)) this.byCategory.set(catKey, new Set());
        this.byCategory.get(catKey)!.add(art.id);
      }

      // Index by author
      if (art.author) {
        const authorKey = art.author.trim();
        if (!this.byAuthor.has(authorKey)) this.byAuthor.set(authorKey, new Set());
        this.byAuthor.get(authorKey)!.add(art.id);
      }

      // Index by district
      if (art.district) {
        const distKey = art.district.trim();
        if (!this.byDistrict.has(distKey)) this.byDistrict.set(distKey, new Set());
        this.byDistrict.get(distKey)!.add(art.id);
      }

      // Index by tags
      if (art.tags && Array.isArray(art.tags)) {
        for (const tag of art.tags) {
          const tagKey = tag.toLowerCase().trim();
          if (!this.byTag.has(tagKey)) this.byTag.set(tagKey, new Set());
          this.byTag.get(tagKey)!.add(art.id);
        }
      }

      // Breaking index
      if (art.isBreaking) {
        this.breakingSet.add(art.id);
      }

      // Lead story
      if (art.isLead && !this.leadId) {
        this.leadId = art.id;
      }
    }

    // Sort trending articles by rank or views
    this.trendingList = articles
      .filter(a => a.status === 'published' || !a.status)
      .sort((a, b) => (b.views || 0) - (a.views || 0) || ((a.trendRank || 99) - (b.trendRank || 99)))
      .map(a => a.id);

    this.lastIndexedTimestamp = Date.now();
  }

  // O(1) Lookups
  public getById(id: string): Article | undefined {
    return this.byId.get(id);
  }

  public getBySlug(slug: string): Article | undefined {
    const id = this.bySlug.get(slug.toLowerCase());
    return id ? this.byId.get(id) : undefined;
  }

  public getByCategory(category: string, limit?: number): Article[] {
    const ids = this.byCategory.get(category);
    if (!ids) return [];
    const list: Article[] = [];
    for (const id of ids) {
      const art = this.byId.get(id);
      if (art) list.push(art);
      if (limit && list.length >= limit) break;
    }
    return list;
  }

  public getBreaking(limit: number = 6): Article[] {
    const list: Article[] = [];
    for (const id of this.breakingSet) {
      const art = this.byId.get(id);
      if (art) list.push(art);
      if (list.length >= limit) break;
    }
    return list;
  }

  public getMostRead(limit: number = 8): Article[] {
    return this.trendingList
      .slice(0, limit)
      .map(id => this.byId.get(id)!)
      .filter(Boolean);
  }

  public getLead(): Article | undefined {
    return this.leadId ? this.byId.get(this.leadId) : undefined;
  }

  public getIndexStats() {
    return {
      totalIndexed: this.byId.size,
      categoriesCount: this.byCategory.size,
      authorsCount: this.byAuthor.size,
      districtsCount: this.byDistrict.size,
      tagsCount: this.byTag.size,
      lastIndexed: new Date(this.lastIndexedTimestamp).toISOString(),
    };
  }
}

// ----------------------------------------------------
// 2. Incremental Static Regeneration (ISR) Cache Manager
// ----------------------------------------------------
export interface IsrCacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  tags: string[];
  isStale: boolean;
}

export class IsrCacheManager {
  private cache = new Map<string, IsrCacheEntry<any>>();
  private defaultTtlMs: number;

  constructor(defaultTtlSeconds: number = 60) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  /**
   * Sets cached response with optional tags for selective revalidation
   */
  public set<T>(key: string, data: T, tags: string[] = [], ttlSeconds?: number): void {
    const ttlMs = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      tags,
      isStale: false,
    });
  }

  /**
   * Stale-While-Revalidate access pattern
   */
  public get<T>(
    key: string,
    revalidateFn?: () => Promise<T>
  ): { data: T | null; isStale: boolean; hit: boolean } {
    const entry = this.cache.get(key) as IsrCacheEntry<T> | undefined;

    if (!entry) {
      return { data: null, isStale: true, hit: false };
    }

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttlMs;

    // Trigger background revalidation if stale and callback provided
    if (isStale && revalidateFn) {
      revalidateFn().then(freshData => {
        this.set(key, freshData, entry.tags, entry.ttlMs / 1000);
      }).catch(err => {
        console.warn(`[ISR Cache Revalidation Failed] Key: ${key}`, err);
      });
    }

    return {
      data: entry.data,
      isStale,
      hit: true,
    };
  }

  /**
   * Invalidate specific tag (e.g. 'articles', 'category:জাতীয়')
   */
  public invalidateByTag(tag: string): number {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    return invalidatedCount;
  }

  /**
   * Purge entire ISR cache
   */
  public clear(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }
}

// Global Singleton instances
export const globalArticleIndex = new ArticleQueryIndex();
export const globalIsrCache = new IsrCacheManager(60); // 60s ISR revalidation window
