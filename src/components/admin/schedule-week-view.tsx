"use client";

import Link from "next/link";
import { useState } from "react";
import { ScheduleCreateBookingModal } from "@/components/admin/schedule-create-booking-modal";
import { ScheduleVisitCard } from "@/components/admin/schedule-visit-card";
import {
  buildHourLabels,
  buildWeekDays,
  formatDayHeading,
  formatWeekRangeLabel,
  getStockholmTodayKey,
  getVisitPosition,
  groupVisitsByDate,
  parseTimeToMinutes,
  SCHEDULE_END_HOUR,
  SCHEDULE_HOUR_HEIGHT_PX,
  SCHEDULE_START_HOUR,
  shiftWeekStartKey,
  type AssignableStaffMember,
  type ScheduleVisit,
} from "@/lib/admin/schedule";

type ScheduleWeekViewProps = {
  weekStartKey: string;
  visits: ScheduleVisit[];
  staffMembers: AssignableStaffMember[];
  canAssignStaff: boolean;
  canCreateBooking: boolean;
};

type CreateSlot = {
  visitDate: string;
  visitTime: string;
};

function isSlotOccupied(visits: ScheduleVisit[], hour: number) {
  const slotStart = hour * 60;
  const slotEnd = (hour + 1) * 60;

  return visits.some((visit) => {
    const visitStart = parseTimeToMinutes(visit.visitTime);
    const visitEnd = visitStart + visit.durationMinutes;
    return visitStart < slotEnd && visitEnd > slotStart;
  });
}

function VisitBlock({
  visit,
  isSelected,
  onSelect,
}: {
  visit: ScheduleVisit;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const position = getVisitPosition(visit.durationMinutes, visit.visitTime);

  if (!position) {
    return null;
  }

  const isUnassigned = !visit.staffId;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-2 text-left shadow-sm transition hover:border-gold hover:shadow-md ${
        isSelected
          ? "border-gold ring-2 ring-gold/30"
          : isUnassigned
            ? "border-amber-200 bg-amber-50"
            : "border-green/15 bg-white"
      }`}
      style={{ top: position.top, height: position.height }}
    >
      <p className="truncate text-xs font-bold text-green">{visit.visitTime}</p>
      <p className="truncate text-sm font-semibold text-green">{visit.contactName}</p>
      <p className="truncate text-[11px] text-muted">
        {visit.streetAddress || `${visit.postalCode} ${visit.municipality}`}
      </p>
      {visit.frequencyLabel ? (
        <p className="truncate text-[11px] text-muted">{visit.frequencyLabel}</p>
      ) : null}
      <p
        className={`mt-1 truncate text-[11px] font-medium ${
          isUnassigned ? "text-amber-700" : "text-green/70"
        }`}
      >
        {visit.staffName ?? "Ej tilldelad"}
      </p>
    </button>
  );
}

export function ScheduleWeekView({
  weekStartKey,
  visits,
  staffMembers,
  canAssignStaff,
  canCreateBooking,
}: ScheduleWeekViewProps) {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const selectedVisit = visits.find((visit) => visit.id === selectedVisitId) ?? null;
  const weekDays = buildWeekDays(weekStartKey);
  const visitsByDate = groupVisitsByDate(visits);
  const hourLabels = buildHourLabels();
  const todayKey = getStockholmTodayKey();
  const gridHeight = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * SCHEDULE_HOUR_HEIGHT_PX;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
              Veckoschema
            </p>
            <h2 className="mt-1 font-display text-3xl text-green">
              {formatWeekRangeLabel(weekStartKey)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/schedule?week=${shiftWeekStartKey(weekStartKey, -1)}`}
              className="inline-flex h-10 items-center rounded-full border border-green/15 px-4 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
            >
              Föregående
            </Link>
            <Link
              href="/admin/schedule"
              className="inline-flex h-10 items-center rounded-full border border-green/15 px-4 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
            >
              Idag
            </Link>
            <Link
              href={`/admin/schedule?week=${shiftWeekStartKey(weekStartKey, 1)}`}
              className="inline-flex h-10 items-center rounded-full border border-green/15 px-4 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
            >
              Nästa
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-green/10 bg-card">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-green/10 bg-ivory/60">
              <div className="flex items-center justify-center px-3 py-4 text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                Tid
              </div>
              {weekDays.map((day) => {
                const isToday = day.dateKey === todayKey;

                return (
                  <div
                    key={day.dateKey}
                    className={`flex items-center justify-center border-l border-green/10 px-3 py-4 text-center ${
                      isToday ? "bg-gold/10" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold capitalize text-green">
                      {formatDayHeading(day.date)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))]">
              <div className="relative border-r border-green/10 bg-ivory/40">
                {hourLabels.map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-center border-b border-green/10 px-3 text-xs font-medium text-muted"
                    style={{ height: SCHEDULE_HOUR_HEIGHT_PX }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dayVisits = visitsByDate.get(day.dateKey) ?? [];
                const isToday = day.dateKey === todayKey;

                return (
                  <div
                    key={day.dateKey}
                    className={`relative border-r border-green/10 ${
                      isToday ? "bg-gold/5" : "bg-white"
                    }`}
                    style={{ height: gridHeight }}
                  >
                    {hourLabels.map((label, hourIndex) => {
                      const hour = SCHEDULE_START_HOUR + hourIndex;
                      const occupied = isSlotOccupied(dayVisits, hour);

                      return (
                        <div
                          key={`${day.dateKey}-${label}`}
                          className="group/slot relative border-b border-green/10"
                          style={{ height: SCHEDULE_HOUR_HEIGHT_PX }}
                        >
                          {canCreateBooking && !occupied ? (
                            <button
                              type="button"
                              aria-label={`Skapa bokning ${formatDayHeading(day.date)} kl. ${label}`}
                              onClick={() =>
                                setCreateSlot({
                                  visitDate: day.dateKey,
                                  visitTime: label,
                                })
                              }
                              className="absolute inset-1 flex items-center justify-center rounded-lg border border-dashed border-transparent text-xl font-light text-green/0 transition group-hover/slot:border-gold/40 group-hover/slot:bg-gold/10 group-hover/slot:text-gold"
                            >
                              +
                            </button>
                          ) : null}
                        </div>
                      );
                    })}

                    {dayVisits.map((visit) => (
                      <VisitBlock
                        key={visit.id}
                        visit={visit}
                        isSelected={selectedVisitId === visit.id}
                        onSelect={() => setSelectedVisitId(visit.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {visits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-green/15 bg-ivory/50 px-4 py-6 text-sm text-muted">
            Inga schemalagda besök den här veckan.
          </p>
        ) : null}
      </div>

      {selectedVisit ? (
        <ScheduleVisitCard
          visit={selectedVisit}
          weekStartKey={weekStartKey}
          staffMembers={canAssignStaff ? staffMembers : []}
          canAssignStaff={canAssignStaff}
          onClose={() => setSelectedVisitId(null)}
        />
      ) : null}

      {createSlot ? (
        <ScheduleCreateBookingModal
          visitDate={createSlot.visitDate}
          visitTime={createSlot.visitTime}
          weekStartKey={weekStartKey}
          staffMembers={staffMembers}
          onClose={() => setCreateSlot(null)}
        />
      ) : null}
    </>
  );
}
