"use client";

import { useMemo } from "react";
import { CheckCircle, RefreshCw01, File06, Activity } from "@untitledui/icons";
import type { RecordData } from "@/lib/twenty/types";
import { useNotes, type Note } from "@/lib/hooks/use-notes";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { cx } from "@/utils/cx";

interface ActivityPanelProps {
  objectName: string;
  record: RecordData;
}

type ActivityType = "created" | "updated" | "note";

interface ActivityEvent {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function formatAbsoluteDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const activityConfig: Record<
  ActivityType,
  { dotClass: string; icon: typeof CheckCircle }
> = {
  created: { dotClass: "bg-success-solid", icon: CheckCircle },
  updated: { dotClass: "bg-brand-solid", icon: RefreshCw01 },
  note: { dotClass: "bg-tertiary", icon: File06 },
};

// Loading skeleton for activity timeline
function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div className="relative flex flex-col items-center">
            <div className="size-3 rounded-full bg-tertiary" />
            {i < 3 && (
              <div className="mt-1 h-8 w-px bg-tertiary" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-4 w-3/4 rounded bg-tertiary" />
            <div className="h-3 w-1/3 rounded bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineEvent({
  event,
  isLast,
}: {
  event: ActivityEvent;
  isLast: boolean;
}) {
  const config = activityConfig[event.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center pt-1">
        {/* Dot */}
        <div
          className={cx(
            "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
            event.type === "created" && "bg-success-secondary",
            event.type === "updated" && "bg-brand-secondary",
            event.type === "note" && "bg-secondary",
          )}
        >
          <Icon
            className={cx(
              "size-3.5",
              event.type === "created" && "text-fg-success-primary",
              event.type === "updated" && "text-fg-brand-primary",
              event.type === "note" && "text-fg-tertiary",
            )}
            aria-hidden="true"
          />
        </div>
        {/* Vertical line */}
        {!isLast && (
          <div className="w-px flex-1 bg-tertiary" style={{ minHeight: 24 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 pb-4">
        <p className="text-sm font-medium text-secondary">
          {event.description}
        </p>
        <p
          className="text-xs text-quaternary"
          title={formatAbsoluteDate(event.timestamp)}
        >
          {formatTimeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  );
}

export function ActivityPanel({ objectName, record }: ActivityPanelProps) {
  const { notes, loading: notesLoading } = useNotes(objectName, record.id);

  const activities = useMemo(() => {
    const events: ActivityEvent[] = [];

    // Record creation event
    if (record.createdAt) {
      events.push({
        id: "record-created",
        type: "created",
        description: "Record created",
        timestamp: String(record.createdAt),
      });
    }

    // Record update event (only if different from creation)
    if (
      record.updatedAt &&
      record.createdAt &&
      String(record.updatedAt) !== String(record.createdAt)
    ) {
      events.push({
        id: "record-updated",
        type: "updated",
        description: "Record updated",
        timestamp: String(record.updatedAt),
      });
    }

    // Notes as activity events
    for (const note of notes) {
      events.push({
        id: `note-created-${note.id}`,
        type: "note",
        description: `Note added: ${note.title || "Untitled"}`,
        timestamp: note.createdAt,
      });

      // If note was updated after creation, add an update event
      if (note.updatedAt !== note.createdAt) {
        events.push({
          id: `note-updated-${note.id}`,
          type: "note",
          description: `Note updated: ${note.title || "Untitled"}`,
          timestamp: note.updatedAt,
        });
      }
    }

    // Sort newest first
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return events;
  }, [record.createdAt, record.updatedAt, notes]);

  if (notesLoading) {
    return <ActivitySkeleton />;
  }

  if (activities.length === 0) {
    return (
      <EmptyState size="sm">
        <EmptyState.Header pattern="none">
          <EmptyState.FeaturedIcon
            icon={Activity}
            color="gray"
            theme="modern"
          />
        </EmptyState.Header>
        <EmptyState.Content>
          <EmptyState.Title>No activity yet</EmptyState.Title>
          <EmptyState.Description>
            Activity for this record will appear here.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col">
      {activities.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  );
}
