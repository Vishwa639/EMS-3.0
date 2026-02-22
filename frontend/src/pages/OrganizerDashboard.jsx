import { useEffect, useState } from "react";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/organizer/events")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/api/events/${id}`);
    setEvents(events.filter((e) => e.id !== id));
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
                <table className="w-full text-sm">
                  <thead className="border-b text-slate-600">
                    <tr>
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-left">Venue</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b last:border-0">
                        <td className="py-3">{event.name}</td>
                        <td className="py-3">{event.event_date}</td>
                        <td className="py-3">{event.venue}</td>
                        <td className="py-3 text-right">
                          <Link to={`/events/${event.id}`}>
                            <Button variant="outline" className="text-xs">
                              View
                            </Button>
                          </Link>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <Link to={`/organizer/edit/${event.id}`}>
                            <Button variant="outline" className="text-xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="text-xs text-red-600"
                            onClick={() => deleteEvent(event.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </Container>
    </section>
  );
}
