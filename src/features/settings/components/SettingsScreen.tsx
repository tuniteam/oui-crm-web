import { PERMISSIONS } from '@/constants';
import { useMemo, useState } from 'react';
import { useMeStore } from '@/contexts/useMeStore';
import { cn } from '@/lib/utils';
import { ComingSoon } from '@/components/shared/ComingSoon';
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

type NavItem = {
  key: SettingsTab;
  label: string;
  /** Permission requise pour voir l'entree. */
  permission: string;
};

type NavGroup = { heading: string; items: NavItem[] };

const G = SETTINGS_UI.GROUPS;
const I = SETTINGS_UI.ITEMS;
const T = SETTINGS_TABS;

/** Navigation reprise de la maquette V8 : quatre groupes, dans son ordre. */
const NAV: NavGroup[] = [
  {
    heading: G.ORGANISATION,
    items: [
      { key: T.COMPANY, label: I.COMPANY, permission: PERMISSIONS.SETTINGS.READ },
      { key: T.USERS, label: I.USERS, permission: PERMISSIONS.USERS.READ },
    ],
  },
  {
    heading: G.SECURITY,
    items: [
      { key: T.ROLES, label: I.ROLES, permission: PERMISSIONS.ROLES.READ },
      { key: T.SCOPES, label: I.SCOPES, permission: PERMISSIONS.SCOPES.READ },
      { key: T.AUDIT_LOG, label: I.AUDIT_LOG, permission: PERMISSIONS.AUDIT_LOG.READ },
    ],
  },
  {
    heading: G.BUSINESS,
    items: [
      { key: T.BUSINESS_RULES, label: I.BUSINESS_RULES, permission: PERMISSIONS.SETTINGS.READ },
      { key: T.PRICING, label: I.PRICING, permission: PERMISSIONS.PRICING.READ },
      { key: T.DOCUMENTS, label: I.DOCUMENTS, permission: PERMISSIONS.SETTINGS.READ },
      { key: T.REFERENCES, label: I.REFERENCES, permission: PERMISSIONS.REFERENCES.READ },
    ],
  },
  {
    heading: G.DATA,
    items: [
      { key: T.DATA, label: I.DATA, permission: PERMISSIONS.SETTINGS.READ },
    ],
  },
];

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

  // Les deux seuls panneaux qui lisent /settings ; inutile d'appeler
  // l'API tant qu'aucun n'est ouvert.
  const [tab, setTab] = useState<SettingsTab>(T.COMPANY);
  const needsSettings = tab === T.COMPANY || tab === T.BUSINESS_RULES;

  const { settings, loading } = useSettings(needsSettings && canReadSettings);

  const groups = useMemo(
    () =>
      NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPermission(item.permission)),
      })).filter((group) => group.items.length > 0),
    [hasPermission],
  );

  const activeLabel = NAV.flatMap((g) => g.items).find(
    (i) => i.key === tab,
  )?.label;

  const renderPane = () => {
    if (tab === T.DOCUMENTS) {
      return <DocumentsPane canUpdate={canUpdateSettings} />;
    }

    // Les referentiels ont leur propre permission : tous les roles lisent,
    // seul l'admin de projet ecrit.
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
    return <ComingSoon title={activeLabel} />;
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
        <nav aria-label={SETTINGS_UI.TITLE}>
          {groups.map((group) => (
            <div key={group.heading} className="mb-4">
              <p className="mb-1.5 px-2.5 text-xs font-medium uppercase text-muted-foreground/70">
                {group.heading}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    data-testid={`settings-tab-${item.key}`}
                    onClick={() => setTab(item.key)}
                    aria-current={tab === item.key ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-2.5 py-2 text-start text-sm transition-colors',
                      tab === item.key
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0">{renderPane()}</div>
      </div>
    </div>
  );
}
