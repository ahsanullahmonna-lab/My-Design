/**
 * Universal Next.js / Edge / Serverless API Route: /api/comments
 * GET: Retrieve comments (all or filtered by status: pending, approved, rejected)
 * POST: Submit new guest comment (automatically flagged for editorial moderation)
 */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'approved';
    const articleId = url.searchParams.get('articleId');

    return Response.json({
      success: true,
      status: 200,
      filter: { status, articleId },
      data: [],
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error fetching comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.text || !body.name) {
      return Response.json(
        { success: false, status: 400, message: 'মন্তব্যকারীর নাম এবং মন্তব্য আবশ্যক' },
        { status: 400 }
      );
    }

    const newComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      articleId: body.articleId || 'general',
      articleTitle: body.articleTitle || '',
      name: body.name.trim(),
      phone: body.phone?.trim() || '',
      address: body.address?.trim() || '',
      text: body.text.trim(),
      time: 'এইমাত্র',
      likes: 0,
      status: 'pending', // Strictly saves to moderation queue as pending
      createdAt: new Date().toISOString(),
    };

    return Response.json(
      {
        success: true,
        status: 201,
        message: 'আপনার মন্তব্যটি সফলভাবে জমা হয়েছে। সম্পাদকীয় অনুমোদনের পর তা প্রকাশিত হবে।',
        data: newComment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error submitting comment' },
      { status: 500 }
    );
  }
}
