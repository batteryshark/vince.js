import { prisma } from './db';

/**
 * Store session in database (optional - for session tracking)
 */
export async function createSession(sessionId: string): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await prisma.adminSession.create({
      data: {
        sessionId,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    // Don't throw - session tracking is optional
  }
}

/**
 * Validate session exists in database
 */
export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return false;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.adminSession.delete({
        where: { sessionId },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Remove session from database
 */
export async function removeSession(sessionId: string): Promise<void> {
  try {
    await prisma.adminSession.delete({
      where: { sessionId },
    });
  } catch (error) {
    console.error('Error removing session:', error);
    // Don't throw - cleanup is best effort
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.adminSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}