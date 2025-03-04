import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/auth.config"  // Add this import



export async function GET(req: Request) {

  // Get the session
  const session = await getServerSession(authOptions)

  console.log('age_route.ts Session:', session)

  
  // Check if user is authenticated
  if (!session?.user) {
    console.log(`***** age User(${session}) is not authenticated`)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if user has chat permission
  if (!session.user.permissions?.canPredict) {
    console.log(`*age**** User(${session}) is not authorized to chat`);
    console.log("***age ***session.user:",session.user);
    
    console.log(`***age *** session.user(${session.user}) is not authorized to chat`);
    console.log(`***age *** session.user.permissions(${session.user.permissions}) is not authorized to chat`);
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  // Access user details
  const userId = session.user.id
  const userEmail = session.user.email
  const userName = session.user.name

  console.log('age_route.ts User:', userId, userEmail, userName);
  
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name')
    console.log('Name:', name);

    if (!name) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.agify.io/?name=${name}`)
    const ageData = await response.json()
    const robData = ageData
    robData.message = "Hello "+name+"! Your age is "+ageData.age;

    return NextResponse.json({
      robInfo: robData,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the age data' },
      { status: 500 }
    )
  }
}
