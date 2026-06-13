import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getUser } from "../services/auth";
import RegistrationModal from "../components/RegistrationModal";
import "../styles.css";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [regForm, setRegForm] = useState({
    studentName: "",
    registerNo: "",
    department: "",
  });

  useEffect(() => {
    api
      .get(`/api/events/${id}`)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRegisterSubmit() {
    setProcessing(true);

    try {
      // ✅ STEP 1: Check already registered
      const regs = await api.get("/api/student/registrations");

      const already = regs.data.find((r) => r.event_name === event.name);

      if (already) {
        toast.error("You already registered for this event");
        setProcessing(false);
        return;
      }

      // ✅ HANDLE FREE EVENT FIRST
      if (event.registration_fee <= 0) {
        await api.post(`/api/events/${id}/verify-payment-and-register`, {
          razorpay_payment_id: "FREE",
          razorpay_order_id: "FREE",
          razorpay_signature: "FREE",

          studentName: regForm.studentName,
          registerNo: regForm.registerNo,
          department: regForm.department,
        });

        toast.success("Registered successfully!");
        setShowModal(false);
        return; // 🚨 VERY IMPORTANT
      }
      // ✅ STEP 2: Create order
      const orderRes = await api.post(`/api/events/${id}/create-payment-order`);

      const { orderId, amount, currency } = orderRes.data;

      // ✅ STEP 3: Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        order_id: orderId,

        handler: async function (response) {
          await api.post(`/api/events/${id}/verify-payment-and-register`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,

            studentName: regForm.studentName,
            registerNo: regForm.registerNo,
            department: regForm.department,
          });

          toast.success("Registration successful!");
          setShowModal(false);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <p className="py-20 text-slate-500">Loading event...</p>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <p className="py-20 text-slate-500">Event not found</p>
      </Container>
    );
  }

  const maxSeats = event.max_seats;
  const bookedSeats = event.booked_seats;

  const hasLimit = maxSeats > 0;
  const percentage = hasLimit
    ? Math.min((bookedSeats / maxSeats) * 100, 100)
    : 0;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (time) =>
    new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const isPastEvent = new Date(event.event_date) < new Date();

  console.log("API_BASE =", API_BASE);
console.log("thumbnail =", event.thumbnail);
console.log("full url =", `${API_BASE}${event.thumbnail}`);

  return (
    <section className="py-12 bg-slate-50">
      <Container>
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{event.name}</h1>

          <p className="mt-2 text-slate-600">
            {formatDate(event.event_date)} • {formatTime(event.start_time)} –{" "}
            {formatTime(event.end_time)}{" "}
          </p>

          <p className="text-slate-600">{event.venue}</p>

          {event.booked_seats >= event.max_seats && (
            <span className="inline-block mt-3 px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
              Event Full
            </span>
          )}
        </div>
        {/* System Banner */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {" "}
            {/* Poster */}
            {event.thumbnail && (
              <img
                src={`${API_BASE}${event.thumbnail}`}
                alt={event.name}
                className="w-48 rounded-xl shadow-md object-contain bg-white"
              />
            )}
            {/* Event Content */}
            <div>
              <p className="mt-6 text-slate-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg">Event Info</h3>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Seats:</strong> {event.booked_seats} /{" "}
                  {event.max_seats}
                </p>

                {/* progress bar stays here */}
                <div className="mt-2">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        percentage >= 100 ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {percentage >= 100
                      ? "Event full"
                      : `${maxSeats - bookedSeats} seats left`}
                  </p>
                </div>

                <p>
                  <strong>Fee:</strong>{" "}
                  {event.registration_fee > 0
                    ? `₹${event.registration_fee}`
                    : "Free"}
                </p>
              </div>
              <Button
                className="mt-6 w-full"
                disabled={event.booked_seats >= event.max_seats || isPastEvent}
                onClick={() => {
                  if (isPastEvent) {
                    toast.error("Registration closed. Event already ended.");
                    return;
                  }

                  const user = getUser();

                  if (!user) {
                    navigate("/login");
                    return;
                  }

                  if (user.role !== "student") {
                    toast.error("Only students can register for events");
                    return;
                  }

                  setShowModal(true);
                }}
              >
                {event.booked_seats >= event.max_seats
                  ? "Event Full"
                  : isPastEvent
                    ? "Event Ended"
                    : "Register Now"}
              </Button>
            </div>
          </Card>
        </div>
      </Container>

      {/* Registration Modal */}
      <RegistrationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleRegisterSubmit}
        loading={processing}
        form={regForm}
        setForm={setRegForm}
      />
    </section>
  );
}
