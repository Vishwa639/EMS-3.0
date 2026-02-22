import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    description: "",
    maxSeats: "",
    registrationFee: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [certificateTemplate, setCertificateTemplate] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (thumbnail) data.append("thumbnail", thumbnail);
      if (certificateTemplate) data.append("certificateTemplate", certificateTemplate);

      await api.post("/api/events", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/organizer");
    } catch {
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold">Create Event</h1>
                <p className="text-slate-600 mt-1">
                  Publish a new event for students
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="name"
                  placeholder="Event name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="venue"
                  placeholder="Venue"
                  value={form.venue}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="number"
                  name="maxSeats"
                  placeholder="Max seats (0 = unlimited)"
                  value={form.maxSeats}
                  onChange={handleChange}
                />
                <Input
                  type="number"
                  name="registrationFee"
                  placeholder="Registration fee (₹)"
                  value={form.registrationFee}
                  onChange={handleChange}
                />
              </div>

              <textarea
                name="description"
                placeholder="Event description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-600">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setThumbnail(e.target.files[0])}
                    className="mt-1 block w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600">
                    Certificate template (PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setCertificateTemplate(e.target.files[0])}
                    className="mt-1 block w-full text-sm"
                  />
                </div>
              </div>

              <Button className="w-full" disabled={loading}>
                {loading ? "Publishing..." : "Create Event"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}