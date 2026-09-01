import { COMING_SOON } from '@/constants/coming-soon';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  /** Nom de l'écran attendu, repris du menu. */
  title?: string;
};

/**
 * Ecran d'attente d'une fonctionnalite non encore livree.
 *
 * Prefere a une entree de menu desactivee : l'utilisateur peut naviguer, voir
 * ou il arrivera, et comprendre pourquoi c'est vide — plutot que de buter sur
 * un element grise sans explication.
 */
export function ComingSoon({ title }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <img
          src={COMING_SOON.ILLUSTRATION}
          alt={COMING_SOON.ILLUSTRATION_ALT}
          className="h-40 w-auto max-w-full"
        />
        <h2 className="text-lg font-semibold">{title ?? COMING_SOON.TITLE}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {COMING_SOON.DESCRIPTION}
        </p>
      </CardContent>
    </Card>
  );
}
