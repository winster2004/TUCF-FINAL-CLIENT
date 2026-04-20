import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser } from "../api/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const buildStoredUser = (
    user: { name?: string; email?: string; role?: string } | undefined,
    loginEmail: string,
  ) => {
    const normalizedLoginEmail = loginEmail.trim().toLowerCase();
    const identityEmail =
      user?.email?.trim().toLowerCase() || normalizedLoginEmail;
    return {
      ...user,
      id:
        identityEmail.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
        "user",
      name: user?.name?.trim() || "User",
      email: identityEmail,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({ email: email.trim(), password });
      const token = response.access_token;

      if (!token) {
        throw new Error("Login failed. Token not received.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem(
        "userData",
        JSON.stringify(buildStoredUser(response.user, email)),
      );
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white font-bold text-lg">CP</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: "#2f2c2a" }}>
            Welcome back
          </h2>
          <p className="mt-2" style={{ color: "#5a6673" }}>
            Sign in to your CareerPro account
          </p>
        </div>

        <form className="mt-8 space-y-6 tucf-card" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
                style={{ color: "#5a6673" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: "#8a7562" }} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
                style={{ color: "#5a6673" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: "#8a7562" }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: "#8a7562" }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: "#8a7562" }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="text-sm text-center"
              style={{ color: "var(--accent)" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm"
                style={{ color: "#2f2c2a" }}
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                className="font-medium"
                style={{ color: "var(--accent)" }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all tucf-btn-primary"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm" style={{ color: "#5a6673" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium"
                style={{ color: "var(--accent)" }}
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
