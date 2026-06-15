"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type BlockedSlot = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

export default function AvailabilityManager() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  const fetchAvailability = async () => {
    try {
      const res = await fetch(
        "/api/teachers/availability"
      );

      const data = await res.json();

      if (data.success) {
        setBlockedSlots(
          data.availability?.blockedSlots || []
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load availability");
    }
  };

  useEffect(() => {
    void fetchAvailability();
  }, []);

  const addBlockedSlot = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "/api/teachers/blocked-slots",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to add blocked slot"
        );
      }

      toast.success(
        "Blocked slot added successfully"
      );

      setForm({
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
      });

      await fetchAvailability();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteBlockedSlot = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Delete this blocked slot?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/teachers/blocked-slots/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete blocked slot"
        );
      }

      toast.success(
        "Blocked slot removed"
      );

      await fetchAvailability();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Teacher Availability
      </h2>

      <form
        onSubmit={addBlockedSlot}
        className="grid md:grid-cols-4 gap-4"
      >
        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date: e.target.value,
            })
          }
          className="border rounded-lg p-3"
          required
        />

        <input
          type="time"
          value={form.startTime}
          onChange={(e) =>
            setForm({
              ...form,
              startTime:
                e.target.value,
            })
          }
          className="border rounded-lg p-3"
          required
        />

        <input
          type="time"
          value={form.endTime}
          onChange={(e) =>
            setForm({
              ...form,
              endTime:
                e.target.value,
            })
          }
          className="border rounded-lg p-3"
          required
        />

        <input
          type="text"
          placeholder="Reason"
          value={form.reason}
          onChange={(e) =>
            setForm({
              ...form,
              reason:
                e.target.value,
            })
          }
          className="border rounded-lg p-3"
        />

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading
              ? "Adding..."
              : "Add Blocked Slot"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="font-semibold mb-3">
          Existing Blocked Slots
        </h3>

        {blockedSlots.length === 0 ? (
          <p className="text-gray-500">
            No blocked slots found.
          </p>
        ) : (
          <div className="space-y-3">
            {blockedSlots.map((slot) => (
              <div
                key={slot._id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {new Date(
                      slot.date
                    ).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-gray-600">
                    {slot.startTime} -{" "}
                    {slot.endTime}
                  </p>

                  {slot.reason && (
                    <p className="text-sm">
                      {slot.reason}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    deleteBlockedSlot(
                      slot._id
                    )
                  }
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}