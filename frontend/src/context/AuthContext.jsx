import { createContext, useContext, useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      setLoading(true);
      // Synchronize Clerk user profile & MongoDB token balance
      authService
        .getProfile()
        .then((res) => {
          if (isMounted && res.data?.data?.user) {
            setUser(res.data.data.user);
          }
        })
        .catch(() => {
          // Fallback to local Clerk user representation if backend sync pending
          if (isMounted) {
            setUser({
              name: clerkUser.fullName || clerkUser.firstName || "Developer",
              email: clerkUser.primaryEmailAddress?.emailAddress || "",
              avatar: clerkUser.imageUrl,
              tokens: 0,
            });
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, clerkUser]);

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    queryClient.clear();
    await signOut();
  };

  const refetchUser = async () => {
    try {
      const res = await authService.getProfile();
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
      }
    } catch (error) {
      console.error("Failed to refetch user", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || !isLoaded,
        isSignedIn,
        logout,
        refetchUser,
        clerkUser,
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

