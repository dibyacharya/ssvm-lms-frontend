import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const identifierHasEmail = (formData.identifier || "").includes("@");
  const emailLoginBlockedMessage =
    "Email login is not allowed. Use Roll No / Enrolment No / Employee ID.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = (formData.identifier || "").trim();
    if (!identifier || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (identifierHasEmail) {
      setError(emailLoginBlockedMessage);
      toast.error(emailLoginBlockedMessage);
      return;
    }
    if (identifier.length < 1) {
      toast.error("Enter your User ID");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(identifier, formData.password);

      if (response.data) {
        login(response.data);

        const savedPath = localStorage.getItem("redirectAfterLogin");
        localStorage.removeItem("redirectAfterLogin");

        let redirectPath;
        if (savedPath && savedPath !== "/" && savedPath !== "/login") {
          redirectPath = savedPath;
        } else if (response.data.user.role === "admin") {
          redirectPath = "/admin";
        } else {
          redirectPath =
            response.data.user.role === "teacher"
              ? "/teacher/dashboard"
              : "/student/dashboard";
        }
        toast.success("Login successful!");
        navigate(redirectPath);
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      let message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Please try again.";
      if (code === "USER_NOT_FOUND") message = "Wrong User ID";
      if (code === "INVALID_PASSWORD") message = "Wrong Password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center font-sans"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* Clean centered card */}
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg border border-gray-200 p-8 sm:p-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1E293B" }}>
            SSVM LMS
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#94A3B8" }}>
            Welcome Back
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User ID */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#475569" }}
            >
              User ID
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </div>
              <input
                id="identifier"
                type="text"
                name="identifier"
                placeholder="Roll No / Enrolment No / Employee ID"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                style={{ color: "#1E293B" }}
              />
            </div>
            {identifierHasEmail && (
              <p className="mt-1 text-xs text-red-500">{emailLoginBlockedMessage}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#475569" }}
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                style={{ color: "#1E293B" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600 transition-colors"
                style={{ color: "#94A3B8" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || identifierHasEmail}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            }}
            onMouseEnter={(e) => {
              if (!loading && !identifierHasEmail) {
                e.currentTarget.style.background = "linear-gradient(135deg, #2563EB, #DC2626)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #3B82F6, #2563EB)";
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
