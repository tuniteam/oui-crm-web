/**
 * Centralized status → badge mapping for the entire application.
 * Every status badge should use this config via <StatusBadge />.
 *
 * variant  = Badge variant from oui-crm theme
 * label    = French display label
 */

type StatusConfig = {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive';
  label: string;
};

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  // ── Common ──
  DRAFT: { variant: 'warning', label: 'Brouillon' },
  ACTIVE: { variant: 'success', label: 'Actif' },
  INACTIVE: { variant: 'secondary', label: 'Inactif' },
  PENDING: { variant: 'warning', label: 'En attente' },
  SUSPENDED: { variant: 'destructive', label: 'Suspendu' },
  ARCHIVED: { variant: 'secondary', label: 'Archivé' },

  // ── Invoice specific ──
  VALIDATED: { variant: 'primary', label: 'Validée' },
  SENT: { variant: 'info', label: 'Émise' },
  PARTIALLY_PAID: { variant: 'warning', label: 'Part. payée' },
  PAID: { variant: 'success', label: 'Payée' },

  // ── Payment specific ──
  COMPLETED: { variant: 'success', label: 'Encaissé' },
  FAILED: { variant: 'destructive', label: 'Échoué' },
  REFUNDED: { variant: 'secondary', label: 'Remboursé' },
} as const;
