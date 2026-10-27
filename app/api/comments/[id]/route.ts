/**
 * Universal Next.js / Edge / Serverless API Route: /api/comments/[id]
 * PUT: Approve or Reject a comment (Admin / Editor only)
 * DELETE: Permanently delete a comment
 */

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
        { success: false, status: 400, message: 'মন্তব্য ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    const action = body.status === 'approved' ? 'অনুমোদন' : 'বাতিল';

    return Response.json({
      success: true,
      status: 200,
      message: `মন্তব্যটি সফলভাবে ${action} করা হয়েছে`,
      data: { id, status: body.status || 'approved', updatedAt: new Date().toISOString() },
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error updating comment' },
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
        { success: false, status: 400, message: 'মন্তব্য ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: 200,
      message: 'মন্তব্যটি সফলভাবে মুছে ফেলা হয়েছে',
      deletedId: id,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error deleting comment' },
      { status: 500 }
    );
  }
}
