import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const demoAccounts = [
    { role: "Admin", email: "admin@hospital.com" },
    { role: "Receptionist", email: "reception@hospital.com" },
    { role: "Doctor", email: "sarah@hospital.com" }
];

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const submitting = isSubmitting || isLoading;

    const onSubmit = async (values) => {
        setServerError("");
        const result = await login(values.email, values.password);
        if (result.ok) {
            navigate("/dashboard");
        } else {
            setServerError(result.message);
        }
    };

    const fillDemo = (email) => {
        setValue("email", email, { shouldValidate: false });
        setValue("password", "password123", { shouldValidate: false });
        setServerError("");
    };

    const inputBase =
        "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2";
    const inputValid =
        "border-gray-300 focus:border-slate-500 focus:ring-slate-200";
    const inputInvalid =
        "border-red-400 focus:border-red-500 focus:ring-red-200";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <div className="mb-6 space-y-1">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Hospital Management
                        </h1>
                        <p className="text-sm text-gray-500">
                            Sign in to your account
                        </p>
                    </div>

                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`${inputBase} ${
                                    errors.email ? inputInvalid : inputValid
                                }`}
                                placeholder="you@example.com"
                                aria-invalid={errors.email ? "true" : "false"}
                                {...register("email")}
                            />
                            {errors.email ? (
                                <p className="text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={`${inputBase} ${
                                    errors.password || serverError
                                        ? inputInvalid
                                        : inputValid
                                }`}
                                placeholder="••••••••"
                                aria-invalid={
                                    errors.password || serverError
                                        ? "true"
                                        : "false"
                                }
                                {...register("password")}
                            />
                            {errors.password ? (
                                <p className="text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            ) : null}
                            {!errors.password && serverError ? (
                                <p className="text-sm text-red-600">
                                    {serverError}
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {submitting ? (
                                <>
                                    <span
                                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                        aria-hidden="true"
                                    />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Demo accounts
                    </p>
                    <p className="mb-3 text-xs text-gray-500">
                        Password for all:{" "}
                        <span className="font-mono text-gray-700">
                            password123
                        </span>
                    </p>
                    <ul className="space-y-1.5">
                        {demoAccounts.map((account) => (
                            <li
                                key={account.email}
                                className="flex items-center justify-between gap-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <span className="font-medium text-gray-700">
                                        {account.role}
                                    </span>
                                    <span className="ml-2 truncate text-gray-500">
                                        {account.email}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fillDemo(account.email)}
                                    className="shrink-0 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Use
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;
