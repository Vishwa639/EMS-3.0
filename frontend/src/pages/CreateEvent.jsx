import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [registrationFee, setRegistrationFee] = useState("0");
  const [maxSeats, setMaxSeats] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  // ✅ Load data in edit mode
  useEffect(() => {
    if (!isEdit) return;

    api.get(`/api/events/${id}`).then((res) => {
      const e = res.data;

      setName(e.name);
      setVenue(e.venue);
      setDescription(e.description);
      setEventDate(e.event_date.split("T")[0]); // ✅ FIXED
      setStartTime(e.start_time);
      setEndTime(e.end_time);
      setMaxSeats(e.max_seats.toString());
      setRegistrationFee(e.registration_fee.toString());
    });
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ Validation
    const newErrors = {};

    if (!name) newErrors.name = "Event name is required";
    if (!eventDate) newErrors.eventDate = "Date is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";
    if (!venue) newErrors.venue = "Venue is required";
    if (!description) newErrors.description = "Description is required";
    if (!maxSeats) newErrors.maxSeats = "Max seats is required";

    // ✅ time validation (correct place)
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill mandatory fields");

      const firstErrorField = document.querySelector(".border-red-500");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }
    setLoading(true);

    try {
      // ✅ SINGLE FormData (used for both create & update)
      const data = new FormData();
      data.append("name", name);
      data.append("venue", venue);
      data.append("description", description);
      data.append("eventDate", eventDate);
      data.append("startTime", startTime);
      data.append("endTime", endTime);
      data.append("maxSeats", Number(maxSeats));
      data.append("registrationFee", Number(registrationFee));

      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      if (isEdit) {
        await api.put(`/api/events/${id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Event updated successfully");
      } else {
        await api.post("/api/events", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Event created successfully");
      }

      navigate("/organizer");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed. Check inputs.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <h1 className="text-2xl font-semibold">
                {isEdit ? "Edit Event" : "Create Event"}
              </h1>

              {/* Name */}
              <input
                type="text"
                placeholder="Event name *"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: null }));
                }}
                className={`w-full border px-3 py-2 rounded ${
                  errors.name ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}

              {/* Date */}
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setErrors((p) => ({ ...p, eventDate: null }));
                }}
                className={`w-full border px-3 py-2 rounded ${
                  errors.eventDate ? "border-red-500" : "border-slate-300"
                }`}
              />

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`border px-3 py-2 rounded ${
                    errors.startTime ? "border-red-500" : "border-slate-300"
                  }`}
                />

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`border px-3 py-2 rounded ${
                    errors.endTime ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>

              {/* Venue */}
              <input
                type="text"
                placeholder="Venue *"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Seats */}
              <input
                type="number"
                placeholder="Max seats *"
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Description */}
              <textarea
                placeholder="Event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Fee */}
              <input
                type="number"
                placeholder="Registration fee (₹)"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Thumbnail */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Thumbnail must be less than 5MB");
                    return;
                  }

                  setThumbnail(file);
                }}
              />

              <Button disabled={loading} className="w-full">
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Publishing..."
                  : isEdit
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}
