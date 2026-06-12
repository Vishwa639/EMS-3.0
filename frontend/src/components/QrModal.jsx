import Card from "./ui/Card";
import Button from "./ui/Button";

export default function QrModal({ open, onClose, qrUrl }) {
  if (!open) return null;

function downloadQR(e) {
  if (e) e.preventDefault();

  fetch(qrUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "event-qr.png";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    })
    .catch(() => {
      alert("Download failed");
    });
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card>
        <div className="p-6 text-center w-[90vw] max-w-sm">
          <h2 className="text-lg font-semibold">Show at Event</h2>

          <p className="text-sm text-slate-600 mt-1">
            Ask the organizer to scan this QR
          </p>

          <div className="mt-6 flex justify-center">
            <img src={qrUrl} alt="QR Code" className="border rounded-md p-2" />
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={downloadQR}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              Download QR
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}