import { Card, CardContent } from '@/components/ui/card';

/**
 * Une carte d'action : ce que fait le geste à gauche, son bouton à droite.
 *
 * Le bouton arrive en `children` plutôt que par des propriétés — libellé,
 * icône, variante, état désactivé. Une carte qui les recevrait une à une
 * finirait par en porter six, et par décider à la place de l'appelant de ce
 * qu'un geste a de dangereux. Ici la carte tient la disposition, l'appelant
 * tient le geste.
 *
 * Partagée par la zone de danger d'un projet et la fiche d'un utilisateur :
 * retrait, réactivation, suppression définitive, cycle de vie.
 */
export function ActionCard({
  label,
  description,
  testId,
  children,
}: {
  label: string;
  description: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
