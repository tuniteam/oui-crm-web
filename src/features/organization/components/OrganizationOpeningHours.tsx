import { Clock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { type OpeningDay, type OpeningHours } from '../types/organizationDetail';
import {
  groupOpeningHours,
  labelOfGroup,
  toHalfDays,
} from '../utils/opening-hours';

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
                 * L'heure ressort par le poids et l'alignement, jamais par
                 * l'azur : dans cette fiche, l'azur est ce qui se clique — le
                 * lien vers le site juste au-dessus, les boutons. Un horaire
                 * inerte de la meme couleur promettrait une action qui
                 * n'existe pas.
                 *
                 * La fermeture reste grise : une structure fermee le dimanche
                 * n'est pas une anomalie, et le rouge du produit est reserve
                 * au destructif. Aucun fond teinte non plus — un aplat de
                 * couleur signale une pastille d'information, et ces lignes
                 * n'en sont pas. Voir `docs/REGLE-BADGE-VS-BOUTON.md`.
                 */
                className={
                  closed
                    ? 'text-muted-foreground'
                    : 'grid shrink-0 grid-cols-2 gap-x-6 font-medium tabular-nums text-foreground'
                }
              >
                {closed
                  ? UI.CLOSED
                  : /*
                     * Deux colonnes fixes, matin et après-midi.
                     *
                     * Alignés à droite, les créneaux glissaient : un samedi
                     * ouvert le seul matin s'affichait sous la colonne de
                     * l'après-midi, et se lisait comme une ouverture l'après-
                     * midi. Chaque demi-journée garde sa place, vide comprise
                     * — le matin partagé se lit alors en colonne, et la
                     * différence d'après-midi saute aux yeux.
                     */
                    toHalfDays(group.slots).map((half, i) => (
                      <span key={i} className="text-end">
                        {half.map(UI.SLOT).join(' ')}
                      </span>
                    ))}
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
