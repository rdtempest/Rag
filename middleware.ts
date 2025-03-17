import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Define your route permissions mapping
    const routePermissions: Record<string, string> = {
      '/search': 'canSearch',
      '/chat': 'canChat',
      '/age': 'canPredict'
      // Add more routes and their required permissions here
    }

    // Check if the current path requires permissions
    const requiredPermission = routePermissions[pathname]
    
    if (requiredPermission) {
      // Check if user has the required permission
      const userPermissions = token?.permissions as Record<string, boolean> || {}
      
      if (!userPermissions[requiredPermission]) {
        // Redirect to home page if user doesn't have permission
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/",
    },
  }
)

// Update the matcher to include both your existing paths and permission-protected paths
export const config = {
  matcher: [
    // Your existing matcher for authentication
    "/((?!api|_next|fonts|images|$).*)",
    // Add specific routes that need permission checks
    "/search",
    "/chat",
    "/age"
  ]
}
