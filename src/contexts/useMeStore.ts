// src/contexts/useMeStore.ts
import type { MeResponse, MeRoleRelationship } from '@/features/user/types/me';
import { create } from 'zustand';

/**
 * Droits de l'utilisateur courant, portee par le projet actif.
 *
 * Le `projectId` porte le multi-tenant, comme le `clientId` de soft-m : un
 * contact peut etre rattache a plusieurs projets, chacun avec ses propres
 * permissions et modules. Toutes les lectures de droits passent donc par la
 * relation active, jamais par la premiere venue.
 *
 * Un contact BACKOFFICE n'est rattache a aucun projet : il prend sa premiere
 * relation par ordre d'affichage.
 */
export type MeStoreState = {
  me: MeResponse | null;

  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;

  setMe: (me: MeResponse) => void;
  clearMe: () => void;

  isBackoffice: () => boolean;

  getActiveRoleRelationship: () => MeRoleRelationship | null;

  getActiveProjectId: () => string | null;
  getActiveProjectName: () => string | null;

  getPermissions: () => string[];
  hasPermission: (permissionCode: string) => boolean;

  getActiveProjectModules: () => string[];
  hasModule: (moduleCode: string) => boolean;
};

/** Tri par ordre d'affichage ; les relations sans ordre passent en dernier. */
function byDisplayOrder(a: MeRoleRelationship, b: MeRoleRelationship): number {
  return (
    (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
  );
}

export const useMeStore = create<MeStoreState>((set, get) => ({
  me: null,

  activeProjectId: null,
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),

  setMe: (me) => {
    set({ me });
    const store = get();

    // Le back-office n'a pas de projet actif : ses ecrans ne sont pas scopes.
    if (store.isBackoffice()) return;

    // Selection par defaut : premier projet par ordre d'affichage. L'URL peut
    // ensuite imposer un autre projet (cf. garde de route).
    const firstProjectRel = [...(me.roleRelationships ?? [])]
      .sort(byDisplayOrder)
      .find((r) => !!r.projectId);

    set({ activeProjectId: firstProjectRel?.projectId ?? null });
  },

  clearMe: () => set({ me: null, activeProjectId: null }),

  isBackoffice: () => get().me?.contactType === 'BACKOFFICE',

  getActiveRoleRelationship: () => {
    const store = get();
    const me = store.me;

    if (!me || !me.roleRelationships?.length) return null;

    if (store.isBackoffice()) {
      return [...me.roleRelationships].sort(byDisplayOrder)[0] ?? null;
    }

    const activeProjectId = store.activeProjectId;
    if (!activeProjectId) return null;

    return (
      me.roleRelationships.find(
        (r) => r.projectId && r.projectId === activeProjectId,
      ) ?? null
    );
  },

  getActiveProjectId: () => get().activeProjectId,

  getActiveProjectName: () =>
    get().getActiveRoleRelationship()?.projectName ?? null,

  getPermissions: () => get().getActiveRoleRelationship()?.permissions ?? [],

  hasPermission: (permissionCode) => {
    const active = get().getActiveRoleRelationship();
    if (!active) return false;
    return (active.permissions ?? []).includes(permissionCode);
  },

  getActiveProjectModules: () =>
    get().getActiveRoleRelationship()?.modules ?? [],

  hasModule: (moduleCode) => get().getActiveProjectModules().includes(moduleCode),
}));
