// src/components/layouts/layout-1/shared/details-page/DetailsSection.tsx
import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

/**
 * Section d'une page de detail : un titre, une action facultative, un filet.
 *
 * L'action d'entete est *secondaire* — elle ouvre la modification de cette
 * carte-la. Les quatre cartes du profil melangeaient deux traitements, deux en
 * `outline` et deux en primaire degrade, ce qui faisait lire une hierarchie
 * qui n'existe pas. Elles portent toutes `variant="outline" size="sm"`.
 */
export function DetailsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {action}
      </div>
      <Separator className="my-3" />
      {children}
    </div>
  );
}
