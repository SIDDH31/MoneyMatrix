import NextAuth from 'next-auth';
import { authConfig } from './src/lib/auth.config';

const { auth } = NextAuth(authConfig);

export async function proxy(request: Request) {
  // next-auth v5 .auth() acts as middleware — invoke it and return its response
  const response = await (auth as any)(request);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
