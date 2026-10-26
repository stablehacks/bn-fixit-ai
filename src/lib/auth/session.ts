import { DEMO_ORG_ID, DEMO_ORG_NAME } from '../db/seed-data';
import { UserMembership } from '../types';

export interface AuthContext {
  userId: string;
  organizationId: string;
  organizationName: string;
  role: 'owner' | 'manager' | 'operator' | 'viewer';
  userName: string;
  userEmail: string;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

export const DEFAULT_DEMO_USER: AuthContext = {
  userId: 'user_alex_morgan',
  organizationId: DEMO_ORG_ID,
  organizationName: DEMO_ORG_NAME,
  role: 'manager',
  userName: 'Alex Morgan',
  userEmail: 'alex.morgan@oakridge-pm.mock',
  isAuthenticated: true,
  isDemoMode: true,
};

export const SECONDARY_TEST_ORG_USER: AuthContext = {
  userId: 'user_bob_rival',
  organizationId: 'org_metro_properties',
  organizationName: 'Metro Urban Real Estate (Rival Org)',
  role: 'manager',
  userName: 'Bob Rival',
  userEmail: 'bob@metrourban.mock',
  isAuthenticated: true,
  isDemoMode: true,
};

/**
 * Server-side authorization verification
 * Throws error or returns 403 if target entity's organization doesn't match authenticated org
 */
export function assertAuthorized(auth: AuthContext, entityOrgId: string, entityDescription = 'Resource') {
  if (!auth.isAuthenticated) {
    const error = new Error('Unauthorized: Authentication required.');
    (error as unknown as { status: number }).status = 401;
    throw error;
  }

  if (auth.organizationId !== entityOrgId) {
    const error = new Error(`Forbidden: Access denied to ${entityDescription} belonging to another organization.`);
    (error as unknown as { status: number }).status = 403;
    throw error;
  }
}

/**
 * Resolves current server request auth context
 * Reads Clerk session if keys present; otherwise falls back to active session / demo context
 */
export async function getAuthContextFromRequest(req?: Request): Promise<AuthContext> {
  // Check custom organization header if passed in test or demo switch
  if (req) {
    const orgHeader = req.headers.get('x-organization-id');
    if (orgHeader && orgHeader.trim() !== '') {
      if (orgHeader === SECONDARY_TEST_ORG_USER.organizationId) {
        return SECONDARY_TEST_ORG_USER;
      }
      return {
        ...DEFAULT_DEMO_USER,
        organizationId: orgHeader,
        organizationName: `Org ${orgHeader}`,
      };
    }
  }

  // Check Clerk environment variables
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (clerkSecret && !clerkSecret.includes('placeholder')) {
    try {
      // Dynamic import to prevent crash if Clerk isn't configured with real keys
      const { auth, currentUser } = await import('@clerk/nextjs/server');
      const session = await auth();
      if (session && session.userId) {
        const user = await currentUser();
        const orgId = session.orgId || `org_${session.userId}`;
        const orgName = session.orgSlug || `${user?.firstName || 'User'}'s Portfolio`;
        return {
          userId: session.userId,
          organizationId: orgId,
          organizationName: orgName,
          role: (session.orgRole as unknown as 'manager') || 'manager',
          userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Property Manager',
          userEmail: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
          isAuthenticated: true,
          isDemoMode: false,
        };
      }
    } catch {
      // Fallback to demo mode if Clerk auth call fails
    }
  }

  // Default to reliable demo mode context
  return DEFAULT_DEMO_USER;
}
