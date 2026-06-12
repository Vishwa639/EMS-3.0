import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="h-9 w-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center hover:opacity-90"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-slate-500 capitalize">
              {user.role}
            </p>
          </div>

          <Link
            to={user.role === "organizer" ? "/organizer" : "/student"}
            className="block px-4 py-2 text-sm hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/settings"
            className="block px-4 py-2 text-sm hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}