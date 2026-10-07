import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_SECRET || "mock-google-secret",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "mock-github-id",
      clientSecret: process.env.GITHUB_SECRET || "mock-github-secret",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = "researcher"; 
        // @ts-ignore
        session.user.institution = "Polar Science Network";
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "polara-super-secret-key-12345",
})

export { handler as GET, handler as POST }
