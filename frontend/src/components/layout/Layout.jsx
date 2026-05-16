import { useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../../assets/logo.png";

const Layout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Menu
                </button>
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Mediko Clinics" className="h-7 w-7 rounded-md object-contain" />
                    <span className="text-sm font-semibold text-gray-900">
                        Mediko Clinics
                    </span>
                </div>
                <div className="w-[60px]" aria-hidden="true" />
            </div>

            <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
                <div className="hidden md:block">
                    <Sidebar />
                </div>

                {mobileOpen ? (
                    <>
                        <div
                            className="fixed inset-0 z-30 bg-gray-900/40 md:hidden"
                            onClick={closeMobile}
                            aria-hidden="true"
                        />
                        <div className="fixed inset-y-0 left-0 z-40 md:hidden">
                            <Sidebar onNavigate={closeMobile} />
                        </div>
                    </>
                ) : null}

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
