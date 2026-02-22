import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setAuth } from "../services/auth";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      setAuth(res.data.token, res.data.user);

      if (res.data.user.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/student");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex items-center bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        <div className="max-w-md mx-auto">
          <Card>
            <form onSubmit={handleSubmit} className="p-6">
              <h1 className="text-2xl font-semibold">Login</h1>
              <p className="text-slate-600 mt-1">
                Access your account
              </p>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              <div className="mt-6 space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button className="mt-6 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}