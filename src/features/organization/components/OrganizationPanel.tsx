import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReferenceLabels } from '@/features/settings/hooks/useReferenceLabels';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toneOf } from '@/shared/constants/tone';
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_TONES,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  SALES_STATUS_LABELS,
  SALES_STATUS_TONES,
} from '../constants/organizationList.constants';
import { useOrganization } from '../hooks/useOrganization';
import type { OrganizationDetail } from '../types/organizationDetail';
import { OrganizationRestrictedPane } from './OrganizationRestrictedPane';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { useSearchParams } from 'react-router-dom';
import { ORGANIZATIONS_UI } from '../constants/organizationList.constants';
import { ACTIVITIES_UI } from '@/features/activity/constants/activity.constants';
import { OrganizationActivitiesTab } from '@/features/activity/components/OrganizationActivitiesTab';
import { OrganizationContactsTab } from './OrganizationContactsTab';
import { OrganizationSettingsTab } from './OrganizationSettingsTab';
import { OrganizationSummaryTab } from './OrganizationSummaryTab';

type Props = {
  organizationId: string | null;
  onOpenChange: (open: boolean) => void;
};

type PanelHooks = {
  organization: OrganizationDetail | null;
  loading: boolean;
  /** La fiche n'existe pas : le panneau se referme au lieu d'attendre. */
  notFound: boolean;
  typeLabel: string | null;
  labelOf: ReturnType<typeof useReferenceLabels>['labelOf'];
};

/**
 * Panneau lateral d'un organisme — US-01-03.
 *
 * Panneau et non fenetre modale : c'est le `openDrawer` de la maquette V8, et
 * il laisse la liste visible derriere, ce qui compte quand on parcourt des
 * fiches a la suite.
 *
 * Les onglets Actions, Commercial, Client et Support de la maquette ne sont
 * pas rendus : leurs routes appartiennent a l'US-01-08 et aux lots L2/L4.
 * Mieux vaut deux onglets qui fonctionnent que six dont quatre sont vides.
 */
/**
 * Donnees du panneau.
 *
 * Hook nomme plutot qu'une fonction inline dans `useHooks` : les regles des
 * hooks s'y appliquent normalement, et le slot ne porte plus qu'un seul appel.
 */
function usePanelData(organizationId: string | null, open: boolean): PanelHooks {
  const { organization, loading, notFound } = useOrganization(
    organizationId ?? undefined,
    open,
  );
  const { labelOf } = useReferenceLabels();

  return {
    organization,
    loading,
    notFound,
    labelOf,
    typeLabel: organization
      ? labelOf('STRUCTURE_TYPE', organization.type)
      : null,
  };
}

/** Onglets du panneau. */
const PANEL_TABS = {
  SUMMARY: 'summary',
  CONTACTS: 'contacts',
  ACTIVITIES: 'activities',
  SETTINGS: 'settings',
} as const;

/** Le temps de lire le message avant que le panneau ne se referme. */
const NOT_FOUND_CLOSE_DELAY_MS = 2500;

export function OrganizationPanel({ organizationId, onOpenChange }: Props) {
  const open = !!organizationId;
  const canReadContacts = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CONTACTS.READ),
  );
  /* L'onglet ne porte aujourd'hui que la suppression : sans le droit, il
     serait vide. Il paraitra pour tous quand l'archivage l'aura rejoint. */
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.DELETE),
  );

  /** L'onglet ouvert : le pied du panneau n'appartient qu'a la Synthese. */
  const [tab, setTab] = useState<string | null>(null);

  /*
   * Fermer le panneau remet son etat a zero.
   *
   * Sans cela, l'onglet ouvert **et** la demande d'ajout de contact
   * survivaient a la fermeture : rouvrir une fiche la montrait sur Contacts
   * avec la fenetre « Nouveau contact » deja ouverte, alors qu'on venait
   * seulement de demander a voir un organisme. L'etat d'un panneau ferme n'a
   * aucune raison d'etre conserve.
   */
  useEffect(() => {
    if (open) return;
    setTab(null);
    setAddContactOnOpen(false);
  }, [open]);
  /*
   * Le pied vit dans `ReusableSheet`, hors de la zone qui defile — c'est ce
   * qui le colle vraiment en bas, la ou un `sticky` pose dans le contenu
   * flotte au-dessus du reste. Mais les actions ont besoin du formulaire, qui
   * vit dans l'onglet : le panneau expose donc le conteneur, et l'onglet y
   * projette sa barre. Remonter le formulaire ici serait pire — il doit naitre
   * une fois la fiche chargee, et un hook ne s'appelle pas dans un `render`.
   */
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);
  /* Vrai seulement quand la bascule vient du bandeau de completude : cliquer
     soi-meme sur l'onglet ne doit pas ouvrir la fenetre d'ajout. */
  const [addContactOnOpen, setAddContactOnOpen] = useState(false);
  const canCreateContact = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CONTACTS.CREATE),
  );
  // Le formateur n'a rien sur les actions : l'onglet disparaît.
  const canReadActivities = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ACTIVITIES.READ),
  );

  /*
   * L'onglet ouvert vient de l'URL quand un lien le demande — l'agenda vise
   * les actions d'une fiche. Sans parametre, on retombe sur la synthese.
   */
  const [panelParams] = useSearchParams();
  const askedTab = panelParams.get(ORGANIZATIONS_UI.TAB_PARAM);
  const anchor = panelParams.get(ORGANIZATIONS_UI.ANCHOR_PARAM);
  const defaultTab =
    askedTab === PANEL_TABS.ACTIVITIES && canReadActivities
      ? PANEL_TABS.ACTIVITIES
      : askedTab === PANEL_TABS.CONTACTS && canReadContacts
        ? PANEL_TABS.CONTACTS
        : PANEL_TABS.SUMMARY;

  return (
    <ReusableSheet<PanelHooks>
      open={open}
      onOpenChange={onOpenChange}
      // Le panneau porte un formulaire : un clic a cote ou une touche Echap
      // ferait perdre la saisie sans le dire. Il ne se ferme qu'a la croix ou
      // par « Annuler ». (`preventClose` vaut deja `true` par defaut ; il
      // etait force a `false` ici.)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => usePanelData(organizationId, open)}
      title={
        organizationId ? <PanelTitle organizationId={organizationId} /> : ''
      }
      renderHeaderExtra={({ organization, typeLabel, labelOf }) =>
        organization ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {[
                typeLabel ?? organization.type,
                organization.city,
                `Dépt. ${organization.department}`,
                organization.bracketLabel,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Les teintes viennent des tables de la feature, jamais du
                  composant : la meme valeur porte la meme couleur ici et dans
                  la liste. */}
              <Badge
                variant={toneOf(SALES_STATUS_TONES, organization.salesStatus)}
                appearance="outline"
              >
                <BadgeDot />
                {SALES_STATUS_LABELS[organization.salesStatus]}
              </Badge>
              <Badge
                variant={toneOf(
                  CUSTOMER_STATUS_TONES,
                  organization.customerStatus,
                )}
                appearance="outline"
              >
                <BadgeDot />
                {CUSTOMER_STATUS_LABELS[organization.customerStatus]}
              </Badge>
              {organization.priority ? (
                <Badge
                  variant={toneOf(PRIORITY_TONES, organization.priority)}
                  appearance="outline"
                >
                  <BadgeDot />
                  {PRIORITY_LABELS[organization.priority]}
                </Badge>
              ) : null}
              {(organization.tags ?? []).map((t) => (
                <Badge key={t} variant="secondary" appearance="outline">
                  <BadgeDot />
                  {labelOf('TAG', t) ?? t}
                </Badge>
              ))}
            </div>
          </div>
        ) : null
      }
      renderFooter={({ organization }) =>
        (tab ?? PANEL_TABS.SUMMARY) === PANEL_TABS.SUMMARY &&
        organization &&
        organization.access !== 'RESTRICTED' ? (
          <div ref={setFooterSlot} className="flex w-full flex-wrap items-center justify-end gap-3" />
        ) : null
      }
      renderBody={({ organization, loading, notFound, typeLabel }) => {
        // Fiche disparue : on le dit et on referme, plutot que de laisser un
        // squelette gris indefiniment — ou pire, un formulaire qu'aucun
        // enregistrement ne pourrait aboutir.
        if (notFound) {
          return <PanelNotFound onClose={() => onOpenChange(false)} />;
        }

        if (loading || !organization) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          );
        }

        if (organization.access === 'RESTRICTED') {
          return (
            <OrganizationRestrictedPane
              organization={organization}
              typeLabel={typeLabel}
            />
          );
        }

        // `key` : changer de fiche recree le formulaire avec les bonnes
        // valeurs initiales, plutot que de reinitialiser l'existant.
        return (
          <Tabs
            key={organization.id}
            value={tab ?? defaultTab}
            onValueChange={(next) => {
              if (next !== PANEL_TABS.CONTACTS) setAddContactOnOpen(false);
              setTab(next);
            }}
          >
            {/* Trois onglets, pas les six de la V8 : Actions a rejoint la
                fiche avec l'US-01-08 ; Commercial, Client et Support
                appartiennent aux lots L2/L4. Mieux vaut trois onglets qui
                fonctionnent que six dont trois sont vides. */}
            <TabsList variant="line" className="mb-4 w-full justify-start">
              <TabsTrigger value={PANEL_TABS.SUMMARY}>
                {ORGANIZATION_DETAIL_UI.TABS.SUMMARY}
              </TabsTrigger>
              {canReadContacts ? (
                <TabsTrigger
                  value={PANEL_TABS.CONTACTS}
                  data-testid="organization-tab-contacts"
                >
                  {ORGANIZATION_DETAIL_UI.TABS.CONTACTS}
                </TabsTrigger>
              ) : null}
              {canReadActivities ? (
                <TabsTrigger
                  value={PANEL_TABS.ACTIVITIES}
                  data-testid="organization-tab-activities"
                >
                  {ACTIVITIES_UI.TAB}
                </TabsTrigger>
              ) : null}
              {canDelete ? (
                <TabsTrigger
                  value={PANEL_TABS.SETTINGS}
                  data-testid="organization-tab-settings"
                >
                  {ORGANIZATION_DETAIL_UI.TABS.SETTINGS}
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value={PANEL_TABS.SUMMARY}>
              <OrganizationSummaryTab
                organization={organization}
                onClose={() => onOpenChange(false)}
                footerSlot={footerSlot}
                /* Le contact principal manquant se comble dans son onglet :
                   le bandeau y emmene plutot que de le nommer sans issue. */
                onGoToContacts={
                  canReadContacts && canCreateContact
                    ? () => {
                        setAddContactOnOpen(true);
                        setTab(PANEL_TABS.CONTACTS);
                      }
                    : undefined
                }
              />
            </TabsContent>

            {canReadContacts ? (
              <TabsContent value={PANEL_TABS.CONTACTS}>
                <OrganizationContactsTab
                  organizationId={organization.id}
                  openAddOnMount={addContactOnOpen}
                />
              </TabsContent>
            ) : null}

            {canDelete ? (
              <TabsContent value={PANEL_TABS.SETTINGS}>
                <OrganizationSettingsTab
                  organization={organization}
                  onClose={() => onOpenChange(false)}
                />
              </TabsContent>
            ) : null}

            {/* L'onglet ne s'affiche que sur une fiche en acces `FULL` : le
                panneau restreint est rendu plus haut et n'arrive jamais ici,
                ce qui satisfait la regle « planifier exige FULL ». */}
            {canReadActivities ? (
              <TabsContent value={PANEL_TABS.ACTIVITIES}>
                <OrganizationActivitiesTab
                  organizationId={organization.id}
                  highlightId={anchor}
                />
              </TabsContent>
            ) : null}
          </Tabs>
        );
      }}
    />
  );
}

/**
 * Fiche introuvable.
 *
 * Le panneau se referme de lui-meme : il n'y a rien a y faire, et le laisser
 * ouvert sur un message inviterait a insister.
 */
function PanelNotFound({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, NOT_FOUND_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <p
      data-testid="organization-not-found"
      className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
    >
      <Info className="size-4 shrink-0" />
      {ORGANIZATION_DETAIL_UI.NOT_FOUND}
    </p>
  );
}

/** Titre du panneau : le nom de la fiche, ou un squelette pendant le chargement. */
function PanelTitle({ organizationId }: { organizationId: string }) {
  const { organization } = useOrganization(organizationId);
  return organization ? (
    <span data-testid="organization-panel-title">{organization.name}</span>
  ) : (
    <Skeleton className="h-6 w-64" />
  );
}
