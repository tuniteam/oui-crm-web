import type { AgendaHorizon, AgendaItem } from '../types/agenda';
import { daysFromToday } from './activity-date';

/**
 * Ou ranger un creneau, du point de vue de l'urgence.
 *
 * Une action **realisee** part a l'historique quelle que soit sa date : elle ne
 * demande plus rien. Le retard vient du serveur (`isLate`) et n'est jamais
 * recalcule — un calcul local divergerait d'un fuseau.
 *
 * Partage par la vue Liste, qui s'en sert pour grouper, et par la grille du
 * mois, qui s'en sert pour colorer : les deux vues disent alors la meme chose
 * de la meme action.
 */
export function horizonOf(event: AgendaItem): AgendaHorizon {
  if (event.status === 'DONE') return 'done';
  if (event.isLate) return 'late';
  const days = daysFromToday(event.date) ?? 0;
  if (days === 0) return 'today';
  if (days <= 7) return 'week';
  if (days <= 30) return 'month';
  return 'later';
}
