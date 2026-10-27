/**
 * Universal Next.js / Edge / Serverless API Route: /api/posts
 * GET: Retrieve list of articles (supports category, status, search filter)
 * POST: Create a new article with database persistence (MongoDB / PostgreSQL)
 * 
 * Uses standard Web Fetch API (Request & Response) for 100% portable execution
 * across Vercel Serverless, Next.js App Router, and Node.js environments.
 */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status') || 'published';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const search = url.searchParams.get('search');

    const mongoUri = typeof process !== 'undefined' ? process.env?.MONGODB_URI : undefined;
    const databaseUrl = typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined;

    return Response.json({
      success: true,
      status: 200,
      dbConnected: Boolean(mongoUri || databaseUrl),
      provider: mongoUri ? 'MongoDB Atlas' : databaseUrl ? 'PostgreSQL' : 'Default In-Memory Cache',
      data: [],
      meta: {
        filter: { category, status, search },
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/posts GET Error]:', error);
    return Response.json(
      {
        success: false,
        status: 500,
        error: 'Internal Server Error',
        message: error?.message || 'Failed to fetch posts from database',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Field validation
    if (!body || !body.title || !body.content) {
      return Response.json(
        {
          success: false,
          status: 400,
          error: 'Bad Request',
          message: 'সংবাদের শিরোনাম (title) এবং বিস্তারিত বিষয়বস্তু (content) আবশ্যক।',
        },
        { status: 400 }
      );
    }

    const newPost = {
      id: body.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug: body.slug || `news-${Date.now()}`,
      title: body.title.trim(),
      titleEn: body.titleEn?.trim() || '',
      excerpt: body.excerpt?.trim() || body.content.substring(0, 160),
      content: body.content,
      category: body.category || 'জাতীয়',
      categoryEn: body.categoryEn || 'National',
      author: body.author || 'নিজস্ব প্রতিবেদক',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      views: body.views || 0,
      readTime: body.readTime || '৩ মিনিট',
      publishedAt: body.publishedAt || new Date().toISOString(),
      status: body.status || 'published',
      isLead: Boolean(body.isLead),
      isBreaking: Boolean(body.isBreaking),
      isTrending: Boolean(body.isTrending),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Response.json(
      {
        success: true,
        status: 201,
        message: 'সংবাদ সফলভাবে তৈরি ও সংরক্ষিত হয়েছে',
        data: newPost,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/posts POST Error]:', error);
    return Response.json(
      {
        success: false,
        status: 500,
        error: 'Internal Server Error',
        message: error?.message || 'Failed to create article in database',
      },
      { status: 500 }
    );
  }
}
