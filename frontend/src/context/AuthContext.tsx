"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export interface AuthUser {
  role: "admin" | "scrutiny_officer" | "institution";
  user_name: string;
  institution_id?: number | null;
  institution_name?: string | null;
  aicte_id?: string | null;
  access_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAsDemo: (role: "admin" | "institution", instIndex?: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fdr_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password = "demo123") => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const loggedUser: AuthUser = {
        role: res.role,
        user_name: res.user_name,
        institution_id: res.institution_id,
        institution_name: res.institution_name,
        aicte_id: res.aicte_id,
        access_token: res.access_token,
      };

      setUser(loggedUser);
      localStorage.setItem("fdr_auth_user", JSON.stringify(loggedUser));
      localStorage.setItem("fdr_auth_token", loggedUser.access_token);

      if (loggedUser.role === "institution") {
        router.push("/institution/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: "admin" | "institution", instIndex = 0) => {
    let email = "admin@aicte-india.org";
    if (role === "institution") {
      email = instIndex === 0 ? "delhi@college.edu.in" : "aryabhatta@college.edu.in";
    }
    await login(email, "demo123");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fdr_auth_user");
    localStorage.removeItem("fdr_auth_token");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
