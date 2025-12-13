/**
 * Authentication utilities for server-side session management
 * @module lib/auth
 */

import { auth } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current authenticated user from the session
 * @returns {Promise<Object|undefined>} User object if authenticated, undefined otherwise
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(user.email);
 * }
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Get the current authenticated user, throwing an error if not authenticated
 * Use this in API routes where authentication is required
 * @returns {Promise<Object>} User object
 * @throws {Error} If user is not authenticated
 * @example
 * try {
 *   const user = await getSessionUser();
 *   // User is guaranteed to be authenticated here
 * } catch (error) {
 *   // Handle unauthorized access
 * }
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}
