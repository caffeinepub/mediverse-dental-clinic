import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-screen clinic-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-clinic-blue-light flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-clinic-blue" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-clinic-navy">
            Admin Portal
          </CardTitle>
          <CardDescription>Mediverse Dental Clinic Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@mediverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <p
                className="text-sm text-destructive font-medium"
                data-ocid="admin.error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-clinic-blue hover:bg-clinic-blue-dark text-white"
              disabled={isLoading}
              data-ocid="admin.submit_button"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Mediverse Dental Clinic
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
