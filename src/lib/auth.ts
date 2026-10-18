import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { loginSchema } from './validations/auth';
import { authConfig } from './auth.config';
import { connectDB } from '@/lib/mongoose';
import mongoose from 'mongoose';

async function getUserByEmail(email: string) {
  await connectDB();
  // Auth.js stores users in the 'users' collection via the adapter.
  // We query it directly here for credential verification.
  const db = mongoose.connection.db;
  if (!db) return null;
  return db.collection('users').findOne({ email });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, { databaseName: 'moneymatrix' }),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password as string);

          if (passwordsMatch) {
            return {
              id: user._id.toString(),
              name: user.name as string,
              email: user.email as string,
              image: (user.image as string) ?? null,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
