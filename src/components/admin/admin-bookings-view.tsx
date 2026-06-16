"use client";

import { useState } from "react";
import { ScheduleCreateBookingModal } from "@/components/admin/schedule-create-booking-modal";
import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import type { DashboardBooking } from "@/lib/admin/queries";
import {
  getStockholmTodayKey,
  resolveWeekStartKey,
  type AssignableStaffMember,
} from "@/lib/admin/schedule";

type AdminBookingsViewProps = {
  bookings: DashboardBooking[];
  staffMembers: AssignableStaffMember[];
  canCreateBooking: boolean;
  emptyMessage: string;
};

function getDefaultCreateSlot() {
  return {
    visitDate: getStockholmTodayKey(),
    visitTime: "09:00",
  };
}

export function AdminBookingsView({
  bookings,
  staffMembers,
  canCreateBooking,
  emptyMessage,
}: AdminBookingsViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const defaultSlot = getDefaultCreateSlot();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Hantera bokningar, kontaktuppgifter och tillhörande besök.
        </p>
        {canCreateBooking ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
          >
            Skapa bokning
          </button>
        ) : null}
      </div>

      <AdminBookingsTable bookings={bookings} emptyMessage={emptyMessage} />

      {createOpen ? (
        <ScheduleCreateBookingModal
          visitDate={defaultSlot.visitDate}
          visitTime={defaultSlot.visitTime}
          weekStartKey={resolveWeekStartKey(defaultSlot.visitDate)}
          staffMembers={staffMembers}
          allowEditDateTime
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </>
  );
}
