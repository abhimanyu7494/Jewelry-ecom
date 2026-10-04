import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNavbar from "../../components/AdminNavbar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // Fetch Users
  // =========================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // Delete User
  // =========================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user._id);

      await api.delete(`/admin/users/${user._id}`);

      // Remove deleted user from current list
      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );
    } catch (error) {
      console.error("Failed to delete user:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] px-3 py-5 text-[#222] sm:px-6 sm:py-8 lg:px-8">
        <AdminNavbar />

        <div className="mx-auto mt-12 max-w-7xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#B88A16]" />

          <p className="mt-4 text-sm text-[#999]">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-3 py-5 text-[#222] sm:px-6 sm:py-8 lg:px-8">

      <AdminNavbar />

      {/* =========================
          Background
      ========================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#C0C0C0]/10 blur-[110px]" />

      </div>

      <div className="relative z-10">

        <div className="mx-auto max-w-7xl">

          {/* =========================
              Header
          ========================= */}

          <div className="mb-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
              Admin
            </p>

            <h1 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
              Users
            </h1>

            <div className="mt-3 h-px w-12 bg-[#D4AF37]" />

            <p className="mt-3 text-sm text-[#888]">
              Manage registered users of your store.
            </p>

          </div>


          {/* =========================
              Error
          ========================= */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* =========================
              User Count
          ========================= */}

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">
                Registered Users
              </p>

              <p className="mt-1 font-['Instrument_Serif'] text-2xl text-[#222]">
                {users.length}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-2.5 text-xs font-semibold text-[#A17B20] transition hover:border-[#D4AF37] hover:bg-[#FFF9E8]"
            >
              Refresh
            </button>

          </div>


          {/* =========================
              Empty State
          ========================= */}

          {users.length === 0 ? (
            <div className="rounded-[24px] border border-[#E7E2D8] bg-white p-10 text-center shadow-[0_15px_50px_rgba(0,0,0,0.05)]">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF9E8] text-[#B88A16]">

                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  />

                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    strokeWidth="1.5"
                  />

                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  />
                </svg>

              </div>

              <h2 className="mt-5 font-['Instrument_Serif'] text-2xl">
                No users found
              </h2>

              <p className="mt-2 text-sm text-[#999]">
                Registered users will appear here.
              </p>

            </div>
          ) : (

            /* =========================
               Desktop Table
            ========================= */

            <div className="hidden overflow-hidden rounded-[24px] border border-[#E7E2D8] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)] md:block">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-[#E7E2D8] bg-[#FCFBF8]">

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {users.map((user) => (

                      <tr
                        key={user._id}
                        className="border-b border-[#F0ECE4] last:border-b-0 hover:bg-[#FFFEFB]"
                      >

                        <td className="px-6 py-5">

                          <p className="font-medium text-[#333]">
                            {user.fullName}
                          </p>

                        </td>


                        <td className="px-6 py-5">

                          <p className="text-sm text-[#666]">
                            {user.email}
                          </p>

                        </td>


                        <td className="px-6 py-5">

                          <p className="text-sm text-[#666]">
                            {user.phone}
                          </p>

                        </td>


                        <td className="px-6 py-5">

                          <p className="text-xs text-[#999]">
                            {user.createdAt
                              ? new Date(
                                  user.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>

                        </td>


                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            disabled={
                              deletingId === user._id
                            }
                            onClick={() =>
                              handleDelete(user)
                            }
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === user._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          )}


          {/* =========================
              Mobile Cards
          ========================= */}

          {users.length > 0 && (

            <div className="space-y-3 md:hidden">

              {users.map((user) => (

                <div
                  key={user._id}
                  className="rounded-[22px] border border-[#E7E2D8] bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h2 className="font-['Instrument_Serif'] text-2xl text-[#222]">
                        {user.fullName}
                      </h2>

                      <p className="mt-2 break-all text-sm text-[#666]">
                        {user.email}
                      </p>

                      <p className="mt-1 text-sm text-[#888]">
                        {user.phone}
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 flex items-center justify-between border-t border-[#F0ECE4] pt-4">

                    <p className="text-[11px] text-[#999]">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </p>


                    <button
                      type="button"
                      disabled={
                        deletingId === user._id
                      }
                      onClick={() =>
                        handleDelete(user)
                      }
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === user._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminUsers;
