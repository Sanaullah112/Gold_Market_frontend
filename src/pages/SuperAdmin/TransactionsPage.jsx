import React, { useEffect, useState } from "react";
import Swal from "sweetalert2"; // IMPORT SWEETALERT2
import { FiTrash2, FiEdit2, FiX } from "react-icons/fi";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    goldAdjustment: 0,
    silverAdjustment: 0,
    note: "",
  });

  const token = localStorage.getItem("token");

  // Reusable System-Theme Toast Definition
  const systemToast = (icon, title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: "#0f172a", // Slate-900 background match
      color: "#f1f5f9",
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      }
    });
    Toast.fire({
      icon: icon,
      iconColor: icon === "success" ? "#f59e0b" : "#ef4444", // Gold for success, Red for failure
      title: title
    });
  };

  /// +++++++++++++ Fetch Transaction history +++++++++++++++++ ///
  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        "http://localhost:2000/api/super/admin/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch transactions");
      }

      setTransactions(data.data || []);
    } catch (err) {
      systemToast("error", err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      goldAdjustment: item.goldAdjustment,
      silverAdjustment: item.silverAdjustment,
      note: item.note || "",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({
      goldAdjustment: 0,
      silverAdjustment: 0,
      note: "",
    });
  };

  //// ++++++++++++++++++  UPDATE TRANSACTION ++++++++++++++++++++ ////
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:2000/api/super/admin/transactions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update transaction");
      }

      systemToast("success", "Transaction entries updated.");
      closeEdit();
      fetchTransactions();
    } catch (err) {
      systemToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  ///// +++++++++++++++++++++  DELETE TRANSACTION +++++++++++++++++++++++++ ////
  const handleDelete = async (id) => {
    // Elegant SweetAlert2 Confirmation Wrapper
    Swal.fire({
      title: "Purge Record?",
      text: "Are you certain you want to remove this ledger entry permanently?",
      icon: "warning",
      iconColor: "#ef4444",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // Destructive red action
      cancelButtonColor: "#334155",
      confirmButtonText: "Confirm Drop",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#f1f5f9",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `http://localhost:2000/api/super/admin/transactions/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to delete transaction");
          }

          systemToast("success", "Ledger entry successfully deleted.");
          fetchTransactions();
        } catch (err) {
          systemToast("error", err.message);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#ba34eb] mb-2">
            Transaction History
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Update or delete saved adjustment history.
          </p>

          {/* Edit Form Dropdown Container */}
          {editingId && (
            <div className="mb-6 p-5 rounded-2xl bg-slate-800 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Edit Transaction
                </h3>
                <button
                  onClick={closeEdit}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm mb-2 text-slate-300">
                    Gold Adjustment
                  </label>
                  <input
                    type="number"
                    value={editForm.goldAdjustment}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        goldAdjustment: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-300">
                    Silver Adjustment
                  </label>
                  <input
                    type="number"
                    value={editForm.silverAdjustment}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        silverAdjustment: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-slate-300">
                    Note
                  </label>
                  <input
                    type="text"
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        note: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ba34eb] hover:bg-[#c55ae6] text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Transaction"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table Structure */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Gold Adj.</th>
                  <th className="py-3 pr-4">Silver Adj.</th>
                  <th className="py-3 pr-4">Current Gold</th>
                  <th className="py-3 pr-4">Current Silver</th>
                  <th className="py-3 pr-4">Updated Gold</th>
                  <th className="py-3 pr-4">Updated Silver</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((item) => (
                    <tr key={item._id} className="border-b border-slate-800">
                      <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {Number(item.goldAdjustment) >= 0 ? "+" : ""}
                        {Number(item.goldAdjustment).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {Number(item.silverAdjustment) >= 0 ? "+" : ""}
                        {Number(item.silverAdjustment).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        ${Number(item.currentLivePrices?.gold || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        ${Number(item.currentLivePrices?.silver || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-white font-semibold">
                        ${Number(item.updatedPrices?.gold || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-white font-semibold">
                        ${Number(item.updatedPrices?.silver || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold"
                          >
                            <FiEdit2 />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;