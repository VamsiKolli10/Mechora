import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  logout as logoutAction,
  selectAuth,
} from "@/features/auth/authSlice";

const useAuth = ({ redirectTo = null, protectedOnly = false } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector(selectAuth);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (
      protectedOnly &&
      status === "succeeded" &&
      !user &&
      redirectTo
    ) {
      navigate(redirectTo);
    }
  }, [protectedOnly, redirectTo, status, user, navigate]);

  const logout = useMemo(
    () => () => {
      dispatch(logoutAction());
    },
    [dispatch]
  );

  return {
    user,
    error,
    logout,
    loading: status === "idle" || status === "loading",
    isAuthenticated: Boolean(user),
  };
};

export default useAuth;
