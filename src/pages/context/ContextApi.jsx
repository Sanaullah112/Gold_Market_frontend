import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

// CREATE CONTEXT
const AuthContext = createContext();

// PROVIDER
export const AuthProvider = ({ children }) => {
  // =========================
  // AUTH STATES
  // =========================

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const [role, setRole] = useState(
    localStorage.getItem("role") || null
  );

  // USER STATE
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser &&
        savedUser !== "null" &&
        savedUser !== "undefined"
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.log("User parse error:", error);
      return null;
    }
  });

  // SHOP ID STATE
  const [shopId, setShopId] = useState(() => {
    const savedShopId = localStorage.getItem("shopId");

    if (
      savedShopId &&
      savedShopId !== "null" &&
      savedShopId !== "undefined"
    ) {
      return savedShopId;
    }

    return null;
  });

  // =========================
  // THEME STATE
  // =========================

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // APPLY THEME
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove(
      "light",
      "dark",
      "theme-blue",
      "theme-emerald"
    );

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "blue") {
      root.classList.add("theme-blue");
    } else if (theme === "emerald") {
      root.classList.add("theme-emerald");
    } else {
      root.classList.add("light");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // CHANGE THEME
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // =========================
  // LOGIN
  // =========================

  const login = (
    newToken,
    newRole,
    userData,
    newShopId = null
  ) => {
    setToken(newToken);
    setRole(newRole);
    setUser(userData);

    // FINAL SHOP ID
    const finalShopId =
      newShopId ||
      userData?.shopRateId ||
      userData?.shopId ||
      null;

    setShopId(finalShopId);

    // SAVE TO LOCAL STORAGE
    localStorage.setItem("token", newToken);

    localStorage.setItem("role", newRole);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    if (finalShopId) {
      localStorage.setItem("shopId", finalShopId);
    } else {
      localStorage.removeItem("shopId");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setShopId(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("shopId");

    window.location.href = "/login";
  };

  // =========================
  // CONTEXT VALUES
  // =========================

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        shopId,

        setUser,

        isLoggedIn: !!token,

        isSuperAdmin:
          !!token &&
          (role === "super-admin" ||
            role === "superadmin"),

        isAdmin:
          !!token &&
          role === "admin",

        isUser:
          !!token &&
          role === "user",

        login,
        logout,

        theme,
        changeTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM HOOK
export const useAuth = () => {
  return useContext(AuthContext);
};