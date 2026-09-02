import { useState } from 'react';
import { CirclePlus, Info, TriangleAlert } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CONTACTS_UI,
  DELETE_CONTACT_WINDOW,
} from '../constants/contact.constants';
import { useContactMutations } from '../hooks/useContactMutations';
import { useContacts } from '../hooks/useContacts';
import type { Contact } from '../types/contact';
import {
  ContactWindow,
  contactCreatePayload,
  contactUpdatePayload,
} from './ContactWindow';
import { DeleteContactWindow } from './DeleteContactWindow';

const UI = CONTACTS_UI;

/** Initiales, comme la V8. Un contact sans prénom n'en donne qu'une. */
const initialsOf = (c: Contact) =>
  `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const fullNameOf = (c: Contact) =>
  [c.civility, c.firstName, c.lastName].filter(Boolean).join(' ');

export function OrganizationContactsTab({
  organizationId,
}: {
  organizationId: string;
}) {
  const { contacts, loading, forbidden } = useContacts(organizationId);
  const mutations = useContactMutations(organizationId);

  const canCreate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CONTACTS.CREATE),
  );
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CONTACTS.UPDATE),
  );
  // Un commercial ne l'a pas : l'action disparaît plutôt que d'échouer.
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CONTACTS.DELETE),
  );

  const [editing, setEditing] = useState<Contact | null>(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Règle d'accès du contrat : les contacts sont les détails d'une fiche. Une
  // fiche hors périmètre se voit en liste, ses contacts non.
  if (forbidden) {
    return (
      <p
        data-testid="contacts-forbidden"
        className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <Info className="mt-0.5 size-4 shrink-0" />
        {UI.FORBIDDEN}
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="organization-contacts">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{UI.INTRO}</p>
        {canCreate ? (
          <Button
            data-testid="contact-add"
            onClick={() => {
              setEditing(null);
              setWindowOpen(true);
            }}
          >
            <CirclePlus className="size-4" />
            {UI.ADD}
          </Button>
        ) : null}
      </div>

      {contacts.length === 0 ? (
        <div
          data-testid="contacts-empty"
          className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
        >
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {UI.EMPTY.DESCRIPTION}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li
              key={c.id}
              data-testid={`contact-row-${c.id}`}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {initialsOf(c)}
              </span>

              <div className="min-w-0 grow space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{fullNameOf(c)}</span>
                  {c.isPrimary ? (
                    <Badge variant="primary" appearance="outline">
                      {UI.BADGES.PRIMARY}
                    </Badge>
                  ) : null}
                  {c.optOut ? (
                    <Badge variant="destructive" appearance="outline">
                      {UI.BADGES.OPT_OUT}
                    </Badge>
                  ) : null}
                  {/* Deviné à l'import, jamais confirmé : à vérifier. */}
                  {c.extractedFromNote ? (
                    <Badge variant="warning" appearance="outline">
                      <TriangleAlert className="size-3" />
                      {UI.BADGES.EXTRACTED}
                    </Badge>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  {[
                    c.role || UI.FALLBACKS.ROLE,
                    c.email || UI.FALLBACKS.EMAIL,
                    c.mobile || c.phone || UI.FALLBACKS.PHONE,
                  ].join(' · ')}
                </p>

                {c.notes ? (
                  <p className="text-xs text-muted-foreground">{c.notes}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {canUpdate ? (
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`contact-edit-${c.id}`}
                    onClick={() => {
                      setEditing(c);
                      setWindowOpen(true);
                    }}
                  >
                    {UI.ACTIONS.EDIT}
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid={`contact-delete-${c.id}`}
                    onClick={() => setDeleting(c)}
                  >
                    {UI.ACTIONS.DELETE}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContactWindow
        open={windowOpen}
        onOpenChange={setWindowOpen}
        contact={editing}
        saving={mutations.saving}
        onSubmit={(values) =>
          editing
            ? mutations.update(editing.id, contactUpdatePayload(values))
            : mutations.create(contactCreatePayload(values))
        }
      />

      {deleting ? (
        <DeleteContactWindow
          contact={deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          deleting={mutations.deleting}
          onDelete={() => mutations.remove(deleting.id)}
          onOptOut={() => mutations.optOut(deleting.id)}
          labels={DELETE_CONTACT_WINDOW}
        />
      ) : null}
    </div>
  );
}
