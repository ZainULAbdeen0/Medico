import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { label: "Dashboard", to: "/dashboard", roles: ["admin", "doctor", "receptionist", "patient"] },
    { label: "Patients", to: "/patients", roles: ["admin", "receptionist"] },
    { label: "Doctors", to: "/doctors", roles: ["admin"] },
    { label: "Appointments", to: "/appointments", roles: ["admin", "doctor", "receptionist"] },
    { label: "Prescriptions", to: "/prescriptions", roles: ["doctor"] },
    { label: "Analytics", to: "/analytics", roles: ["admin"] },
    { label: "Audit Logs", to: "/audit-logs", roles: ["admin"] }
];

const Sidebar = ({ onNavigate }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const role = user?.role;
    const visibleLinks = isAuthenticated
        ? navItems.filter((item) => item.roles.includes(role))
        : [{ label: "Login", to: "/login" }];

    const handleLogout = () => {
        logout();
        onNavigate?.();
    };

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
                <div className="text-base font-semibold text-gray-900">
                    Hospital Admin
                </div>
                <div className="text-xs text-gray-500">
                    Management Console
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
                {visibleLinks.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `block rounded-md px-3 py-2 transition-colors ${
                                isActive
                                    ? "bg-slate-100 font-medium text-slate-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {isAuthenticated ? (
                <div className="border-t border-gray-200 px-4 py-4">
                    <div className="truncate text-sm font-medium text-gray-900">
                        {user?.name}
                    </div>
                    <div className="text-xs capitalize text-gray-500">
                        {user?.role}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Sign out
                    </button>
                </div>
            ) : null}
        </aside>
    );
};

export default Sidebar;
