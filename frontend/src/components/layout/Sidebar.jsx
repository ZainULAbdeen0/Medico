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

const Sidebar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const role = user?.role;
    const visibleLinks = isAuthenticated
        ? navItems.filter((item) => item.roles.includes(role))
        : [{ label: "Login", to: "/login" }];

    return (
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-white p-6">
            <div className="text-lg font-semibold text-gray-900">Hospital Admin</div>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
                {visibleLinks.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `rounded-md px-3 py-2 transition ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            {isAuthenticated ? (
                <button
                    type="button"
                    onClick={logout}
                    className="mt-6 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Sign out
                </button>
            ) : null}
        </aside>
    );
};

export default Sidebar;