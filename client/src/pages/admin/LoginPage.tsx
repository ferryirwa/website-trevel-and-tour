import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      navigate("/admin");
    } catch (err: any) { setError(err.response?.data?.message || "We could not sign you in."); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-4">Admin Login</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@aikbukak.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-xs text-neutral-mid mt-6 text-center">
          Demo: admin@aikbukak.com / admin123
        </p>
      </div>
    </div>
  );
}
