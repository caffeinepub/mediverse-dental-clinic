import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (email === "admin@mediverse.com" && password === "admin123") {
      localStorage.setItem("mediverse_admin", "true");
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setIsLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #22C55E 100%)",
      }}
    >
      {/* Animated background blobs */}
      <div
        className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-30 blur-3xl animate-pulse"
        style={{ background: "#6366F1" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-30 blur-3xl animate-pulse"
        style={{ background: "#22C55E", animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ background: "#0EA5E9", animationDelay: "2s" }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg, #0EA5E9, #6366F1, #22C55E)",
          }}
        />

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
              }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1
            className="text-center text-2xl font-bold mb-1"
            style={{ color: "#fff" }}
          >
            Admin Portal
          </h1>
          <p
            className="text-center text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Mediverse Dental Clinic Dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-white font-medium">
                Email Address
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@mediverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-ocid="admin.input"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-white font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/60"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#fca5a5",
                }}
                data-ocid="admin.error_state"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-white font-semibold py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                border: "none",
              }}
              disabled={isLoading}
              data-ocid="admin.submit_button"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            &copy; {new Date().getFullYear()} Mediverse Dental Clinic
          </p>
        </div>
      </div>
    </div>
  );
}
