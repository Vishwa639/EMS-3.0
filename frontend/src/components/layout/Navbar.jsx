import { Link, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { getUser, logout } from "../../services/auth";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ProfileMenu from "../ProfileMenu";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    api.get("/api/events").then((res) => setEvents(res.data));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const matches = events
      .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    setSuggestions(matches);
  }, [query, events]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-primary"
          >
            EventOrizon
          </Link>

          {/* Search */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  navigate(`/events?search=${encodeURIComponent(query)}`);
                  setSuggestions([]);
                }
              }}
              className="w-72 rounded-full border border-slate-200 px-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            {suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
                {suggestions.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      navigate(`/events/${event.id}`);
                      setQuery("");
                      setSuggestions([]);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-5">
            <Link
              to="/events"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
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
               <ProfileMenu user={user} />
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}