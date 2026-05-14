import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (values) => {
        setErrorMessage("");
        const result = await login(values.email, values.password);
        if (result.ok) {
            navigate("/dashboard");
        } else {
            setErrorMessage(result.message);
        }
    };

    return (
        <section className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="you@example.com"
                        {...register("email")}
                    />
                    {errors.email ? (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                    ) : null}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    {errors.password ? (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                    ) : null}
                </div>
                {errorMessage ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </div>
                ) : null}
                <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                    {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </section>
    );
};

export default Login;