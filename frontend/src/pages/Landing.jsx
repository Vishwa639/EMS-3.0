import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";
import e1 from "../assets/events/event1.jpg";
import e2 from "../assets/events/event2.jpg";
import e3 from "../assets/events/event3.jpg";
import e4 from "../assets/events/event4.jpg";

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const images = [e1, e2, e3, e4];
  const [index, setIndex] = useState(0);
  const user = getUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds

    return () => clearInterval(timer);
  }, [images.length]);
  useEffect(() => {
    api
      .get("/api/events")
      .then((res) => setEvents(res.data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      {/* HERO */}
      <section className="bg-white">
        <Container>
          <div className="py-20 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Discover and manage events,{" "}
                <span className="text-primary">professionally</span>
              </h1>
              <p className="mt-5 text-lg text-slate-600 max-w-xl">
                A modern event management platform for students and organizers.
                Register, manage attendance, and issue certificates — all in one
                place.
              </p>

              <div className="mt-8 flex gap-4">
                <Link to="/events">
                  <Button>Explore Events</Button>
                </Link>{" "}
                {user?.role === "organizer" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/organizer/create")}
                  >
                    Create Event
                  </Button>
                )}
              </div>
            </div>

            {/* Hero visual placeholder */}
            <div className="relative h-[320px] w-full rounded-3xl overflow-hidden shadow-lg">
              <div className="relative h-[320px] w-full rounded-3xl overflow-hidden shadow-lg">
                <div
                  className="flex h-full transition-transform duration-1000 ease-in-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Event"
                      className="w-full h-full object-cover flex-shrink-0"
                    />
                  ))}
                </div>

                {/* subtle overlay */}
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* subtle overlay */}
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURED EVENTS */}
      <section className="bg-slate-50 py-16">
        <Container>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold">Featured Events</h2>
            <p className="text-slate-600 mt-1">
              Handpicked events you might be interested in
            </p>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading events...</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <div className="h-40 bg-slate-200 rounded-t-xl overflow-hidden">
                    {event.thumbnail && (
                      <img
                        src={`https://ems-backend-3oew.onrender.com${event.thumbnail}`}
                        alt={event.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {event.name}
                    </h3>

                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(event.event_date).toLocaleDateString()} ·{" "}
                      {event.venue}{" "}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {event.registration_fee > 0
                          ? `₹${event.registration_fee}`
                          : "Free"}
                      </span>
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
