import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="rounded-xl bg-white p-6 shadow-sm">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default Layout;