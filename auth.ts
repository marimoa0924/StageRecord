import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    session({ session }) {
      return session;
    },
  },
});

export function isOwner(email: string | null | undefined): boolean {
  return !!email && email === process.env.OWNER_EMAIL;
}
