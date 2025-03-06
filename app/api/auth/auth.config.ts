import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Define the UserPermissions type
export type UserPermissions = {
  canChat: boolean;
  canSearch: boolean;
  canPredict: boolean;
  isAdmin: boolean;
};


// Declare module for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      permissions: UserPermissions;
    };
  }
}

// Declare module for next-auth/jwt
declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    email: string;
    permissions: UserPermissions;
  }
}

// Define default permissions
const defaultPermissions: UserPermissions = {
  canChat: false,
  canSearch: false,
  canPredict: false,
  isAdmin: false,
};

// Define getUserPermissions function
async function getUserPermissions(email: string): Promise<UserPermissions> {
  // Example: admin users get all permissions
  if (email === "rob@rdtempest.com") {
    return {
      canChat: true,
      canSearch: true,
      canPredict: true,
      isAdmin: true,
    };
  }
  else if (email === "rdtempest@gmail.com") {
    return {
      canChat: false,
      canSearch: true,
      canPredict: true,
      isAdmin: false,
    };
  }
  else if (email === "jasetoothless@gmail.com") {
    return {    
      canChat: false,
      canSearch: false,
      canPredict: true,
      isAdmin: false,
    };
  } 
  else {
  // Default users get basic permissions
  return {
    canChat: false,
    canSearch: false,
    canPredict: false,
    isAdmin: false,
  };
  }
}

// Define NextAuth options
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }): Promise<boolean> {
      return !!user.email;
    },
    async jwt({ token, user }: { token: JWT; user: User }): Promise<JWT> {
      if (user?.email) {
        const permissions = await getUserPermissions(user.email);
        token.permissions = permissions;
        token.email = user.email;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.id = token.sub;
        session.user.email = token.email;
        session.user.permissions = token.permissions || defaultPermissions;
      }
      return session;
    },
  },
};