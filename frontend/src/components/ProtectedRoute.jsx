import { Navigate } from "react-router-dom";
import { getUser } from "../services/auth";

export default function ProtectedRoute({ children, role }) {
  const user = getUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}