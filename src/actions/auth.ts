'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { connectDB } from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function loginUser(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' };
        default:
          return { error: 'Something went wrong!' };
      }
    }
    throw error;
  }
}

export async function registerUser(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return { error: 'Database unavailable.' };

  const usersCollection = db.collection('users');

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  await usersCollection.insertOne({
    name,
    email,
    password: hashedPassword,
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { success: 'User created! Please log in.' };
}
