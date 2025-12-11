import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Smartphone, LogOut, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export default function DashboardLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${isCollapsed ? 'w-20' : 'w-64'
                    } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-10"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'flex justify-center px-2' : ''}`}>
                    {isCollapsed ? (
                        <h1 className="text-xl font-bold text-primary font-kanit">FH</h1>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-primary font-kanit">FallHelp</h1>
                            <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                            } ${isCollapsed ? 'justify-center px-2' : ''}`
                        }
                        title={isCollapsed ? "Dashboard" : ""}
                    >
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>


                    <NavLink
                        to="/devices"
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                            } ${isCollapsed ? 'justify-center px-2' : ''}`
                        }
                        title={isCollapsed ? "Devices" : ""}
                    >
                        <Smartphone size={20} />
                        {!isCollapsed && <span>Devices</span>}
                    </NavLink>

                    <NavLink
                        to="/feedback"
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                            } ${isCollapsed ? 'justify-center px-2' : ''}`
                        }
                        title={isCollapsed ? "Feedback" : ""}
                    >
                        <MessageSquare size={20} />
                        {!isCollapsed && <span>Feedback</span>}
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className={`flex items-center space-x-3 px-4 py-3 mb-2 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {user?.firstName?.charAt(0)}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center px-2' : ''
                            }`}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
