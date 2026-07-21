import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCog,
  MenuSquare,
  KeyRound,
  Building2,
  Briefcase,
  UserPlus,
  UserCheck,
  CalendarDays,
  Clock,
  CheckCircle2,
  CalendarRange,
  FileText,
  Wallet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
} from "lucide-react";
import { iconMap } from "../utils/iconMap";
import { assets } from "../assets/assets";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const SidebarContent = ({
  collapsed,
  setCollapsed,
  onMobileNav,
  isMobile,
  menus = [],
  user = {
    name: "Vardhan Sinh",
    role: "Super Admin",
    avatar: "VS",
    online: true,
  },
  dropdownItems = [],
  footerItems = [],
  gearIcon = Wrench,
  onGearClick,
}) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [pendingExpandMenu, setPendingExpandMenu] = useState(null);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };
    checkTheme();
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!collapsed) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [collapsed]);

  useEffect(() => {
    if (!collapsed && pendingExpandMenu) {
      setExpandedMenu(pendingExpandMenu);
      setPendingExpandMenu(null);
    }
  }, [collapsed, pendingExpandMenu]);

  useEffect(() => {
    const activeMenu = menus.find(
      (menu) =>
        menu.path === location.pathname ||
        menu.children?.some(
          (child) =>
            child.path === location.pathname ||
            location.pathname.startsWith(child.path + "/"),
        ),
    );

    if (activeMenu) {
      setExpandedMenu(activeMenu.id || activeMenu._id);
    }
  }, [location.pathname, menus]);

  const toggleMenu = (menuId, hasChildren) => {
    if (!hasChildren) return;

    if (collapsed) {
      setPendingExpandMenu(menuId);
      setCollapsed(false);
      return;
    }

    setExpandedMenu((prev) => (prev === menuId ? null : menuId));
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(
      (child) =>
        child.path === location.pathname ||
        location.pathname.startsWith(child.path + "/"),
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // TOOLTIP COMPONENT DEFINITION REMAINED INNER
  const Tooltip = ({ children, label }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const leaveTimeoutRef = useRef(null);

    if (!collapsed) return children;

    const handleMouseEnter = () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      hoverTimeoutRef.current = setTimeout(() => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 12,
          });
          setShowTooltip(true);
        }
      }, 150);
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      leaveTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 100);
    };

    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    return (
      <>
        <div
          ref={triggerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative flex w-full justify-center"
        >
          {children}
        </div>
        {showTooltip &&
          createPortal(
            <div
              className="fixed z-99999 px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: "translateY(-50%)",
              }}
            >
              {label}
              <div
                className="absolute w-2 h-2 bg-popover rotate-45"
                style={{
                  left: "-4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></div>
            </div>,
            document.body,
          )}
      </>
    );
  };

  const GearIcon = gearIcon;
  const navigate = useNavigate();

  return (
    <div className="relative h-full">
      <aside
        className={`relative flex h-dvh flex-col bg-sidebar transition-[width] duration-300 ease-in-out overflow-hidden border-r border-sidebar-border ${
          collapsed ? "w-20" : "w-70"
        }`}
      >
        <div
          className={`flex items-center border-b border-sidebar-border h-18 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed && (
            <img
              src={isDark ? assets.logo.white : assets.logo.black}
              alt="Nexora"
              onClick={() => navigate("/")}
              className="h-7 object-contain transition-opacity duration-300 ease-in-out opacity-100 cursor-pointer ml-2.5"
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-hover transition-all duration-200 cursor-pointer"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden content-start">
          {menus.map((menu) => {
            const Icon = iconMap[menu.icon] || LayoutDashboard;
            const currentMenuId = menu.id || menu._id;

            if (!menu.children || menu.children.length === 0) {
              return (
                <Tooltip key={currentMenuId} label={menu.title}>
                  <NavLink
                    to={menu.path}
                    onClick={() => isMobile && onMobileNav?.()}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                      } ${collapsed ? "justify-center" : "gap-3"}`
                    }
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
                      }`}
                    >
                      {!collapsed && (
                        <span className="whitespace-nowrap">{menu.title}</span>
                      )}
                    </div>
                  </NavLink>
                </Tooltip>
              );
            }

            const activeParent =
              menu.path === location.pathname || isChildActive(menu.children);
            const isExpanded = expandedMenu === currentMenuId;

            if (collapsed) {
              return (
                <Tooltip key={currentMenuId} label={menu.title}>
                  <div
                    onClick={() => toggleMenu(currentMenuId, true)}
                    className={`flex items-center justify-center rounded-xl px-3 py-3 transition-all duration-200 cursor-pointer ${
                      activeParent
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                </Tooltip>
              );
            }

            return (
              <div key={currentMenuId} className="space-y-1">
                <button
                  onClick={() =>
                    toggleMenu(currentMenuId, menu.children?.length > 0)
                  }
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeParent
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={1.5} />
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
                      }`}
                    >
                      {!collapsed && (
                        <span className="whitespace-nowrap">{menu.title}</span>
                      )}
                    </div>
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded && !collapsed
                      ? "max-h-225 opacity-100 pt-1 pb-1"
                      : "max-h-0 opacity-0 visual-hidden"
                  }`}
                >
                  {!collapsed && (
                    <div className="ml-4 pl-4 space-y-1.5 border-l-2 border-sidebar-border/60">
                      {menu.children.map((child) => {
                        const ChildIcon =
                          iconMap[child.icon] || LayoutDashboard;
                        const childId = child.id || child._id;
                        return (
                          <NavLink
                            key={childId}
                            to={child.path}
                            onClick={() => isMobile && onMobileNav?.()}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                              }`
                            }
                          >
                            <ChildIcon size={16} strokeWidth={1.5} />
                            <span className="whitespace-nowrap">
                              {child.title}
                            </span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {footerItems.length > 0 && (
          <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
            {footerItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
                  item.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                }`}
              >
                {item.icon && <item.icon size={18} strokeWidth={1.5} />}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
                  }`}
                >
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="relative px-3 py-4 border-t border-sidebar-border">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
          >
            <div
              className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}
            >
              <div
                className="relative shrink-0 cursor-pointer"
                onClick={user.onClick}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-md">
                  {user.avatar}
                </div>
                {user.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar"></div>
                )}
              </div>
              {!collapsed && (
                <div
                  className="flex-1 text-left cursor-pointer overflow-hidden transition-all duration-300"
                  onClick={user.onClick}
                >
                  <div
                    className={`transition-all duration-300 ${
                      collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
                    }`}
                  >
                    {!collapsed && (
                      <>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {user.role}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && dropdownItems.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    if (onGearClick) {
                      onGearClick();
                    }
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-all duration-200 cursor-pointer"
                >
                  <GearIcon size={18} strokeWidth={1.5} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                    <div>
                      {dropdownItems.map((item) => {
                        if (item.type === "divider") {
                          return (
                            <hr
                              key={item.id}
                              className="border-border"
                            />
                          );
                        }
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.onClick();
                              setUserDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${
                              item.destructive
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-foreground hover:bg-sidebar-hover"
                            }`}
                          >
                            <ItemIcon size={16} strokeWidth={1.5} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

const Sidebar = ({
  user = {
    name: "Vardhan Sinh",
    role: "Super Admin",
    avatar: "VS",
    online: true,
    onClick: () => console.log("User clicked"),
  },
  dropdownItems = [
    {
      id: "profile",
      label: "Profile",
      icon: Users,
      onClick: () => console.log("Profile clicked"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => console.log("Settings clicked"),
    },
    { id: "divider-1", type: "divider" },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      onClick: () => console.log("Logout clicked"),
      destructive: true,
    },
  ],
  menus = [],
  footerItems = [],
  gearIcon = Wrench,
  onGearClick = () => console.log("Gear clicked"),
  onClose,
}) => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) return JSON.parse(saved);

      if (window.innerWidth >= 768 && window.innerWidth < 1024) return true;
      if (window.innerWidth >= 1024) return false;
    }
    return false;
  });

  const handleToggleCollapse = () => {
    if (typeof document !== "undefined") {
      const root = document.getElementById("root");
      const html = document.documentElement;
      const body = document.body;

      if (root) root.classList.add("no-horizontal-scroll");
      html.classList.add("no-horizontal-scroll");
      body.classList.add("no-horizontal-scroll");

      if (root) root.style.overflowX = "hidden";
      html.style.overflowX = "hidden";
      body.style.overflowX = "hidden";

      setTimeout(() => {
        if (root) root.classList.remove("no-horizontal-scroll");
        html.classList.remove("no-horizontal-scroll");
        body.classList.remove("no-horizontal-scroll");

        if (root) root.style.overflowX = "";
        html.style.overflowX = "";
        body.style.overflowX = "";
      }, 400);
    }
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        setCollapsed(true);
      } else if (width >= 1024) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  if (!isMobile) {
    return (
      <SidebarContent
        collapsed={collapsed}
        setCollapsed={handleToggleCollapse}
        user={user}
        menus={menus}
        dropdownItems={dropdownItems}
        footerItems={footerItems}
        gearIcon={gearIcon}
        onGearClick={onGearClick}
      />
    );
  }

  return (
    <>
      <SidebarContent
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={true}
        user={user}
        menus={menus}
        dropdownItems={dropdownItems}
        footerItems={footerItems}
        gearIcon={gearIcon}
        onGearClick={onGearClick}
      />
    </>
  );
};

export default Sidebar;
