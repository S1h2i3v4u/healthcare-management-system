//import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface RoleRouteProps {
  allowedRoles: Role[];
}

// Layered ON TOP of ProtectedRoute (nested route) — this only checks ROLE,
// assuming authentication was already verified by the parent. Kept as two
// separate components rather than one combined check, mirroring the
// backend's own separation of concerns: @PreAuthorize("hasRole(...)")
// only ever runs after Spring Security's filter chain has already
// established the request is authenticated. Same two-layer idea, same
// reason: authentication and authorization are different questions.
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to a generic "not authorized" landing rather than back to
    // login — the user IS logged in, they're just in the wrong role's
    // area. Sending them to /login would be confusing (they're not
    // logged out). Redirecting to "/" and letting the home page route
    // them to their own correct dashboard is simpler than building a
    // dedicated 403 page for this MVP.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}