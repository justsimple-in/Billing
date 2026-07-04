import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUsersCollection } from "@/lib/collections/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
  async jwt({ token, profile }) {
    if (profile?.email) {
      const users = await getUsersCollection();

      let user = await users.findOne({
        email: profile.email,
      });

      if (!user) {
        const result = await users.insertOne({
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        });

        token.userId = result.insertedId.toString();
      } else {
        token.userId = user._id.toString();
      }

      token.email = profile.email;
      token.name = profile.name;
      token.picture = profile.picture;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.userId as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.picture as string;
    }

    return session;
  },
},

  secret: process.env.AUTH_SECRET,
});