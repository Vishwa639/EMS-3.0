import Button from "./ui/Button";

export default function ConfirmDeleteModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold">Delete Event</h3>
        <p className="text-slate-600 mt-2">
          Are you sure you want to delete this event? This action cannot be
          undone.
        </p>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" className="min-w-[90px]" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="min-w-[90px] bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
