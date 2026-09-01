import { SidebarFooter } from './sidebar-footer';
import { SidebarMenu } from './sidebar-menu';

/**
 * Rail de navigation sombre, tel que le decrit la maquette V8.
 *
 * La classe `dark` est posee en dur, sans condition : le rail est sombre dans
 * les deux themes de l'application. C'est ce qui permet aux composants qu'il
 * heberge — pied de page, menu accordeon, popover — de rester tels quels : ils
 * lisent `--foreground`, `--muted`, `--accent`, qui resolvent alors leurs
 * valeurs sombres. Seul le fond est force sur `--rail-bg`, la teinte de la V8,
 * que `--background` ne donnerait pas.
 *
 * La marque et le projet courant vivent dans le bandeau du haut, pas ici : le
 * rail ne porte que la navigation. Voir `header.tsx` et `breadcrumb.tsx`.
 *
 * Le `sidebarTheme` du contexte de layout devient sans effet ici : il n'y a
 * plus de rail clair a proposer.
 */
export function Sidebar() {
  return (
    <div className="sidebar dark bg-(--rail-bg) lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0">
      <div className="overflow-hidden flex flex-col grow">
        <div className="w-(--sidebar-default-width) flex flex-col grow min-h-0">
          <SidebarMenu />
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
}
