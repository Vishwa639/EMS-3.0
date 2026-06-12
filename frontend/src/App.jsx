import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Settings from "./pages/Settings";
import Attendance from "./pages/Attendance";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/create"
          element={
            <ProtectedRoute role="organizer">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/edit/:id"
          element={
            <ProtectedRoute role="organizer">
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/organizer/create" element={<CreateEvent />} />
        <Route path="/organizer/events/:id/edit" element={<CreateEvent />} />
        <Route
          path="/organizer/events/:id/attendance"
          element={<Attendance />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
