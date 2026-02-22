import Card from "./ui/Card";
import Button from "./ui/Button";

export default function QrModal({ open, onClose, qrUrl }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card>
        <div className="p-6 text-center w-[90vw] max-w-sm">
          <h2 className="text-lg font-semibold">Show at Event</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ask the organizer to scan this QR
          </p>

          <div className="mt-6 flex justify-center">
            <img
              src={qrUrl}
              alt="QR Code"
              className="border rounded-md p-2"
            />
          </div>

          <Button className="mt-6 w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}