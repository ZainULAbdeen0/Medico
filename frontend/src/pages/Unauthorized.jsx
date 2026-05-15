import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <section className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Error 403
                </div>
                <h1 className="mt-2 text-xl font-semibold text-gray-900">
                    Access denied
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    You don't have permission to view this page. If you think
                    this is wrong, contact an administrator.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Back to dashboard
                </Link>
            </div>
        </section>
    );
};

export default Unauthorized;
