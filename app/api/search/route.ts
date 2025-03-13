import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/auth.config";
import { sqlConnect } from '../sql/sqlConnect.js';
import { SearchRequest } from '@/components/SearchRequest';
import executeStoredProcedure from '../sql/sqlExecuteStoredProcedure';
import { Connection, TYPES } from 'tedious';


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
    console.log('***RDT*** sql request received - req.body:', req.body);
    console.log( req);
    const requestBody = await req.json();
    const userSearchRequest: SearchRequest = requestBody.searchRequest;
    console.log('***RDT*** sql request received - userSearchRequest:', userSearchRequest);
    // declare @st nvarchar(max)
    // set @st='New York City'
    // exec get_topX_matches @st,5

   // const selectQuery = `exec get_topX_matches @st,5`;

    // const selectQuery = "select count(*) as DocumentCount from FileStorage";
    const dbaConnection:Connection = await sqlConnect();
    const spName:string = 'get_topX_matches';
    const numMatches:number = 5;
    const params = [
      { name: 'inputText', type: TYPES.NVarChar, value: userSearchRequest.SemanticSearchPhrase } ,
      { name: 'matchesRequested ', type: TYPES.Int, value: numMatches } 
    ];
        console.log('***RDT*** sql request - calling executeStoredProcedure:', spName); 
        console.log('***RDT*** sql request - params:', params);

        const results = await executeStoredProcedure(dbaConnection, spName, params);
        console.log('***RDT*** sql request - Results:', results);
        const retJson = JSON.stringify(results);
        console.log('***RDT*** sql request completed - retJson:', retJson);
        return NextResponse.json(retJson);
  }
  catch (error) {
    console.error('Error making SQL request:', error);
    return NextResponse.json(
      { error: 'An error occurred while making the SQL request' },
      { status: 500 }
    )
  }
} 


