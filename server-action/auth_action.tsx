'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HOME_ROUTE, ROOT_ROUTE, SESSION_COOKIE_NAME } from '@/lib/firebase/constants';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createSession(uid: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // One day
    path: '/',
  });

  redirect(HOME_ROUTE);
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect(ROOT_ROUTE);
}

export async function createUserIfNotExist(email: string, name: string) {
  const db = getDb();
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      // User does not exist, create a new one
      const [newUser] = await db.insert(users).values({
        email: email,
        name: name,
      }).returning();
      console.log(`New user created in database: ${newUser.email} with UID: ${newUser.uid}`);
      return newUser.uid;
    } else {
      console.log(`User already exists in database: ${existingUser.email} with UID: ${existingUser.uid}`);
      return existingUser.uid;
    }
  } catch (error) {
    console.error('Error in createUserIfNotExist:', error);
    throw new Error('Failed to create or find user in database.');
  }
}