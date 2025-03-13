import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/auth.config"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { provider } = await req.json();
    // Store the setting in your database associated with the user
    // For now, we'll use cookies as a simple solution
    const response = NextResponse.json({ success: true });
    response.cookies.set('preferred-chat-provider', provider, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 31536000 // 1 year
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get the cookie value
  const cookies = req.headers.get('cookie');
  const provider = cookies?.split(';')
    .find(c => c.trim().startsWith('preferred-chat-provider='))
    ?.split('=')[1] || 'openai';

  return NextResponse.json({ provider });
}
