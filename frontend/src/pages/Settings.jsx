import { useState } from "react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getUser, logout } from "../services/auth";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const user = getUser();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Fill all password fields");
      return;
    }

    setLoading(true);
    try {
      await api.put("/api/account/password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {

    try {
      await api.delete("/api/account");
      toast.success("Account deleted");
      logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    }
  }

  return (
    <section className="py-12 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Container>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-slate-600 mt-1">
              Manage your account and security
            </p>
          </div>

          {/* Account Info */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Account</h2>

              <Input label="Email" value={user.email} disabled />

              <Input label="Role" value={user.role} disabled />
            </div>
          </Card>

          {/* Change Password */}
          <Card>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Change Password</h2>

              <Input
                type="password"
                label="Current Password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <Input
                type="password"
                label="New Password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="
    mt-3 inline-flex items-center justify-center
    rounded-md border border-red-500
    px-4 py-2 text-sm font-medium
    text-red-600
    hover:bg-red-600 hover:text-white
    transition
  "
          >
            Delete Account
          </button>
        </div>
      </Container>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Account
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              This action is permanent. All your data will be deleted and cannot
              be recovered.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await handleDeleteAccount(); // your existing delete logic
                  } finally {
                    setDeleting(false);
                    setShowDeleteModal(false);
                  }
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
