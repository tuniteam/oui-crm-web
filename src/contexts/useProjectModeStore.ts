import { create } from 'zustand';

/**
 * Mode « projet ouvert ». Separe de l'identifiant du projet actif
 * (useMeStore.activeProjectId) : on peut etre cadre sur un projet — pour
 * consulter sa fiche depuis l'administration — sans etre dans le mode qui
 * bascule tout le menu.
 */
type ProjectModeState = {
  isProjectMode: boolean;
  enable: () => void;
  disable: () => void;
};

export const useProjectModeStore = create<ProjectModeState>((set) => ({
  isProjectMode: false,
  enable: () => set({ isProjectMode: true }),
  disable: () => set({ isProjectMode: false }),
}));
