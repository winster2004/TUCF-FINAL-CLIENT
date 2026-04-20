import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { safeParseJSON } from "../lib/safeJson";
import { getStoredPlan, isPremiumPlan } from "../lib/plan";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PAID_USERS_KEY = "tucf-paid-users";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserId = (email: string) =>
    email
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user";

  const getStoredRole = (email: string) => {
    const currentPlan = getStoredPlan();
    if (isPremiumPlan(currentPlan)) {
      return "SUBSCRIBED";
    }

    const paidUsers = safeParseJSON<Record<string, { role?: string }>>(
      localStorage.getItem(PAID_USERS_KEY) || "{}",
      "auth.paidUsers",
    );

    if (paidUsers?.[email.toLowerCase()]?.role === "SUBSCRIBED") {
      return "SUBSCRIBED";
    }

    return "USER";
  };

  const syncAuthFromStorage = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      const parsedUser = safeParseJSON<User>(userData, "auth.userData");
      if (parsedUser) {
        setUser({
          ...parsedUser,
          role: getStoredRole(parsedUser.email),
        });
        return;
      }
    }

    setUser(null);
  };

  useEffect(() => {
    syncAuthFromStorage();

    const onStorageChange = () => {
      syncAuthFromStorage();
    };

    window.addEventListener("storage", onStorageChange);
    window.addEventListener("auth-changed", onStorageChange);

    setLoading(false);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("auth-changed", onStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      void password;
      // TODO: Replace with actual API call
      const normalizedEmail = email.trim().toLowerCase();
      const nameFromEmail = normalizedEmail.split("@")[0];
      const mockUser = {
        id: createUserId(normalizedEmail),
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: normalizedEmail,
        role: getStoredRole(normalizedEmail),
        avatar: `https://ui-avatars.com/api/?name=${nameFromEmail}&background=3B82F6&color=fff`,
      };

      localStorage.setItem("authToken", "mock-token");
      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch {
      throw new Error("Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      void password;
      // TODO: Replace with actual API call
      const normalizedEmail = email.trim().toLowerCase();
      const mockUser = {
        id: createUserId(normalizedEmail),
        name,
        email: normalizedEmail,
        role: getStoredRole(normalizedEmail),
        avatar: `https://ui-avatars.com/api/?name=${name}&background=3B82F6&color=fff`,
      };

      localStorage.setItem("authToken", "mock-token");
      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
