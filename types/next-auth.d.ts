import NextAuth from "next-auth"
import { UserPermissions } from "@/lib/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      permissions: UserPermissions
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    permissions: UserPermissions
  }
}