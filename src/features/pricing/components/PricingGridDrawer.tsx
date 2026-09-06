import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatInteger } from '@/shared/utils/string-utils';
import { PRICING_UI } from '../constants/pricing.constants';
import { usePricingGrid } from '../hooks/usePricingGrids';
import type { PricingGridContent } from '../types/pricingGrid';

const UI = PRICING_UI.DRAWER;
const SECTIONS = PRICING_UI.DRAWER.SECTIONS;

/** Un prix, jamais recalculé — le moteur tarifaire est la seule autorité. */
const price = (n: number) => `${formatInteger(Math.round(n))} €`;

/**
 * Un tableau large défile **dans son propre conteneur**.
 *
 * Les frais de mise en place forment une matrice de trois postes × trois
 * formules × six strates : huit colonnes. La règle du projet veut qu'un tel
 * contenu ne fasse jamais partir la page de travers.
 */
function Wide({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

function Section({
  value,
  title,
  count,
  children,
}: {
  value: string;
  title: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger data-testid={`pricing-section-${value}`}>
        <span className="flex w-full items-center justify-between pe-3">
          {title}
          {/* Ce que la section contient, dit sans l'ouvrir : replié, un
              accordéon muet oblige à tout déplier pour trouver. */}
          <span className="text-xs font-normal text-muted-foreground">
            {count}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

/**
 * Le contenu d'une version tarifaire, en lecture — L2 · US-02-01, tranche A.
 *
 * Les cinq tableaux de la V8, repliés en accordéon : dépliés, ils font une
 * soixantaine de cases sur plusieurs écrans de haut, et on lit un prix d'option
 * en ayant perdu de vue ce qu'on regarde.
 *
 * **Aucun prix n'est calculé ici.** Le moteur tarifaire est la seule
 * implémentation du chiffrage ; cet écran ne fait qu'afficher ce que la version
 * porte.
 */
export function PricingGridBody({ gridId }: { gridId: string | null }) {
  const { grid, loading } = usePricingGrid(gridId);

  if (loading || !grid) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const c: PricingGridContent = grid.content;
  const n = (v: number, [one, many]: readonly [string, string]) =>
    UI.COUNT(v, one, many);
  const setupKeys = Object.keys(c.setupFees ?? {});

  return (
    <Accordion
      type="multiple"
      defaultValue={['brackets']}
      className="w-full"
      data-testid="pricing-grid-body"
    >
      <Section
        value="brackets"
        title={SECTIONS.BRACKETS}
        count={n(c.brackets.length, UI.BRACKET_COUNT)}
      >
        <Wide>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.LABEL}</TableHead>
                <TableHead className="text-end">{UI.FROM}</TableHead>
                <TableHead className="text-end">{UI.TO}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.brackets.map((b) => (
                <TableRow key={b.label}>
                  <TableCell className="font-medium">{b.label}</TableCell>
                  <TableCell className="text-end tabular-nums">
                    {formatInteger(b.min)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {/* La strate ouverte porte `max: null` et clôt toujours la
                        grille : « et plus », jamais un nombre inventé. */}
                    {b.max === null ? UI.OPEN_ENDED : formatInteger(b.max)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Wide>
      </Section>

      <Section
        value="subscription"
        title={SECTIONS.SUBSCRIPTION}
        count={n(c.plans.length, UI.PLAN_COUNT)}
      >
        <Wide>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.PLAN}</TableHead>
                {c.brackets.map((b) => (
                  <TableHead key={b.label} className="text-end">
                    {b.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.plans.map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">{p}</TableCell>
                  {(c.subscription[p] ?? []).map((v, i) => (
                    <TableCell key={i} className="text-end tabular-nums">
                      {price(v)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Wide>
      </Section>

      <Section
        value="options"
        title={SECTIONS.OPTIONS}
        count={n(c.options?.length ?? 0, UI.OPTION_COUNT)}
      >
        {c.options?.length ? (
          <Wide>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{UI.LABEL}</TableHead>
                  {c.brackets.map((b) => (
                    <TableHead key={b.label} className="text-end">
                      {b.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.options.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <span className="font-medium">{o.name}</span>
                      {o.included ? (
                        <span className="block text-xs text-muted-foreground">
                          {UI.INCLUDED(o.included)}
                        </span>
                      ) : null}
                    </TableCell>
                    {o.unitPrice.map((v, i) => (
                      <TableCell key={i} className="text-end tabular-nums">
                        {price(v)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Wide>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_OPTIONS}</p>
        )}
      </Section>

      <Section
        value="setup"
        title={SECTIONS.SETUP}
        count={n(setupKeys.length, UI.SETUP_COUNT)}
      >
        {setupKeys.length ? (
          <Wide>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{UI.POST}</TableHead>
                  <TableHead>{UI.PLAN}</TableHead>
                  {c.brackets.map((b) => (
                    <TableHead key={b.label} className="text-end">
                      {b.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {setupKeys.map((key) =>
                  c.plans.map((p, pi) => (
                    <TableRow key={`${key}-${p}`}>
                      {pi === 0 ? (
                        <TableCell
                          rowSpan={c.plans.length}
                          className="font-medium align-top"
                        >
                          {/* Le libellé s'affiche, la clé ne se voit jamais —
                              c'est elle que le serveur reconnaît pour ventiler
                              le une-fois sur le devis. */}
                          {String(c.setupFees?.[key]?.label ?? key)}
                        </TableCell>
                      ) : null}
                      <TableCell>{p}</TableCell>
                      {((c.setupFees?.[key]?.[p] as number[]) ?? []).map(
                        (v, i) => (
                          <TableCell key={i} className="text-end tabular-nums">
                            {price(v)}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </Wide>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_SETUP}</p>
        )}
      </Section>

      <Section
        value="extras"
        title={SECTIONS.EXTRAS}
        count={n(c.extras?.length ?? 0, UI.EXTRA_COUNT)}
      >
        {c.extras?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.LABEL}</TableHead>
                <TableHead className="text-end">{UI.UNIT_PRICE}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.extras.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-end tabular-nums">
                    {price(e.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NO_EXTRAS}</p>
        )}
      </Section>
    </Accordion>
  );
}
