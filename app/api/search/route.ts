import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/auth.config";
import { Message } from '@/types/message'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  // Get the session
  const session = await getServerSession(authOptions)

  console.log('saearch_route.ts Session:', session)

  
  // Check if user is authenticated
  if (!session?.user) {
    console.log(`***** User(${session}) is not authenticated`)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if user has search permission
  if (!session.user.permissions?.canSearch) {
    console.log(`***** User(${session}) is not authorized to search`);
    console.log("session.user:",session.user);
    
    console.log(`***** session.user(${session.user}) is not authorized to search`);
    console.log(`***** session.user.permissions(${session.user.permissions}) is not authorized to search`);
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  // Access user details
  const userId = session.user.id
  const userEmail = session.user.email
  const userName = session.user.name
  console.log('User making Search request:', {
    id: userId,
    name: userName,
    email: userEmail,
    permissions: session.user.permissions
  })

  try {
    const { messages } = await req.json()
    const robmsg=messages.map((message: Message) => ({
      role: message.role,
      content: message.content,
    }))
    console.log('Messages:', robmsg);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: robmsg,
    })

    return NextResponse.json({
      message: response.choices[0].message.content,
    })

  } catch (error) {
    console.error('*******Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}


