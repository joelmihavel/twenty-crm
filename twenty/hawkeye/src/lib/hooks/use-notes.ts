"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlQuery } from "@/lib/twenty/graphql-client";

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteTargetEdge {
  node: {
    id: string;
    note: {
      id: string;
      title: string;
      body: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface NoteTargetsResponse {
  noteTargets: {
    edges: NoteTargetEdge[];
  };
}

interface CreateNoteResponse {
  createNote: {
    id: string;
    title: string;
    body: string;
  };
}

interface CreateNoteTargetsResponse {
  createNoteTargets: { id: string }[];
}

interface UpdateNoteResponse {
  updateNote: {
    id: string;
    title: string;
    body: string;
  };
}

interface DeleteNoteResponse {
  deleteNote: {
    id: string;
  };
}

export function useNotes(objectNameSingular: string, recordId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mutating, setMutating] = useState(false);

  const filterField = `${objectNameSingular}Id`;

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = `query FetchNoteTargets($filter: NoteTargetFilterInput!) {
        noteTargets(
          filter: $filter
          orderBy: { createdAt: DescNullsFirst }
          first: 50
        ) {
          edges {
            node {
              id
              note {
                id
                title
                body
                createdAt
                updatedAt
              }
            }
          }
        }
      }`;

      const data = await graphqlQuery<NoteTargetsResponse>(query, {
        filter: { [filterField]: { eq: recordId } },
      });
      const fetchedNotes: Note[] = (data.noteTargets?.edges ?? []).map(
        (edge) => ({
          id: edge.node.note.id,
          title: edge.node.note.title ?? "",
          body: edge.node.note.body ?? "",
          createdAt: edge.node.note.createdAt,
          updatedAt: edge.node.note.updatedAt,
        }),
      );

      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [filterField, recordId]);

  useEffect(() => {
    if (recordId) {
      fetchNotes();
    }
  }, [recordId, fetchNotes]);

  const createNote = useCallback(
    async (title: string, body: string): Promise<boolean> => {
      setMutating(true);
      try {
        // Step 1: Create the note
        const createMutation = `
          mutation CreateNote($data: NoteCreateInput!) {
            createNote(data: $data) {
              id
              title
              body
            }
          }
        `;

        const result = await graphqlQuery<CreateNoteResponse>(createMutation, {
          data: { title, body },
        });

        const noteId = result.createNote.id;

        // Step 2: Link note to the record via noteTarget
        const linkMutation = `
          mutation CreateNoteTarget($data: [NoteTargetCreateInput!]!) {
            createNoteTargets(data: $data) {
              id
            }
          }
        `;

        await graphqlQuery<CreateNoteTargetsResponse>(linkMutation, {
          data: [{ noteId, [filterField]: recordId }],
        });

        // Refetch notes to get the updated list
        await fetchNotes();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [filterField, recordId, fetchNotes],
  );

  const updateNote = useCallback(
    async (
      noteId: string,
      data: { title?: string; body?: string },
    ): Promise<boolean> => {
      setMutating(true);
      try {
        const mutation = `
          mutation UpdateNote($id: ID!, $data: NoteUpdateInput!) {
            updateNote(id: $id, data: $data) {
              id
              title
              body
            }
          }
        `;

        await graphqlQuery<UpdateNoteResponse>(mutation, {
          id: noteId,
          data,
        });

        await fetchNotes();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [fetchNotes],
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      setMutating(true);
      try {
        const mutation = `
          mutation DeleteNote($id: ID!) {
            deleteNote(id: $id) {
              id
            }
          }
        `;

        await graphqlQuery<DeleteNoteResponse>(mutation, { id: noteId });

        await fetchNotes();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [fetchNotes],
  );

  return {
    notes,
    loading,
    error,
    mutating,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
