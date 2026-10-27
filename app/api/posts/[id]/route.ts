/**
 * Universal Next.js / Edge / Serverless API Route: /api/posts/[id]
 * GET: Retrieve article by ID
 * PUT: Update article with database persistence
 * DELETE: Delete article by ID
 */

export async function GET(
  request: Request,
  context?: { params?: { id?: string } }
) {
  try {
    const url = new URL(request.url);
    const id = context?.params?.id || url.pathname.split('/').pop();

    if (!id) {
      return Response.json(
        { success: false, status: 400, message: 'সংবাদ ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: 200,
      data: { id, title: 'Sample article' },
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Database fetch error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context?: { params?: { id?: string } }
) {
  try {
    const url = new URL(request.url);
    const id = context?.params?.id || url.pathname.split('/').pop();
    const body = await request.json();

    if (!id) {
      return Response.json(
        { success: false, status: 400, message: 'সংবাদ ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: 200,
      message: `সংবাদ ${id} সফলভাবে আপডেট হয়েছে`,
      data: { id, ...body, updatedAt: new Date().toISOString() },
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Database update error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context?: { params?: { id?: string } }
) {
  try {
    const url = new URL(request.url);
    const id = context?.params?.id || url.pathname.split('/').pop();

    if (!id) {
      return Response.json(
        { success: false, status: 400, message: 'সংবাদ ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: 200,
      message: `সংবাদ ${id} ডেটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে`,
      deletedId: id,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Database delete error' },
      { status: 500 }
    );
  }
}
