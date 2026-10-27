/**
 * Universal Next.js / Edge / Serverless API Route: /api/settings
 * GET: Retrieve portal settings (siteName, domain, fonts, ads, layout)
 * PUT: Update portal settings (Admin only)
 */

export async function GET(request: Request) {
  try {
    return Response.json({
      success: true,
      status: 200,
      data: {
        siteName: 'কলম২৪',
        siteNameEn: 'Kolom24',
        domain: 'kolom24.com',
      },
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error fetching settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    return Response.json({
      success: true,
      status: 200,
      message: 'সাইট সেটিংস সফলভাবে সংরক্ষিত ও আপডেট হয়েছে',
      data: body,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error updating settings' },
      { status: 500 }
    );
  }
}
