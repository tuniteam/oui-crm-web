import { toAbsoluteUrl } from '@/lib/helpers';
import { useMeStore } from '@/contexts/useMeStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { WELCOME_PENDING } from '../constants';

/**
 * Accueil d'un compte qui a des droits, mais dont aucun ecran n'est encore
 * construit.
 *
 * Le cas se produit des qu'un role porte sur un lot a venir : un commercial a
 * une trentaine de permissions — organismes, opportunites, devis, agenda — et
 * pas un seul ecran livre qui les consomme. L'envoyer sur « Vous ne disposez
 * pas de permissions » etait faux sur le fond et l'envoyait se plaindre d'un
 * probleme inexistant aupres de son administrateur.
 *
 * On affiche donc son role et son perimetre : c'est la preuve visible que son
 * compte est correctement configure.
 */
export function WelcomePending() {
  const relationship = useMeStore((s) => s.getActiveRoleRelationship());
  const projectName = useMeStore((s) => s.getActiveProjectName());

  return (
    <div className="flex grow items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <img
            src={toAbsoluteUrl(WELCOME_PENDING.IMAGES.LIGHT)}
            alt={WELCOME_PENDING.IMAGE_ALT}
            className="h-40 w-auto max-w-full"
          />

          <h1 className="text-2xl font-semibold tracking-tight">
            {WELCOME_PENDING.SUBTITLE}
          </h1>

          <p className="max-w-md text-sm text-muted-foreground">
            {WELCOME_PENDING.DESCRIPTION}
          </p>

          {relationship ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                {WELCOME_PENDING.SCOPE_LABEL}
              </span>
              {projectName ? (
                <Badge variant="secondary" appearance="outline">
                  {projectName}
                </Badge>
              ) : null}
              {relationship.roleLabel ? (
                <Badge variant="primary" appearance="outline">
                  {relationship.roleLabel}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
