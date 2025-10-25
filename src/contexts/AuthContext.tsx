import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user for demo
const DUMMY_USER = {
  id: "1",
  email: "demo@pos.com",
  name: "Demo User",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pos_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    // Dummy authentication - accept any email/password
    await new Promise((resolve) => setTimeout(resolve, 500));
    const loggedInUser = { ...DUMMY_USER, email };
    setUser(loggedInUser);
    localStorage.setItem("pos_user", JSON.stringify(loggedInUser));
    return true;
  };

  const register = async (email: string, password: string, name: string) => {
    // Dummy registration
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser = { id: "1", email, name };
    setUser(newUser);
    localStorage.setItem("pos_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pos_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
