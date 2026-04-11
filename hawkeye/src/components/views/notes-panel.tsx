"use client";

import { useCallback, useState } from "react";
import { File06, Plus, Edit05, Trash01, X, Check } from "@untitledui/icons";
import { useNotes, type Note } from "@/lib/hooks/use-notes";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { cx } from "@/utils/cx";

interface NotesPanelProps {
  objectName: string;
  recordId: string;
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
  });
}

// Loading skeleton for notes list
function NotesSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-secondary p-4">
          <div className="h-4 w-1/2 rounded bg-tertiary" />
          <div className="mt-2 h-3 w-full rounded bg-tertiary" />
          <div className="mt-1 h-3 w-3/4 rounded bg-tertiary" />
          <div className="mt-3 h-3 w-1/4 rounded bg-tertiary" />
        </div>
      ))}
    </div>
  );
}

// Inline form for creating or editing a note
function NoteForm({
  initialTitle = "",
  initialBody = "",
  onSave,
  onCancel,
  isSaving,
}: {
  initialTitle?: string;
  initialBody?: string;
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave(title.trim(), body.trim());
  };

  return (
    <div className="rounded-lg border border-brand bg-primary p-4 shadow-xs">
      <div className="flex flex-col gap-3">
        <Input
          label="Title"
          placeholder="Note title"
          size="sm"
          value={title}
          onChange={(value) => setTitle(value)}
          autoFocus
        />
        <TextArea
          label="Body"
          placeholder="Write your note..."
          size="sm"
          rows={4}
          value={body}
          onChange={(value) => setBody(value)}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            color="secondary"
            onClick={onCancel}
            isDisabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            color="primary"
            onClick={handleSubmit}
            isDisabled={!title.trim()}
            isLoading={isSaving}
            showTextWhileLoading
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// Individual note card component
function NoteCard({
  note,
  onEdit,
  onDelete,
  isDeleting,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  isDeleting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const bodyLines = note.body ? note.body.split("\n") : [];
  const isTruncatable = bodyLines.length > 3 || (note.body && note.body.length > 200);

  return (
    <div className="group rounded-lg border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-primary">
      {/* Header row: title + actions */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-primary">
          {note.title || "Untitled"}
        </h4>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition duration-100 ease-linear group-hover:opacity-100">
          <Button
            size="xs"
            color="tertiary"
            iconLeading={Edit05}
            onClick={() => onEdit(note)}
            aria-label="Edit note"
          />
          {showDeleteConfirm ? (
            <>
              <Button
                size="xs"
                color="primary-destructive"
                iconLeading={Check}
                onClick={() => {
                  onDelete(note.id);
                  setShowDeleteConfirm(false);
                }}
                isLoading={isDeleting}
                aria-label="Confirm delete"
              />
              <Button
                size="xs"
                color="tertiary"
                iconLeading={X}
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Cancel delete"
              />
            </>
          ) : (
            <Button
              size="xs"
              color="tertiary-destructive"
              iconLeading={Trash01}
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete note"
            />
          )}
        </div>
      </div>

      {/* Body */}
      {note.body && (
        <div className="mt-1.5">
          <p
            className={cx(
              "whitespace-pre-wrap text-sm text-tertiary",
              !isExpanded && isTruncatable && "line-clamp-3",
            )}
          >
            {note.body}
          </p>
          {isTruncatable && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="mt-2 text-xs text-quaternary">
        Updated {formatTimeAgo(note.updatedAt)}
      </p>
    </div>
  );
}

export function NotesPanel({ objectName, recordId }: NotesPanelProps) {
  const { notes, loading, error, mutating, createNote, updateNote, deleteNote, refetch } =
    useNotes(objectName, recordId);
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (title: string, body: string) => {
      const success = await createNote(title, body);
      if (success) {
        toast("Note created", "success");
        setIsCreating(false);
      } else {
        toast("Failed to create note", "error");
      }
    },
    [createNote, toast],
  );

  const handleUpdate = useCallback(
    async (title: string, body: string) => {
      if (!editingNote) return;
      const success = await updateNote(editingNote.id, { title, body });
      if (success) {
        toast("Note updated", "success");
        setEditingNote(null);
      } else {
        toast("Failed to update note", "error");
      }
    },
    [editingNote, updateNote, toast],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      setDeletingId(noteId);
      const success = await deleteNote(noteId);
      if (success) {
        toast("Note deleted", "success");
      } else {
        toast("Failed to delete note", "error");
      }
      setDeletingId(null);
    },
    [deleteNote, toast],
  );

  if (loading) {
    return <NotesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-error-primary">
          Failed to load notes: {error.message}
        </p>
        <Button size="sm" color="secondary" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add Note button */}
      {!isCreating && !editingNote && (
        <div className="flex justify-end">
          <Button
            size="sm"
            color="secondary"
            iconLeading={Plus}
            onClick={() => setIsCreating(true)}
          >
            Add Note
          </Button>
        </div>
      )}

      {/* Create form */}
      {isCreating && (
        <NoteForm
          onSave={handleCreate}
          onCancel={() => setIsCreating(false)}
          isSaving={mutating}
        />
      )}

      {/* Notes list */}
      {notes.length === 0 && !isCreating ? (
        <EmptyState size="sm">
          <EmptyState.Header pattern="none">
            <EmptyState.FeaturedIcon
              icon={File06}
              color="gray"
              theme="modern"
            />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>No notes yet</EmptyState.Title>
            <EmptyState.Description>
              Add a note to keep track of important details.
            </EmptyState.Description>
          </EmptyState.Content>
          <EmptyState.Footer>
            <Button
              size="sm"
              color="primary"
              iconLeading={Plus}
              onClick={() => setIsCreating(true)}
            >
              Add Note
            </Button>
          </EmptyState.Footer>
        </EmptyState>
      ) : (
        notes.map((note) =>
          editingNote?.id === note.id ? (
            <NoteForm
              key={note.id}
              initialTitle={note.title}
              initialBody={note.body}
              onSave={handleUpdate}
              onCancel={() => setEditingNote(null)}
              isSaving={mutating}
            />
          ) : (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNote}
              onDelete={handleDelete}
              isDeleting={deletingId === note.id}
            />
          ),
        )
      )}
    </div>
  );
}
