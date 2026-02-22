import { Link, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { getUser, logout } from "../../services/auth";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-primary">
            EventOrizon
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-4" />
          <div className="hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search events"
              className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/events"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Events
            </Link>

            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            ) : (
              <>
                {user.role === "student" && (
                  <Link to="/student" className="text-sm">
                    Dashboard
                  </Link>
                )}
                {user.role === "organizer" && (
                  <Link to="/organizer" className="text-sm">
                    Dashboard
                  </Link>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
