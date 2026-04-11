"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import type { ObjectMetadata, RecordData, FieldMetadata } from "@/lib/twenty/types";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarViewProps {
  object: ObjectMetadata;
  records: RecordData[];
  onRecordClick: (record: RecordData) => void;
}

export function CalendarView({ object, records, onRecordClick }: CalendarViewProps) {
  const visibleFields = useMemo(() => getVisibleFields(object), [object]);

  // Find all DATE/DATE_TIME fields
  const dateFields = useMemo(
    () =>
      object.fields.filter(
        (f) => (f.type === "DATE" || f.type === "DATE_TIME") && !["createdAt", "updatedAt", "deletedAt"].includes(f.name),
      ),
    [object],
  );

  const [selectedFieldName, setSelectedFieldName] = useState<string>(
    dateFields[0]?.name ?? "",
  );

  const activeField = useMemo(
    () => dateFields.find((f) => f.name === selectedFieldName) ?? dateFields[0] ?? null,
    [dateFields, selectedFieldName],
  );

  // Current month navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
  }, []);

  // Build the calendar grid days
  const calendarDays = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.month;

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // What day of the week does the month start on? (0=Sun, 1=Mon, ...)
    // We want Monday=0, so adjust
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6; // Sunday becomes 6

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month's trailing days
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month's days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Next month's leading days to fill to 6 rows (42 cells) or at least complete the last row
    const remainder = days.length % 7;
    if (remainder > 0) {
      const fill = 7 - remainder;
      for (let i = 1; i <= fill; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }

    return days;
  }, [currentMonth]);

  // Map records by date string for the active field
  const recordsByDate = useMemo(() => {
    if (!activeField) return new Map<string, RecordData[]>();

    const map = new Map<string, RecordData[]>();

    for (const record of records) {
      const rawValue = record[activeField.name];
      if (!rawValue) continue;

      // Parse ISO date string and get local date key using toLocaleDateString for timezone safety (Fix 24)
      const dateObj = new Date(rawValue as string);
      if (isNaN(dateObj.getTime())) continue;

      const parts = dateObj.toLocaleDateString("en-CA").split("-");
      const dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(record);
    }

    return map;
  }, [activeField, records]);

  const today = new Date();
  const todayKey = today.toLocaleDateString("en-CA");

  const monthLabel = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!activeField) {
    return (
      <div className="flex items-center justify-center p-8 text-tertiary">
        No DATE or DATE_TIME fields available for calendar view.
      </div>
    );
  }

  // Build items for the field selector dropdown
  const fieldSelectorItems = dateFields.map((f) => ({
    id: f.name,
    label: f.label,
  }));

  return (
    <div className="flex flex-col gap-3 h-full p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-primary">{monthLabel}</h3>
          <Button size="sm" color="secondary" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Field selector */}
          {dateFields.length > 1 && (
            <Select
              size="sm"
              placeholder="Select date field"
              items={fieldSelectorItems}
              selectedKey={selectedFieldName}
              onSelectionChange={(key) => {
                if (key) setSelectedFieldName(String(key));
              }}
            >
              {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          )}

          <div className="flex items-center">
            <Button
              size="sm"
              color="tertiary"
              iconLeading={ChevronLeft}
              onClick={goToPrevMonth}
              aria-label="Previous month"
            />
            <Button
              size="sm"
              color="tertiary"
              iconLeading={ChevronRight}
              onClick={goToNextMonth}
              aria-label="Next month"
            />
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto rounded-lg border border-secondary">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-secondary bg-secondary">
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold text-tertiary uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, index) => {
            const dateKey = dayInfo.date.toLocaleDateString("en-CA");
            const dayRecords = recordsByDate.get(dateKey) ?? [];
            const isToday = dateKey === todayKey;
            const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;

            return (
              <div
                key={`${dateKey}-${index}`}
                className={cx(
                  "min-h-24 border-b border-r border-secondary p-1.5 transition duration-100 ease-linear",
                  !dayInfo.isCurrentMonth && "bg-secondary/50",
                  isWeekend && dayInfo.isCurrentMonth && "bg-secondary/30",
                  // Remove right border on last column
                  (index + 1) % 7 === 0 && "border-r-0",
                )}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cx(
                      "inline-flex items-center justify-center text-xs font-medium",
                      isToday
                        ? "size-6 rounded-full bg-brand-solid text-white"
                        : dayInfo.isCurrentMonth
                          ? "text-primary"
                          : "text-quaternary",
                    )}
                  >
                    {dayInfo.date.getDate()}
                  </span>
                  {dayRecords.length > 3 && (
                    <span className="text-xs text-quaternary">
                      +{dayRecords.length - 3}
                    </span>
                  )}
                </div>

                {/* Event chips (max 3 shown) */}
                <div className="flex flex-col gap-0.5">
                  {dayRecords.slice(0, 3).map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => onRecordClick(record)}
                      className="w-full text-left rounded transition duration-100 ease-linear hover:opacity-80"
                    >
                      <Badge size="sm" color="brand" className="w-full truncate block">
                        {getRecordTitle(record, visibleFields)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
