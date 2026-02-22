import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function EditEvent() {
  const { id } = useParams();
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

  useEffect(() => {
    api.get(`/api/events/${id}`).then((res) => {
      const e = res.data;
      setForm({
        name: e.name,
        eventDate: e.event_date ? e.event_date.split("T")[0] : "",
        startTime: e.start_time,
        endTime: e.end_time,
        venue: e.venue,
        description: e.description,
        maxSeats: e.max_seats,
        registrationFee: e.registration_fee,
      });
    });
  }, [id]);
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
      if (certificateTemplate)
        data.append("certificateTemplate", certificateTemplate);

      await api.put(`/api/events/${id}`, data);
      navigate("/organizer");
    } catch {
      setError("Update failed");
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
              <h1 className="text-2xl font-semibold">Edit Event</h1>
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="name"
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
                  value={form.venue}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="number"
                  name="maxSeats"
                  value={form.maxSeats}
                  onChange={handleChange}
                />
                <Input
                  type="number"
                  name="registrationFee"
                  value={form.registrationFee}
                  onChange={handleChange}
                />
              </div>

              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertificateTemplate(e.target.files[0])}
                />
              </div>

              <Button className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Update Event"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}
