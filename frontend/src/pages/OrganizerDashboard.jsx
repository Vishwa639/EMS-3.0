import { useEffect, useState } from "react";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { QrCode, PencilIcon, Trash2 } from "lucide-react";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/organizer/events")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    try {
      await api.delete(`/api/events/${deleteId}`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success("Event deleted successfully");
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleteId(null);
    }
  }

  const totalEvents = events.length;

  return (
    <section className="py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Organizer Dashboard</h1>
            <p className="text-slate-600">
              Manage your events and registrations
            </p>
          </div>

          <Link to="/organizer/create">
            <Button>Create Event</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <Card>
            <div className="p-6">
              <p className="text-sm text-slate-500">Total Events</p>
              <p className="text-3xl font-semibold mt-1">{totalEvents}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <p className="text-sm text-slate-500">Upcoming Events</p>
              <p className="text-3xl font-semibold mt-1">
                {
                  events.filter((e) => new Date(e.event_date) >= new Date())
                    .length
                }
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <p className="text-sm text-slate-500">Past Events</p>
              <p className="text-3xl font-semibold mt-1">
                {
                  events.filter((e) => new Date(e.event_date) < new Date())
                    .length
                }
              </p>
            </div>
          </Card>
        </div>

        {/* Events table */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Events</h2>

            {loading ? (
              <p className="text-slate-500">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-slate-500">No events created yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b text-left text-sm text-slate-500">
                      <th className="py-3 w-[45%]">Event</th>
                      <th className="py-3 w-[15%] text-center">Status</th>
                      <th className="py-3 w-[15%] text-center">
                        Registrations
                      </th>
                      <th className="py-3 w-[25%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => {
                      const isPast = new Date(event.event_date) < new Date();
                      const isFull = event.booked_seats >= event.max_seats;

                      return (
                        <tr
                          key={event.id}
                          className="border-b last:border-none"
                        >
                          {/* EVENT */}
                          <td className="py-4">
                            <button
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="text-left font-medium text-slate-900 hover:text-primary transition"
                            >
                              {event.name}
                            </button>
                            <div className="text-sm text-slate-500">
                              {new Date(event.event_date).toLocaleDateString()}{" "}
                              · {event.venue}{" "}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-4 text-center">
                            {isPast ? (
                              <span className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-700">
                                Past
                              </span>
                            ) : isFull ? (
                              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                                Full
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                                Upcoming
                              </span>
                            )}
                          </td>

                          {/* REGISTRATIONS */}
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-semibold text-slate-900">
                                {event.booked_seats}/{event.max_seats}
                              </span>
                              <span className="text-xs text-slate-500">
                                Registered
                              </span>
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-4">
                            <div className="flex justify-center items-center gap-4">
                              {" "}
                              {/* Attendance */}
                              <button
                                onClick={() =>
                                  navigate(
                                    `/organizer/events/${event.id}/attendance`,
                                  )
                                }
                              >
                                <QrCode size={16} />
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() =>
                                  navigate(`/organizer/events/${event.id}/edit`)
                                }
                                className="text-slate-600 hover:text-slate-900"
                                title="Edit event"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete event"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </Container>
      <ConfirmDeleteModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
