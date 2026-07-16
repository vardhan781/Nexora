import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Moon, Sun, LogOut, User, X, Search, Menu } from "lucide-react";
import { SearchBar } from "./SearchBar";

const Header = ({ onMenuClick, isMobile }) => {
  const { user } = useAuth();
  const notificationsRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const getRoleName = (role) => {
    if (!role) return "User";
    if (typeof role === "string") return role;
    return role.roleName || role.roleCode || "User";
  };

  const displayUser = user;

  const fullName = displayUser
    ? `${displayUser.firstName || ""} ${displayUser.lastName || ""}`.trim()
    : "User";

  const initials = displayUser
    ? `${displayUser.firstName?.[0] || ""}${displayUser.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  const userRole = getRoleName(displayUser?.role);

  const notifications = [
    { id: 1, title: "New user registered", time: "2 min ago", read: false },
    { id: 2, title: "Leave request pending", time: "1 hour ago", read: false },
    {
      id: 3,
      title: "System update completed",
      time: "3 hours ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  return (
    <header className="flex bg-sidebar h-18 items-center justify-between border-b border-sidebar-border px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-all duration-200"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        <SearchBar
          className="w-70 hidden md:block"
          onSearch={handleSearch}
          placeholder="Search employees, departments"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-all duration-200 cursor-pointer"
        >
          {isDarkMode ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-all duration-200 cursor-pointer">
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-md cursor-pointer hover:shadow-md transition-all duration-200">
            {initials}
          </div>

          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
