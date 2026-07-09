import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authService
        .getProfile()
        .then((res) => {
          // Verify that response is in standard format { data: { success: true, message: "...", data: { user } } }
          setUser(res.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem("token", token);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      const { token, user: registeredUser } = res.data.data;
      localStorage.setItem("token", token);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    queryClient.clear();
  };

  const refetchUser = async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data.data.user);
    } catch (error) {
      console.error("Failed to refetch user", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
