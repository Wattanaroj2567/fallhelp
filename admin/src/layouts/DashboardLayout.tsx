import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Smartphone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out relative`}
      >
        <div
          className={`p-6 border-b border-gray-200 dark:border-gray-700 relative ${
            isCollapsed
              ? "flex justify-center px-2"
              : "flex items-center justify-between"
          }`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 bottom-0 translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1.5 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 z-10 transition-all"
            title={isCollapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
          >
            {isCollapsed ? (
              <ChevronRight
                size={16}
                className="text-gray-600 dark:text-gray-400"
              />
            ) : (
              <ChevronLeft
                size={16}
                className="text-gray-600 dark:text-gray-400"
              />
            )}
          </button>
          {isCollapsed ? (
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold text-primary font-kanit">FH</h1>
            </div>
          ) : (
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary font-kanit">
                  FallHelp
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  แผงควบคุมระบบ
                </p>
              </div>
            </div>
          )}
          {/* Theme Toggle Button - moved to header */}
          {!isCollapsed && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={
                theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-primary font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${isCollapsed ? "justify-center px-2" : ""}`
            }
            title={isCollapsed ? "แดชบอร์ด" : ""}
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>แดชบอร์ด</span>}
          </NavLink>

          <NavLink
            to="/devices"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-primary font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${isCollapsed ? "justify-center px-2" : ""}`
            }
            title={isCollapsed ? "อุปกรณ์" : ""}
          >
            <Smartphone size={20} />
            {!isCollapsed && <span>อุปกรณ์</span>}
          </NavLink>

          <NavLink
            to="/feedback"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-primary font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${isCollapsed ? "justify-center px-2" : ""}`
            }
            title={isCollapsed ? "ความคิดเห็นและคำขอซ่อม" : ""}
          >
            <MessageSquare size={20} />
            {!isCollapsed && <span>ความคิดเห็นและคำขอซ่อม</span>}
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center space-x-3 px-4 py-3 mb-2 ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
              {user?.firstName?.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          {/* Theme Toggle Button for collapsed state */}
          {isCollapsed && (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-2 py-2 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "ออกจากระบบ" : ""}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
