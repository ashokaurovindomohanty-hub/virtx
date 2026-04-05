import { type ReactNode, createContext, useContext, useState } from "react";

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <AuthContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
