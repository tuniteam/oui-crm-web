/**
 * La croix de fermeture d'une surface superposee — fenetre ou panneau.
 *
 * Elle est parfois le **seul** moyen de refermer : elle doit se viser sans
 * effort. D'ou une cible de 44 px autour d'une icone de 32, et un fond au
 * survol qui montre ou l'on clique.
 *
 * Partagee entre `dialog` et `sheet` : deux croix qui se ressemblent a peu pres
 * finissent toujours par diverger.
 */
export const OVERLAY_CLOSE_CLASS =
  'cursor-pointer absolute end-2 top-2 grid size-11 place-items-center rounded-md opacity-70 ring-offset-background transition-colors hover:bg-accent hover:opacity-100 disabled:pointer-events-none';
