"use client";

import { useEffect, useState, useCallback } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { fetchAllObjects } from "../twenty/metadata-client";

// Objects excluded from navigation (Fix 27)
const NON_NAVIGABLE_OBJECTS = new Set([
  "calendarEvent",
  "calendarChannel",
  "calendarChannelEventAssociation",
  "calendarEventParticipant",
  "messageChannel",
  "messageChannelMessageAssociation",
  "messageChannelMessageAssociationMessageFolder",
  "messageFolder",
  "messageParticipant",
  "messageThread",
  "message",
  "blocklist",
  "connectedAccount",
  "timelineActivity",
  "workflowVersion",
  "workflowAutomatedTrigger",
  "workflowRun",
  "workflow",
  "attachment",
  "noteTarget",
  "taskTarget",
  "favorite",
  "favoriteFolder",
  "dashboard",
]);

let cachedObjects: ObjectMetadata[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

export function useMetadata() {
  const [objects, setObjects] = useState<ObjectMetadata[]>(cachedObjects ?? []);
  const [loading, setLoading] = useState(!cachedObjects);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedObjects && Date.now() - cacheTimestamp < CACHE_TTL) {
      setObjects(cachedObjects);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAllObjects()
      .then((data) => {
        cachedObjects = data;
        cacheTimestamp = Date.now();
        setObjects(data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const getObject = useCallback(
    (nameSingular: string) =>
      objects.find((o) => o.nameSingular === nameSingular) ?? null,
    [objects],
  );

  const getNavigableObjects = useCallback(
    () =>
      objects.filter(
        (o) => o.isActive && !NON_NAVIGABLE_OBJECTS.has(o.nameSingular),
      ),
    [objects],
  );

  return { objects, loading, error, getObject, getNavigableObjects };
}
