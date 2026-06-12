import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useSearchParams } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeFilter, setFeeFilter] = useState("all"); // all | free | paid
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // all | available | full
  const [dateFilter, setDateFilter] = useState("upcoming"); // upcoming | past
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    setFeeFilter(searchParams.get("fee") || "all");
    setAvailabilityFilter(searchParams.get("availability") || "all");
    setDateFilter(searchParams.get("date") || "upcoming");
  }, []);

  useEffect(() => {
    setSearchParams({
      search: search || "",
      fee: feeFilter,
      availability: availabilityFilter,
      date: dateFilter,
    });
  }, [search, feeFilter, availabilityFilter, dateFilter]);

  const filteredEvents = events.filter((event) => {
    // SEARCH
    const matchesSearch = `${event.name} ${event.venue}`
      .toLowerCase()
      .includes(search.toLowerCase());

    // FEE
    const matchesFee =
      feeFilter === "all" ||
      (feeFilter === "free" && event.registration_fee <= 0) ||
      (feeFilter === "paid" && event.registration_fee > 0);

    // AVAILABILITY
    const isFull = event.max_seats > 0 && event.booked_seats >= event.max_seats;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && !isFull) ||
      (availabilityFilter === "full" && isFull);

    // DATE
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchesDate =
      dateFilter === "upcoming" ? eventDate >= today : eventDate < today;

    return matchesSearch && matchesFee && matchesAvailability && matchesDate;
  });

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

        <div className="mb-6 flex flex-wrap gap-4">
          {/* Fee Filter */}
          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Fees</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          {/* Availability Filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">No events available</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <div className="h-44 bg-slate-200 overflow-hidden rounded-t-xl">
                  {event.thumbnail && (
                    <img
                      src={`https://ems-backend-3oew.onrender.com${event.thumbnail}`}
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
{new Date(event.event_date).toLocaleDateString()} · {event.venue}                  </p>

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
            {filteredEvents.length === 0 && (
              <p className="text-slate-500 mt-6">No events found</p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
