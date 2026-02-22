import { useEffect, useState } from "react";
import api from "../services/api";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import QrModal from "../components/QrModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function StudentDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    api
      .get("/api/student/registrations")
      .then((res) => setRegistrations(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Student Dashboard</h1>
          <p className="text-slate-600">
            Your event registrations and certificates
          </p>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">My Registrations</h2>

            {loading ? (
              <p className="text-slate-500">Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <p className="text-slate-500">No registrations yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-slate-600">
                    <tr>
                      <th className="py-2 text-left w-1/3">Event</th>
                      <th className="py-2 text-left w-1/6">Status</th>
                      <th className="py-2 text-right w-1/2">Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.reg_code} className="border-b last:border-0">
                        <td className="py-3">{reg.event_name}</td>
                        <td className="py-3">
                          {reg.verified ? (
                            <span className="text-green-600 font-medium">
                              Verified
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {reg.verified ? (
                            <a
                              href={`${API_BASE}/api/certificate/${reg.reg_code}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button variant="outline" className="text-xs">
                                Download
                              </Button>
                            </a>
                          ) : (
                            <Button
                              variant="outline"
                              className="text-xs"
                              onClick={() => {
                                setQrUrl(
                                  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${API_BASE}/api/verify/${reg.reg_code}`,
                                );
                                setQrOpen(true);
                              }}
                            >
                              Show QR
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <QrModal
                  open={qrOpen}
                  qrUrl={qrUrl}
                  onClose={() => setQrOpen(false)}
                />
              </div>
            )}
          </div>
        </Card>
      </Container>
    </section>
  );
}
