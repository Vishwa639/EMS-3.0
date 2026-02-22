import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Email may already exist.");
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
              <h1 className="text-2xl font-semibold">Create account</h1>
              <p className="text-slate-600 mt-1">
                Register as a student or organizer
              </p>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              <div className="mt-6 space-y-4">
                <Input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <Button className="mt-6 w-full" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}