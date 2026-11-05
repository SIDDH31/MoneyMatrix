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
  const db = mongoose.connection.db;
  if (!db) return null;
  const cleanEmail = email.trim().toLowerCase();
  return db.collection('users').findOne({
    $or: [
      { email: cleanEmail },
      { email: email.trim() },
      { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
    ],
  });
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
