import { Badge, BadgeDot } from '@/components/ui/badge';
import { STATUS_CONFIG } from './status-config';

type Props = {
  status: string;
};

/**
 * Pastille d'etat : pilule + point de couleur pleine. Le point est le second
 * marqueur d'etiquette, celui qui tient meme quand la pastille est posee a
 * cote d'un bouton. Voir `docs/REGLE-BADGE-VS-BOUTON.md`.
 */
export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="outline" appearance="light" size="sm">
        <BadgeDot />
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      <BadgeDot />
      {config.label}
    </Badge>
  );
}
