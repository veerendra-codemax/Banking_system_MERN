import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
