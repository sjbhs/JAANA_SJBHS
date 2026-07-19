export {
  adminEmailAddress,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminAuthConfigurationError,
  getAdminSessionFromCookie,
  isAdminAuthConfigured,
  isAdminSessionValid,
  verifyAdminCredentials
} from "../../server/lib/adminAuth.js";
export type { AdminSession } from "../../server/lib/adminAuth.js";
