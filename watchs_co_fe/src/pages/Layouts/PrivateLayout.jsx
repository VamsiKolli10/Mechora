import { Outlet, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const PrivateLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or a spinner component
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateLayout;
