import { PERMISSIONS } from '@/constants';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  FileText,
  Globe2,
  ListChecks,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useMeStore } from '@/contexts/useMeStore';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SETTINGS_TABS,
  SETTINGS_UI,
  type SettingsTab,
} from '../constants/constants';
import { useSettings } from '../hooks/useSettings';
import { BusinessRulesPane } from './panes/BusinessRulesPane';
import { CompanyPane } from './panes/CompanyPane';
import { DocumentsPane } from './panes/DocumentsPane';
import { ReferenceItemsPane } from './panes/ReferenceItemsPane';
import { ScopesPane } from './panes/ScopesPane';

type NavItem = {
  key: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: string;
};

const I = SETTINGS_UI.ITEMS;
const D = SETTINGS_UI.DESCRIPTIONS;
const T = SETTINGS_TABS;

/**
 * Les quatre panneaux réellement disponibles ici.
 *
 * La maquette V8 en listait dix, mais six d'entre eux menaient à un écran
 * d'attente ou dupliquaient une entrée du menu projet — utilisateurs, rôles,
 * périmètres, journal ont leur propre écran. Une navigation où plus de la
 * moitié des liens ne mène nulle part n'aide personne : on ne garde que ce
 * qui ouvre vraiment quelque chose.
 */
const NAV: NavItem[] = [
  {
    key: T.COMPANY,
    label: I.COMPANY,
    description: D.COMPANY,
    icon: Building2,
    permission: PERMISSIONS.SETTINGS.READ,
  },
  {
    key: T.BUSINESS_RULES,
    label: I.BUSINESS_RULES,
    description: D.BUSINESS_RULES,
    icon: SlidersHorizontal,
    permission: PERMISSIONS.SETTINGS.READ,
  },
  {
    key: T.DOCUMENTS,
    label: I.DOCUMENTS,
    description: D.DOCUMENTS,
    icon: FileText,
    permission: PERMISSIONS.SETTINGS.READ,
  },
  {
    key: T.REFERENCES,
    label: I.REFERENCES,
    description: D.REFERENCES,
    icon: ListChecks,
    permission: PERMISSIONS.REFERENCES.READ,
  },
  {
    key: T.SCOPES,
    label: I.SCOPES,
    description: D.SCOPES,
    icon: Globe2,
    permission: PERMISSIONS.SCOPES.READ,
  },
];

const TABS: SettingsTab[] = NAV.map((item) => item.key);

function PaneSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsScreen() {
  const hasPermission = useMeStore((s) => s.hasPermission);
  const canReadSettings = hasPermission(PERMISSIONS.SETTINGS.READ);
  const canUpdateSettings = hasPermission(PERMISSIONS.SETTINGS.UPDATE);

  // Le panneau ouvert vit dans l'URL : un lien profond, un rafraichissement
  // ou un retour arriere retombent sur le meme panneau. C'est aussi ce qui
  // permet au menu projet de pointer directement sur les referentiels.
  const [params, setParams] = useSearchParams();
  const requested = params.get(SETTINGS_UI.TAB_PARAM);
  const tab: SettingsTab = TABS.includes(requested as SettingsTab)
    ? (requested as SettingsTab)
    : T.COMPANY;

  const setTab = (next: SettingsTab) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set(SETTINGS_UI.TAB_PARAM, next);
    // Naviguer entre panneaux n'est pas une etape d'historique.
    setParams(nextParams, { replace: true });
  };

  const needsSettings = tab === T.COMPANY || tab === T.BUSINESS_RULES;

  const { settings, loading } = useSettings(needsSettings && canReadSettings);

  const visible = useMemo(
    () => NAV.filter((item) => hasPermission(item.permission)),
    [hasPermission],
  );

  const renderPane = () => {
    if (tab === T.DOCUMENTS) {
      return <DocumentsPane canUpdate={canUpdateSettings} />;
    }

    // Les referentiels ont leur propre permission : tous les roles lisent,
    // seul l'admin de projet ecrit.
    // Les perimetres ont leur propre permission : `scopes:read` pour lire,
    // que le commercial n'a pas.
    if (tab === T.SCOPES) {
      return <ScopesPane />;
    }

    if (tab === T.REFERENCES) {
      return (
        <ReferenceItemsPane
          canUpdate={hasPermission(PERMISSIONS.REFERENCES.UPDATE)}
        />
      );
    }

    if (needsSettings) {
      if (loading || !settings) return <PaneSkeleton />;
      return tab === T.COMPANY ? (
        <CompanyPane company={settings.company} canUpdate={canUpdateSettings} />
      ) : (
        <BusinessRulesPane settings={settings} canUpdate={canUpdateSettings} />
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{SETTINGS_UI.TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {SETTINGS_UI.SUBTITLE}
        </p>
      </div>

      {/* Disposition de la V8 : navigation a gauche, panneau a droite.
          Elle passe au-dessus sur petit ecran. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label={SETTINGS_UI.TITLE} className="flex flex-col gap-1">
          {visible.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                data-testid={`settings-tab-${item.key}`}
                onClick={() => setTab(item.key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors',
                  active
                    ? 'border-primary/40 bg-accent'
                    : 'border-transparent hover:bg-accent/50',
                )}
              >
                <item.icon
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-sm',
                      active ? 'font-medium text-foreground' : 'text-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">{renderPane()}</div>
      </div>
    </div>
  );
}
