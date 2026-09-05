import { useEffect, useMemo, useState } from 'react';
import { CopyPlus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SlotTimePicker } from '@/components/ui/slot-time-picker';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import type { OpeningDay, OpeningHours } from '../types/organizationDetail';
import {
  toDrafts,
  toOpeningHours,
  validateDrafts,
  type DayDraft,
} from '../utils/opening-hours';

const UI = ORGANIZATION_DETAIL_UI.OPENING_HOURS;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Les horaires de la fiche, tels que le formulaire les porte. */
  value?: OpeningHours | null;
  /** Rend les horaires au formulaire — rien ne part au serveur ici. */
  onChange: (next: OpeningHours | null) => void;
};

/**
 * Modifier les horaires d'ouverture — L1 · US-01-15.
 *
 * **Sept lignes fixes, jamais une liste qu'on ajoute.** Le contrat accepte
 * deux entrées pour le même jour — éprouvé en direct — et l'affichage n'en
 * lirait que la première : une journée disparaîtrait sans un mot. Éditer une
 * grille figée rend la faute impossible plutôt que d'avoir à la détecter.
 *
 * Trois autres valeurs que l'API laisse passer sont arrêtées ici : une fin
 * avant son début, deux créneaux qui se chevauchent, et l'après-midi saisi
 * avant le matin — remis dans l'ordre à la sortie.
 *
 * Comme le registre, la fenêtre **n'enregistre rien** : elle pose la valeur
 * dans le formulaire de la fiche, et « Enregistrer les modifications » reste
 * le geste de l'utilisateur.
 */
export function OpeningHoursWindow({ open, onOpenChange, value, onChange }: Props) {
  const [drafts, setDrafts] = useState<DayDraft[]>(() => toDrafts(value));
  const [comment, setComment] = useState(value?.comment ?? '');

  // Rouvrir doit repartir de la fiche, pas d'une saisie abandonnée.
  useEffect(() => {
    if (!open) return;
    setDrafts(toDrafts(value));
    setComment(value?.comment ?? '');
  }, [open, value]);

  const errors = useMemo(() => validateDrafts(drafts), [drafts]);
  const invalid = Object.keys(errors).length > 0;

  const patch = (day: OpeningDay, next: Partial<DayDraft>) =>
    setDrafts((prev) =>
      prev.map((d) => (d.day === day ? { ...d, ...next } : d)),
    );

  const toggle = (d: DayDraft, on: boolean) =>
    patch(d.day, {
      open: on,
      // Ouvrir un jour vierge propose un créneau à remplir, pas une ligne nue.
      ranges: on && d.ranges.length === 0 ? [{ from: '', to: '' }] : d.ranges,
    });

  const setRange = (
    d: DayDraft,
    index: number,
    part: 'from' | 'to',
    time: string,
  ) =>
    patch(d.day, {
      ranges: d.ranges.map((r, i) => (i === index ? { ...r, [part]: time } : r)),
    });

  /** Recopie la première journée ouverte sur toutes les autres. */
  const applyToAll = () => {
    const source = drafts.find((d) => d.open && d.ranges.length > 0);
    if (!source) return;
    setDrafts((prev) =>
      prev.map((d) =>
        d.open ? { ...d, ranges: source.ranges.map((r) => ({ ...r })) } : d,
      ),
    );
  };

  const confirm = () => {
    onChange(toOpeningHours(drafts, comment));
    onOpenChange(false);
  };

  const openDays = drafts.filter((d) => d.open).length;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.EDIT_TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-2xl"
      renderBody={() => (
        <div className="space-y-4" data-testid="opening-hours-window">
          <p className="text-sm text-muted-foreground">{UI.EDIT_LEAD}</p>

          <ul className="divide-y divide-border rounded-lg border border-border">
            {drafts.map((d) => (
              <li key={d.day} className="space-y-2 px-3 py-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Switch
                    id={`opening-switch-${d.day}`}
                    data-testid={`opening-switch-${d.day}`}
                    checked={d.open}
                    onCheckedChange={(on) => toggle(d, on)}
                  />
                  <Label
                    htmlFor={`opening-switch-${d.day}`}
                    className="w-24 cursor-pointer"
                  >
                    {UI.DAYS[d.day] ?? d.day}
                  </Label>

                  {!d.open ? (
                    <span className="text-sm text-muted-foreground">
                      {UI.CLOSED}
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {d.ranges.map((r, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <SlotTimePicker
                            value={r.from}
                            onChange={(t) => setRange(d, i, 'from', t)}
                            minutesStep={UI.STEP_MINUTES}
                          />
                          <span className="text-muted-foreground">–</span>
                          <SlotTimePicker
                            value={r.to}
                            onChange={(t) => setRange(d, i, 'to', t)}
                            minutesStep={UI.STEP_MINUTES}
                          />
                          {d.ranges.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              mode="icon"
                              aria-label={UI.REMOVE_SLOT}
                              data-testid={`opening-remove-${d.day}-${i}`}
                              onClick={() =>
                                patch(d.day, {
                                  ranges: d.ranges.filter((_, k) => k !== i),
                                })
                              }
                            >
                              <X />
                            </Button>
                          ) : null}
                        </div>
                      ))}

                      {/* Le contrat plafonne à deux créneaux : matin et
                          après-midi. Le bouton disparaît plutôt que d'échouer. */}
                      {d.ranges.length < 2 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          data-testid={`opening-add-${d.day}`}
                          onClick={() =>
                            patch(d.day, {
                              ranges: [...d.ranges, { from: '', to: '' }],
                            })
                          }
                        >
                          <Plus />
                          {UI.ADD_SLOT}
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>

                {errors[d.day] ? (
                  <p
                    data-testid={`opening-error-${d.day}`}
                    className="ps-14 text-sm text-destructive"
                  >
                    {UI.ERRORS[errors[d.day]]}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {/* Une mairie ouvre presque toujours aux mêmes heures : saisir cinq
              fois la même chose est le geste que cet écran doit éviter. */}
          {openDays > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="opening-apply-all"
              onClick={applyToAll}
            >
              <CopyPlus />
              {UI.APPLY_TO_ALL}
            </Button>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="opening-comment">{UI.COMMENT}</Label>
            <Textarea
              id="opening-comment"
              data-testid="opening-comment"
              rows={2}
              maxLength={UI.COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={UI.COMMENT_PLACEHOLDER}
            />
            <p className="text-end text-xs text-muted-foreground">
              {comment.length} / {UI.COMMENT_MAX}
            </p>
          </div>

          {/* Tout fermer efface : le dire avant, l'effacement n'étant pas
              distinguable d'une semaine vide à l'écran. */}
          {openDays === 0 ? (
            <p
              data-testid="opening-clears"
              className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm"
            >
              {UI.WILL_CLEAR}
            </p>
          ) : null}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="opening-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={invalid}
            data-testid="opening-confirm"
            onClick={confirm}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
