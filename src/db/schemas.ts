/**
 * ============================================================================
 * Enterprise News Portal - Database Schema Adjustments (Prisma / MongoDB / SQL)
 * ============================================================================
 * 
 * Features Supported:
 * 1. Cloud Storage & CDN Integration (AWS S3 & Cloudinary)
 * 2. News Scheduling (Future publish date & time)
 * 3. Auto-Expiring / Temporary News (Auto-unpublish time)
 * 4. Backdating Support (Custom past date & historical time)
 * 5. Calendar Archive Indexing (Fast date-based B-Tree querying)
 * 
 * ============================================================================
 */

// ============================================================================
// 1. PRISMA SCHEMA DEFINITION (schema.prisma)
// ============================================================================
export const PRISMA_SCHEMA_DEFINITION = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ArticleStatus {
  DRAFT
  PENDING
  SCHEDULED
  PUBLISHED
  EXPIRED
  REJECTED
  ARCHIVED
}

enum PublishMode {
  IMMEDIATE
  SCHEDULED
  BACKDATED
}

enum StorageProvider {
  LOCAL
  CLOUDINARY
  AWS_S3
}

model Article {
  id              String         @id @default(cuid())
  slug            String         @unique
  title           String
  titleEn         String?
  shoulder        String?
  subHeadline     String?
  excerpt         String         @db.Text
  content         String         @db.Text
  category        String
  categoryEn      String?
  author          String
  authorAvatar    String?
  authorRole      String?
  district        String?        @default("ঢাকা")
  source          String?        @default("নিজস্ব প্রতিবেদক")

  // Media & Cloud CDN Storage
  imageUrl        String
  imageCaption    String?
  storageProvider StorageProvider @default(LOCAL)
  cdnOptimizedUrl String?
  cdnPublicId     String?        // Cloudinary Public ID or S3 Object Key
  mediaSize       Int?           // bytes

  // Editorial & Series
  seriesName      String?
  seriesPart      String?
  tags            String[]
  views           Int            @default(0)
  readTime        String         @default("৩ মিনিট")
  isLead          Boolean        @default(false)
  isBreaking      Boolean        @default(false)
  isTrending      Boolean        @default(false)
  trendRank       Int?

  // Publication, Scheduling & Backdating
  status          ArticleStatus  @default(PUBLISHED)
  publishMode     PublishMode    @default(IMMEDIATE)
  publishedAt     DateTime       @default(now())  // Actual display date (supports backdating)
  scheduledAt     DateTime?                       // Future scheduled date-time
  expiresAt       DateTime?                       // Auto-expire / unpublish date-time
  isAutoExpire    Boolean        @default(false)
  isBackdated     Boolean        @default(false)

  // SEO & Auditing
  seoFocusKeyword String?
  submittedBy     String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // Indexes for calendar archive and scheduling queries
  @@index([publishedAt])
  @@index([status, publishedAt])
  @@index([scheduledAt])
  @@index([expiresAt])
  @@index([category])
  @@index([seriesName])
}

model CloudStorageConfig {
  id               String          @id @default(cuid())
  provider         StorageProvider @default(LOCAL)
  isActive         Boolean         @default(true)

  // Cloudinary Config
  cloudinaryCloudName   String?
  cloudinaryApiKey      String?
  cloudinaryApiSecret   String?
  cloudinaryUploadPreset String?
  cloudinaryAutoWebp    Boolean    @default(true)
  cloudinaryQuality     String?    @default("auto:good")

  // AWS S3 Config
  s3AccessKeyId    String?
  s3SecretAccessKey String?
  s3BucketName     String?
  s3Region         String?         @default("ap-south-1")
  s3CdnDomain      String?         // e.g. "https://cdn.newsportal.com"
  s3Endpoint       String?

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}
`;

// ============================================================================
// 2. MONGODB / MONGOOSE SCHEMA DEFINITION (mongoose.ts)
// ============================================================================
export const MONGOOSE_SCHEMA_DEFINITION = `
import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleDocument extends Document {
  title: string;
  slug: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  storageProvider: 'LOCAL' | 'CLOUDINARY' | 'AWS_S3';
  cdnOptimizedUrl?: string;
  cdnPublicId?: string;
  status: 'published' | 'pending' | 'scheduled' | 'expired' | 'rejected';
  publishMode: 'immediate' | 'scheduled' | 'backdated';
  publishedAt: Date;
  scheduledAt?: Date;
  expiresAt?: Date;
  isAutoExpire: boolean;
  isBackdated: boolean;
  seriesName?: string;
  seriesPart?: string;
  views: number;
}

const ArticleSchema = new Schema<IArticleDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  category: { type: String, required: true, index: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  storageProvider: { type: String, enum: ['LOCAL', 'CLOUDINARY', 'AWS_S3'], default: 'LOCAL' },
  cdnOptimizedUrl: { type: String },
  cdnPublicId: { type: String },
  status: { type: String, enum: ['published', 'pending', 'scheduled', 'expired', 'rejected'], default: 'published', index: true },
  publishMode: { type: String, enum: ['immediate', 'scheduled', 'backdated'], default: 'immediate' },
  publishedAt: { type: Date, default: Date.now, index: true }, // Key for Calendar Archive
  scheduledAt: { type: Date, index: true },                   // For Cron job: scheduled publishing
  expiresAt: { type: Date, index: true },                     // For Cron job: auto unpublish
  isAutoExpire: { type: Boolean, default: false },
  isBackdated: { type: Boolean, default: false },
  seriesName: { type: String, index: true },
  seriesPart: { type: String },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound Index for High-Speed Calendar Date Lookups
ArticleSchema.index({ status: 1, publishedAt: -1 });

export const ArticleModel = mongoose.models.Article || mongoose.model<IArticleDocument>('Article', ArticleSchema);
`;

// ============================================================================
// 3. POSTGRESQL / MYSQL DDL SQL DEFINITION (schema.sql)
// ============================================================================
export const SQL_SCHEMA_DEFINITION = `
-- ============================================================================
-- SQL Schema Migration: Articles with Scheduling, Auto-Expire, Backdating & CDN
-- ============================================================================

CREATE TYPE article_status_enum AS ENUM ('published', 'pending', 'scheduled', 'expired', 'rejected');
CREATE TYPE publish_mode_enum AS ENUM ('immediate', 'scheduled', 'backdated');
CREATE TYPE storage_provider_enum AS ENUM ('local', 'cloudinary', 'aws_s3');

CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    shoulder VARCHAR(255),
    sub_headline VARCHAR(500),
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_en VARCHAR(100),
    author VARCHAR(150) NOT NULL,
    author_avatar VARCHAR(500),
    author_role VARCHAR(100),
    district VARCHAR(100) DEFAULT 'ঢাকা',
    source VARCHAR(150) DEFAULT 'নিজস্ব প্রতিবেদক',

    -- Media & CDN Storage
    image_url VARCHAR(1000) NOT NULL,
    image_caption VARCHAR(500),
    storage_provider storage_provider_enum DEFAULT 'local',
    cdn_optimized_url VARCHAR(1000),
    cdn_public_id VARCHAR(255),
    media_size_bytes INT,

    -- Editorial Series
    series_name VARCHAR(255),
    series_part VARCHAR(100),
    tags TEXT[],
    views INT DEFAULT 0,
    read_time VARCHAR(50) DEFAULT '৩ মিনিট',
    is_lead BOOLEAN DEFAULT FALSE,
    is_breaking BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,

    -- Scheduling, Auto-Expiring & Backdating
    status article_status_enum DEFAULT 'published',
    publish_mode publish_mode_enum DEFAULT 'immediate',
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Used for Calendar Archive query
    scheduled_at TIMESTAMPTZ,                        -- Future publish queue
    expires_at TIMESTAMPTZ,                          -- Auto unpublish threshold
    is_auto_expire BOOLEAN DEFAULT FALSE,
    is_backdated BOOLEAN DEFAULT FALSE,

    -- Audit & Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B-Tree Indexes for Sub-Millisecond Calendar Archive & Scheduler Lookups
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_status_published_at ON articles(status, published_at DESC);
CREATE INDEX idx_articles_scheduled ON articles(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_articles_expires ON articles(expires_at) WHERE is_auto_expire = TRUE;
CREATE INDEX idx_articles_series ON articles(series_name);

-- Cloud Storage Integration Settings Table
CREATE TABLE IF NOT EXISTS cloud_storage_settings (
    id SERIAL PRIMARY KEY,
    active_provider storage_provider_enum DEFAULT 'local',
    
    -- Cloudinary Credentials
    cloudinary_cloud_name VARCHAR(150),
    cloudinary_api_key VARCHAR(150),
    cloudinary_api_secret VARCHAR(255),
    cloudinary_upload_preset VARCHAR(150),
    cloudinary_auto_webp BOOLEAN DEFAULT TRUE,
    cloudinary_quality VARCHAR(50) DEFAULT 'auto',

    -- AWS S3 Credentials
    s3_access_key_id VARCHAR(150),
    s3_secret_access_key VARCHAR(255),
    s3_bucket_name VARCHAR(150),
    s3_region VARCHAR(50) DEFAULT 'ap-south-1',
    s3_cdn_domain VARCHAR(255),
    s3_endpoint VARCHAR(255),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
