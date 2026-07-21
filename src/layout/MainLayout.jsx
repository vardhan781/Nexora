import { useState, useEffect } from "react";
import { Users, LogOut } from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { AlertDialog } from "../components/AlertDialog";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MainLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const { user, menus, logout } = useAuth();

  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dropdownItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: Users,
      onClick: () => console.log("Profile clicked"),
    },
    { id: "divider-1", type: "divider" },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      onClick: handleLogoutClick,
      destructive: true,
    },
  ];

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      <div className="hidden md:block">
        <Sidebar
          user={{
            name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
            role: user?.role?.roleName || "",
            avatar:
              `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase(),
            online: true,
          }}
          menus={menus}
          dropdownItems={dropdownItems}
        />
      </div>

      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
            isMobile && isSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "pointer-events-none opacity-0"
          }`}
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-dvh transform transition-transform duration-300 ease-in-out ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "hidden"
        }`}
      >
        <Sidebar
          user={{
            name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
            role: user?.role?.roleName || "",
            avatar:
              `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase(),
          }}
          menus={menus}
          dropdownItems={dropdownItems}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isMobile={isMobile}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
      <AlertDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Logout"
        description="Are you sure, want to end this login session ?"
        cancelText="Cancel"
        confirmText="Logout"
        onConfirm={handleConfirmLogout}
        variant="destructive"
      />
    </div>
  );
};

export default MainLayout;
