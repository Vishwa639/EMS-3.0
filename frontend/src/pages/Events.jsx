import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/events")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 bg-slate-50">
      <Container>
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">All Events</h1>
          <p className="text-slate-600 mt-1">
            Browse upcoming and ongoing events
          </p>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">No events available</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id}>
                <div className="h-44 bg-slate-200 overflow-hidden rounded-t-xl">
                  {event.thumbnail && (
                    <img
                      src={`http://localhost:5001${event.thumbnail}`}
                      alt={event.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {event.name}
                  </h3>

                  <p className="text-sm text-slate-600 mt-1">
                    {event.event_date} · {event.venue}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {event.registration_fee > 0
                        ? `₹${event.registration_fee}`
                        : "Free"}
                    </span>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>{" "}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
