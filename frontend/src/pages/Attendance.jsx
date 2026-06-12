import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function Attendance() {
  const { id } = useParams();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get(`/api/events/${id}/registrations`)
      .then((res) => setRegistrations(res.data))
      .catch(() => toast.error("Failed to load registrations"))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleAttendance(regId) {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, present: !r.present } : r)),
    );
  }

  async function saveAttendance() {
    try {
      await api.put(`/api/events/${id}/attendance`, registrations);
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    }
  }

  async function exportAttendance() {
    try {
      const res = await api.get(`/api/events/${id}/attendance/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_event_${id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to export attendance");
    }
  }

  const filtered = registrations.filter(
    (r) =>
      r.student_name.toLowerCase().includes(query.toLowerCase()) ||
      (r.register_no || "").toLowerCase().includes(query.toLowerCase()),
  );

  const presentCount = registrations.filter((r) => r.present).length;

  return (
    <section className="py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Attendance</h1>
            <p className="text-slate-600">
              Mark attendance for registered students
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportAttendance}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 flex gap-6 text-sm">
          <span>
            Total Registered: <strong>{registrations.length}</strong>
          </span>
          <span>
            Present: <strong>{presentCount}</strong>
          </span>
          <span>
            Absent: <strong>{registrations.length - presentCount}</strong>
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or register no"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 w-full max-w-md rounded-lg border px-3 py-2 text-sm"
        />

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-slate-500">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Register No</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-500">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-4 px-4 font-medium">
                        {r.student_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {r.register_no}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {r.department}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleAttendance(r.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            r.present
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {r.present ? "Present" : "Absent"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </section>
  );
}
