import { atom } from 'jotai';

export type DrawerPayload =
  | { type: 'transaction'; id: string }
  | { type: 'item'; id: string }
  | null;

export const drawerPayloadState = atom<DrawerPayload>(null);
