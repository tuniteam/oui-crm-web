import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  title: string;
  description: string;
  backRoute: string;
  backLabel: string;
};

/**
 * Etat affiche quand une fiche est introuvable ou que sa lecture echoue.
 * Sans lui, un 404 ou un 500 rend une page entierement blanche, sans rien
 * indiquer a l'utilisateur ni moyen de repartir.
 */
export function NotFoundState({
  title,
  description,
  backRoute,
  backLabel,
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        <Button variant="outline" asChild>
          <Link to={backRoute}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
