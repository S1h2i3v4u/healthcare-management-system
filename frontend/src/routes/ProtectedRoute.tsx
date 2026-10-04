//import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Wraps any route that requires SOME authenticated user, regardless of
// role. Redirects to /login if there's no session — used as a parent
// route wrapping all the patient/doctor/admin route groups.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}