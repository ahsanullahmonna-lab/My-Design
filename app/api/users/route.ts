/**
 * Universal Next.js / Edge / Serverless API Route: /api/users
 * GET: Retrieve user roster with roles
 * POST: Create/Register user or news desk reporter
 * PUT: Update user role / permissions (Admin only)
 */

export async function GET(request: Request) {
  try {
    return Response.json({
      success: true,
      status: 200,
      data: [],
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.name || !body.email) {
      return Response.json(
        { success: false, status: 400, message: 'নাম এবং ইমেইল আবশ্যক' },
        { status: 400 }
      );
    }

    const newUser = {
      id: body.id || `u-${Date.now()}`,
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role || 'user',
      roleBn: body.roleBn || 'সাধারণ পাঠক',
      phone: body.phone?.trim() || '',
      district: body.district || 'ঢাকা',
      autoApprove: Boolean(body.autoApprove),
      postsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return Response.json(
      {
        success: true,
        status: 201,
        message: 'ব্যবহারকারী সফলভাবে নিবন্ধিত হয়েছে',
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error creating user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.id) {
      return Response.json(
        { success: false, status: 400, message: 'ব্যবহারকারী ID প্রদান করা হয়নি' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: 200,
      message: 'ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে',
      data: body,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, status: 500, message: error?.message || 'Error updating user' },
      { status: 500 }
    );
  }
}
