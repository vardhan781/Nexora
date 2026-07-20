import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { iconMap } from "../utils/iconMap";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const AuthContext = createContext();

const transformMenus = (menus) =>
  menus.map((menu) => ({
    id: menu._id,
    title: menu.menuName,
    path: menu.route,
    icon: menu.icon,
    children:
      menu.children?.map((child) => ({
        id: child._id,
        title: child.menuName,
        path: child.route,
        icon: child.icon,
      })) || [],
  }));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    const { token } = response.data.data;

    localStorage.setItem("token", token);

    await getCurrentUser();
    await getSidebarMenus();

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.documentElement.classList.remove("dark");

    setUser(null);
    setMenus([]);
  };

  const getCurrentUser = async () => {
    const response = await api.get("/auth/me");

    setUser(response.data.data);
  };

  const getSidebarMenus = async () => {
    try {
      const response = await api.get("/menu/sidebar");

      const transformed = transformMenus(response.data.data);

      setMenus(transformed);
    } catch (err) {
      console.log(err);
    }
  };

  const getInitialData = async () => {
    try {
      await getCurrentUser();
      await getSidebarMenus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) getInitialData();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, menus, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
