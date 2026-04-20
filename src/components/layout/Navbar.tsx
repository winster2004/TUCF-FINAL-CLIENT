import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import BrandLogo from "../BrandLogo";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b"
      style={{
        background: "var(--bg-card)",
        borderBottomColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg transition-colors md:block"
            style={{ color: "var(--text-secondary)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            <BrandLogo size="sm" />
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    background: isActive
                      ? "rgba(255, 122, 0, 0.12)"
                      : "transparent",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white font-bold text-sm">
                {userInitial}
              </span>
            </div>
            <div className="hidden sm:block">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {userName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
