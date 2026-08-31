// src/contexts/useMeStore.ts
import type { MeResponse, MeRoleRelationship } from '@/features/user/types/me';
import { create } from 'zustand';

export type MeStoreState = {
  me: MeResponse | null;

  setMe: (me: MeResponse) => void;
  clearMe: () => void;

  isBackoffice: () => boolean;

  getActiveRoleRelationship: () => MeRoleRelationship | null;

  getPermissions: () => string[];

  hasPermission: (permissionCode: string) => boolean;
};

export const useMeStore = create<MeStoreState>((set, get) => ({
  me: null,


  setMe: (me) => {
    set({ me });
   
  },

  clearMe: () => set({ me: null }),

  isBackoffice: () => get().me?.contactType === 'BACKOFFICE',

  getActiveRoleRelationship: () => {
    const store = get();
    const me = store.me;

    if (!me || !me.roleRelationships?.length) return null;

   

    

    return (
      me.roleRelationships[0] ?? null
    );
  },





  getPermissions: () =>
    get().getActiveRoleRelationship()?.permissions ?? [],

  hasPermission: (permissionCode) => {
    const store = get();
    const active = store.getActiveRoleRelationship();
    if (!active) return false;
    return (active.permissions ?? []).includes(permissionCode);
  },
}));
