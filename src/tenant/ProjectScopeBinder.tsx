import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useMeStore } from '@/contexts/useMeStore';
import { useProjectModeStore } from '@/contexts/useProjectModeStore';

type ProjectScopeBinderProps = {
  children: React.ReactNode;
  /** Bascule tout le menu sur le projet. Faux pour une simple consultation. */
  enableProjectMode?: boolean;
};

/**
 * Lie le projet de l'URL au scope applicatif : l'intercepteur y lit
 * `x-project-id`, le menu y lit le projet courant.
 *
 * Le nettoyage au demontage est essentiel : sans lui, quitter un projet
 * laisserait l'en-tete actif et les appels suivants partiraient sur le
 * mauvais projet.
 */
export function ProjectScopeBinder({
  children,
  enableProjectMode = false,
}: ProjectScopeBinderProps) {
  const { projectId } = useParams<{ projectId?: string }>();

  const setActiveProjectId = useMeStore((s) => s.setActiveProjectId);
  const enable = useProjectModeStore((s) => s.enable);
  const disable = useProjectModeStore((s) => s.disable);

  const resolved = projectId ?? null;

  useEffect(() => {
    setActiveProjectId(resolved);
    if (enableProjectMode) enable();

    return () => {
      setActiveProjectId(null);
      if (enableProjectMode) disable();
    };
  }, [resolved, enableProjectMode, setActiveProjectId, enable, disable]);

  return <>{children}</>;
}
