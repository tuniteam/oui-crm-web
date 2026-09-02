import { useMemo, useState } from 'react';
import { Check, ChevronDown, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeStore } from '@/contexts/useMeStore';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';
import type { MeRoleRelationship } from '@/features/user/types/me';
import { cn } from '@/lib/utils';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UI } from '@/constants';

type ProjectScopeProps = {
  /** Nom resolu par l'appelant : rattachement du contact, ou reponse de l'API. */
  projectName: string;
  /** Le fil d'Ariane mobile tronque plus court que sa version large. */
  compact?: boolean;
};

/**
 * Projet courant, en tete du fil d'Ariane.
 *
 * Meme mecanique que le selecteur de client de soft-m (`breadcrumb.tsx`) : on
 * liste les rattachements du contact, on n'offre la bascule qu'a partir de
 * deux, et changer de projet renvoie sur le premier ecran autorise plutot que
 * de rester sur une route qui appartenait a l'autre projet.
 *
 * Un operateur back-office n'a aucun rattachement : il voit le nom, jamais le
 * selecteur — il change de projet en repassant par la liste.
 */
export function ProjectScope({
  projectName,
  compact = false,
}: ProjectScopeProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const me = useMeStore((s) => s.me);
  const activeProjectId = useMeStore((s) => s.activeProjectId);
  const setActiveProjectId = useMeStore((s) => s.setActiveProjectId);

  const projects = useMemo<MeRoleRelationship[]>(
    () =>
      (me?.roleRelationships ?? [])
        .filter((r) => !!r.projectId)
        .slice()
        .sort(
          (a, b) =>
            (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
            (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
        ),
    [me],
  );

  // Le projet n'est pas un maillon du chemin, c'est la portee qui l'englobe :
  // il porte donc l'accent (pastille d'icone azur, nom en encre grasse) la ou
  // les maillons restent en gris. Sans ca il se lit comme un ancetre de plus.
  const label = (
    <>
      <span className="grid place-items-center size-5 rounded-md bg-primary/10 text-primary shrink-0">
        <FolderKanban className="size-3" />
      </span>
      <span
        className={cn(
          'truncate font-semibold text-foreground',
          compact && 'max-w-32 text-xs',
        )}
      >
        {projectName}
      </span>
    </>
  );

  // Un seul rattachement : le nom est une information, pas un choix.
  if (projects.length < 2) {
    return (
      <span className="inline-flex items-center gap-2 pb-0.5 border-b-2 border-transparent shrink-0">
        {label}
      </span>
    );
  }

  const onSelect = (nextProjectId: string) => {
    setOpen(false);
    if (nextProjectId === activeProjectId) return;
    setActiveProjectId(nextProjectId);
    navigate(getAfterLoginRedirect(useMeStore.getState()), { replace: false });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={UI.SIDEBAR.SWITCH_PROJECT}
          className="inline-flex items-center gap-2 pb-0.5 shrink-0 cursor-pointer border-b-2 border-transparent hover:border-border transition-colors"
        >
          {label}
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandList>
            {projects.map((project) => (
              <CommandItem
                key={project.projectId!}
                value={project.projectName ?? project.projectId!}
                onSelect={() => onSelect(project.projectId!)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4 shrink-0',
                    project.projectId === activeProjectId
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                {project.projectName ?? project.projectId}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
