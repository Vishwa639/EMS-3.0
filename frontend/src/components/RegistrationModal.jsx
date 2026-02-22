import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function RegistrationModal({
  open,
  onClose,
  onSubmit,
  loading,
  form,
  setForm,
}) {
  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card>
        <div className="w-[90vw] max-w-md p-6">
          <h2 className="text-lg font-semibold">Event Registration</h2>
          <p className="text-sm text-slate-600 mt-1">
            Please enter your details
          </p>

          <div className="mt-5 space-y-4">
            <Input
              name="studentName"
              placeholder="Student Name"
              value={form.studentName}
              onChange={handleChange}
              required
            />
            <Input
              name="registerNo"
              placeholder="Register Number"
              value={form.registerNo}
              onChange={handleChange}
              required
            />
            <Input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}