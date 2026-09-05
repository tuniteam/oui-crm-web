import { Clock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { type OpeningDay, type OpeningHours } from '../types/organizationDetail';
import { groupOpeningHours, labelOfGroup } from '../utils/opening-hours';

const UI = ORGANIZATION_DETAIL_UI.OPENING_HOURS;

/**
 * Les horaires d'ouverture declares — L1 · US-01-15.
 *
 * **La semaine est rendue entière, pas la liste du contrat.** Les jours de
 * fermeture en sont absents — jamais présents avec une liste vide — donc les
 * afficher tels quels montrerait une mairie ouverte tous les jours qu'elle
 * déclare, et muette sur les autres. Une commune du jeu réel ne déclare qu'un
 * seul jour : sans les six « Fermé », l'écran serait un mensonge par omission,
 * et c'est précisément ce qu'un commercial a besoin de savoir avant de passer
 * un appel.
 *
 * Lecture seule : le champ vient de l'import depuis l'Annuaire de
 * l'administration, et l'API refuse qu'on le lui renvoie.
 */
export function OrganizationOpeningHours({
  openingHours,
  onEdit,
}: {
  openingHours?: OpeningHours | null;
  /** Ouvre la fenêtre d'édition. Absent quand l'utilisateur ne peut pas écrire. */
  onEdit?: () => void;
}) {
  /*
   * Sans horaires, le tableau n'a rien à montrer — mais l'action de saisie,
   * si : c'est justement la fiche qu'il faut compléter. On rend donc le seul
   * bouton plutôt que rien.
   */
  const empty = !openingHours || openingHours.days.length === 0;
  if (empty && !onEdit) return null;

  const groups = empty ? [] : groupOpeningHours(openingHours);
  const dayLabel = (day: OpeningDay) => UI.DAYS[day] ?? day;

  return (
    <div className="space-y-3" data-testid="organization-opening-hours">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 text-primary" />
          {UI.TITLE}
        </h3>
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="opening-hours-edit"
            onClick={onEdit}
          >
            <Pencil />
            {UI.EDIT}
          </Button>
        ) : null}
      </div>

      {empty ? (
        <p data-testid="opening-hours-empty" className="text-sm text-muted-foreground">
          {UI.NONE}
        </p>
      ) : null}

      <dl className="divide-y divide-border rounded-lg border border-border">
        {groups.map((group) => {
          const closed = group.slots.length === 0;
          return (
            <div
              key={group.days.join('-')}
              data-testid={`opening-group-${group.days.join('-')}`}
              className="flex items-baseline justify-between gap-4 px-3 py-2 text-sm"
            >
              <dt className={closed ? 'text-muted-foreground' : 'font-medium'}>
                {labelOfGroup(group, dayLabel)}
              </dt>
              <dd
                /*
                 * L'azur porte l'heure, pas le nom du jour : c'est l'horaire
                 * qu'on cherche du regard. La fermeture reste grise — une
                 * mairie fermee le dimanche n'est pas une anomalie, et le
                 * rouge du produit est reserve au destructif.
                 *
                 * Aucun fond teinte : dans ce produit, un aplat de couleur
                 * signale une pastille d'information, et ces lignes n'en sont
                 * pas. Voir `docs/REGLE-BADGE-VS-BOUTON.md`.
                 */
                className={
                  closed
                    ? 'text-muted-foreground'
                    : 'text-end font-medium tabular-nums text-primary'
                }
              >
                {closed
                  ? UI.CLOSED
                  : /* Deux créneaux = matin et après-midi : la virgule suffit
                       à dire la coupure méridienne. */
                    group.slots.map(UI.SLOT).join(', ')}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* La note de la structure — permanence, agence postale, saison. Sous le
          tableau : elle porte sur la semaine, pas sur une case. */}
      {!empty && openingHours?.comment ? (
        <p
          data-testid="opening-hours-comment"
          className="text-sm text-muted-foreground"
        >
          {openingHours.comment}
        </p>
      ) : null}
    </div>
  );
}
