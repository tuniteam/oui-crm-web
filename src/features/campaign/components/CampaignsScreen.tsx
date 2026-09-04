import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { FILTER_ALL, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TRANSITION_LABELS,
  CAMPAIGNS_UI,
} from '../constants/campaign.constants';
import { useCampaignMutations } from '../hooks/useCampaignMutations';
import { useCampaigns } from '../hooks/useCampaigns';
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TRANSITIONS,
  type Campaign,
  type CampaignStatus,
} from '../types/campaign';
import { CampaignDeleteDialog } from './CampaignDeleteDialog';
import { CampaignResultsPanel } from './CampaignResultsPanel';
import { CampaignTargetPanel } from './CampaignTargetPanel';
import { CampaignWindow } from './CampaignWindow';

const UI = CAMPAIGNS_UI;
const { CARD, RESULTS } = UI;

/** Période lisible : le serveur peut ne rendre qu'une des deux bornes. */
function periodOf(campaign: Campaign): string {
  const start = campaign.startDate ? formatShortDateFr(campaign.startDate) : '';
  const end = campaign.endDate ? formatShortDateFr(campaign.endDate) : '';
  if (start && end) return CARD.PERIOD(start, end);
  if (start) return CARD.PERIOD_FROM(start);
  if (end) return CARD.PERIOD_UNTIL(end);
  return CARD.NO_PERIOD;
}

/** Campagnes — L1 · US-01-11, tranche A. */
export default function CampaignsScreen() {
  const [status, setStatus] = useState<string>(FILTER_ALL);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [targeting, setTargeting] = useState<Campaign | null>(null);
  const [showingResults, setShowingResults] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);

  const canCreate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CAMPAIGNS.CREATE),
  );
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CAMPAIGNS.UPDATE),
  );
  // Le commercial ne l'a pas ; le formateur n'a rien du tout.
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CAMPAIGNS.DELETE),
  );

  const { campaigns, loading } = useCampaigns({
    status: status === FILTER_ALL ? undefined : (status as CampaignStatus),
  });
  const mutations = useCampaignMutations();

  const openWindow = (campaign: Campaign | null) => {
    setEditing(campaign);
    setWindowOpen(true);
  };

  return (
    <div className="space-y-4" data-testid="campaigns-screen">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{UI.TITLE}</h1>
          <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
            {UI.SUBTITLE}
          </p>
        </div>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger data-testid="campaign-filter-status" className="w-48">
              <SelectValue placeholder={UI.FILTER_ALL_STATUSES} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{UI.FILTER_ALL_STATUSES}</SelectItem>
              {CAMPAIGN_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {CAMPAIGN_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canCreate ? (
            <Button data-testid="campaign-add" onClick={() => openWindow(null)}>
              <CirclePlus className="size-4" />
              {UI.ADD}
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : campaigns.length === 0 ? (
        <div
          data-testid="campaigns-empty"
          className="rounded-lg border border-dashed border-border px-4 py-10 text-center"
        >
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="mx-auto mt-1 max-w-[60ch] text-sm text-muted-foreground">
            {UI.EMPTY.DESCRIPTION}
          </p>
        </div>
      ) : (
        // Deux par ligne, comme la maquette : une carte porte quatre mesures,
        // un tableau les aplatirait.
        <ul className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={canUpdate ? () => openWindow(campaign) : undefined}
              onStatus={
                canUpdate
                  ? (next) => void mutations.setStatus(campaign.id, next)
                  : undefined
              }
              busy={mutations.changingStatus}
              onTarget={() => setTargeting(campaign)}
              onResults={() => setShowingResults(campaign)}
              onDelete={canDelete ? () => setDeleting(campaign) : undefined}
            />
          ))}
        </ul>
      )}

      <CampaignWindow
        open={windowOpen}
        onOpenChange={setWindowOpen}
        campaign={editing}
      />

      <CampaignTargetPanel
        campaign={targeting}
        onOpenChange={(open) => !open && setTargeting(null)}
      />

      <CampaignResultsPanel
        campaign={showingResults}
        onOpenChange={(open) => !open && setShowingResults(null)}
      />

      <CampaignDeleteDialog
        campaign={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}

function CampaignCard({
  campaign,
  onEdit,
  onStatus,
  onTarget,
  onResults,
  onDelete,
  busy,
}: {
  campaign: Campaign;
  onEdit?: () => void;
  onStatus?: (next: CampaignStatus) => void;
  onTarget: () => void;
  onResults: () => void;
  onDelete?: () => void;
  busy: boolean;
}) {
  const target = campaign.organizationsCount;

  /*
   * Les quatre mesures viennent du serveur (`results`), jamais d'un calcul
   * local — la maquette, elle, les recalcule dans le navigateur. Au L1 seul
   * `activities` est alimenté : les trois autres restent à zéro, et le contrat
   * ne changera pas quand le L2 les remplira. On les affiche donc, en le
   * disant, plutôt que de les masquer.
   */
  const bars = [
    { key: 'activities', label: RESULTS.ACTIVITIES, value: campaign.results.activities, pending: false },
    { key: 'opportunities', label: RESULTS.OPPORTUNITIES, value: campaign.results.opportunities, pending: true },
    { key: 'quotes', label: RESULTS.QUOTES, value: campaign.results.quotes, pending: true },
    { key: 'signed', label: RESULTS.SIGNED, value: campaign.results.signed, pending: true },
  ];

  return (
    <li
      data-testid={`campaign-card-${campaign.id}`}
      className="flex flex-col rounded-lg border border-border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{campaign.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {(campaign.owner?.fullName ?? CARD.UNASSIGNED) +
              ' · ' +
              periodOf(campaign)}
          </p>
        </div>
        <Badge
          variant={campaign.status === 'ACTIVE' ? 'primary' : 'secondary'}
          appearance="outline"
          data-testid={`campaign-status-${campaign.id}`}
        >
          <BadgeDot />
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </Badge>
      </div>

      {campaign.description ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {campaign.description}
        </p>
      ) : null}

      <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {CARD.CRITERIA} :{' '}
        {campaign.criteria && Object.keys(campaign.criteria).length > 0
          ? Object.entries(campaign.criteria)
              .map(([k, v]) => `${k} = ${String(v)}`)
              .join(' · ')
          : CARD.NO_CRITERIA}
      </p>

      <div className="mt-3 space-y-1.5">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-muted-foreground">
              {bar.label}
            </span>
            <div className="h-1.5 grow overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: target > 0 ? `${Math.min(100, (bar.value / target) * 100)}%` : '0%',
                }}
              />
            </div>
            <span className="w-16 shrink-0 text-end font-mono text-xs">
              {bar.value}/{target}
            </span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{RESULTS.PENDING_HINT}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-primary"
          data-testid={`campaign-target-open-${campaign.id}`}
          onClick={onTarget}
        >
          {CARD.ORGANIZATIONS(target)}
        </Button>

        <div className="ms-auto flex items-center gap-2">
          {/* Seules les transitions légales sont proposées : le serveur refuse
              tout autre mouvement, statut identique compris. */}
          {onStatus
            ? CAMPAIGN_TRANSITIONS[campaign.status].map((next) => (
                <Button
                  key={next}
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  data-testid={`campaign-to-${next}-${campaign.id}`}
                  onClick={() => onStatus(next)}
                >
                  {CAMPAIGN_TRANSITION_LABELS[next]}
                </Button>
              ))
            : null}
          <Button
            variant="outline"
            size="sm"
            data-testid={`campaign-results-open-${campaign.id}`}
            onClick={onResults}
          >
            {UI.ACTIONS.RESULTS}
          </Button>
          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              data-testid={`campaign-edit-${campaign.id}`}
              onClick={onEdit}
            >
              {UI.ACTIONS.EDIT}
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="destructiveOutline"
              size="sm"
              data-testid={`campaign-delete-open-${campaign.id}`}
              onClick={onDelete}
            >
              {UI.ACTIONS.DELETE}
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
