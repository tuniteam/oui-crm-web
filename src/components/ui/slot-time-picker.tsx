import { useCallback, useRef } from 'react';
import { IconButton, type IconButtonProps } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { frFR } from '@mui/x-date-pickers/locales';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { fr } from 'date-fns/locale';
import { UI } from '@/constants/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Police de l'app : reprend la pile du thème plutôt que de la redéclarer,
// pour que MUI suive automatiquement tout changement de charte.
const FONT_FAMILY = 'var(--font-oui-sans)';

// Radius (rounded-md = 6px, charte) + police ; les couleurs (clair/sombre)
// sont pilotées via les variables du thème en sx (var(--brand-primary)…).
const muiTheme = createTheme({
  shape: { borderRadius: 6 },
  typography: { fontFamily: FONT_FAMILY },
});

// Dimensions alignées sur les inputs du thème (input.tsx) :
// md = h-8.5 / 13px ; sm = h-7 / 12px. Radius rounded-md.
const SIZE_TOKENS = {
  sm: { width: 112, height: 28, fontSize: '0.75rem' },
  md: { width: 128, height: 34, fontSize: '0.8125rem' },
} as const;

type PickerSize = keyof typeof SIZE_TOKENS;

const FR_LOCALE_TEXT =
  frFR.components.MuiLocalizationProvider.defaultProps.localeText;

// Pop-up : fond/texte/sélection sur variables du thème + compactage.
const POPPER_SX = {
  '& *': { fontFamily: FONT_FAMILY },
  '& .MuiPaper-root': {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    minWidth: 'unset',
  },
  // La grille du layout réserve des zones vides → on l'aplatit en bloc
  // (colonnes collées à gauche, action bar en bas via l'ordre DOM).
  '& .MuiPickersLayout-root': {
    display: 'block',
    minWidth: 'unset',
    width: 'fit-content',
  },
  '& .MuiPickersLayout-contentWrapper': { width: 'fit-content' },
  '& .MuiMultiSectionDigitalClock-root': { width: 'auto' },
  '& .MuiMultiSectionDigitalClockSection-root': {
    maxHeight: 200,
    scrollbarWidth: 'thin',
  },
  '& .MuiMultiSectionDigitalClockSection-item': {
    color: 'var(--popover-foreground)',
    fontSize: '0.8125rem',
  },
  '& .Mui-selected': {
    backgroundColor: 'var(--brand-primary)',
    color: 'var(--primary-foreground)',
  },
  '& .Mui-selected:hover, & .Mui-selected:focus, & .Mui-selected.Mui-selected:hover':
    {
      backgroundColor: 'var(--brand-primary)',
    },
  '& .MuiButton-root': { color: 'var(--brand-primary)' },
};

// Champ : dimensions/police alignées sur le thème + couleurs sur variables.
function fieldSx(size: PickerSize) {
  const t = SIZE_TOKENS[size];
  return {
    width: t.width,
    '& *': { fontFamily: FONT_FAMILY },
    '& .MuiPickersInputBase-root': {
      height: t.height,
      fontSize: t.fontSize,
    },
    '& .MuiPickersInputBase-root, & .MuiPickersSectionList-root, & .MuiPickersSectionList-section, & .MuiPickersSectionList-sectionContent, & .MuiInputBase-input':
      {
        color: 'var(--foreground)',
        WebkitTextFillColor: 'var(--foreground)',
        fontSize: t.fontSize,
      },
    // Icône d'ouverture compacte pour ne pas dépasser la hauteur du champ.
    '& .MuiSvgIcon-root, & .MuiIconButton-root': {
      color: 'var(--muted-foreground)',
    },
    '& .MuiIconButton-root': { padding: '4px' },
    '& .MuiSvgIcon-root': { fontSize: '1rem' },
    // MUI X v9 = MuiPickersOutlinedInput (pas MuiOutlinedInput).
    '& .MuiPickersOutlinedInput-notchedOutline, & .MuiOutlinedInput-notchedOutline':
      {
        borderColor: 'var(--input)',
      },
    '& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline':
      {
        borderColor: 'var(--input)',
      },
    '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline, & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        borderColor: 'var(--brand-primary)',
      },
  };
}

type Props = {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  disabled?: boolean;
  minTime?: string; // "HH:mm"
  maxTime?: string; // "HH:mm"
  /** Position d'ouverture du picker quand `value` est vide (ex. prévisionnel). */
  referenceTime?: string; // "HH:mm"
  /** Pas des minutes proposees dans la colonne, en minutes (ex. 15). */
  minutesStep?: number;
  tooltipLabel?: string;
  /** Taille alignée sur les inputs du thème : `sm` (défaut, compact) ou `md`. */
  size?: PickerSize;
};

function toDate(hhmm?: string): Date | null {
  if (!hhmm || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function toHHMM(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/**
 * Sélecteur d'heure thémé (MUI X TimePicker) — champ "HH:mm", colonnes
 * heures/minutes, charte oui-crm. `referenceTime` positionne le picker à
 * l'ouverture quand le champ est vide (sans le pré-remplir).
 */
export function SlotTimePicker({
  value,
  onChange,
  disabled,
  minTime,
  maxTime,
  referenceTime,
  minutesStep,
  tooltipLabel = UI.TIME_PICKER.PICK_TIME,
  size = 'sm',
}: Props) {
  /*
   * Ou poser le pop-up.
   *
   * MUI le monte par defaut sur le `<body>`. Or Radix, quand une fenetre
   * modale est ouverte, pose `pointer-events: none` sur ce meme `<body>` : le
   * pop-up s'affiche alors mais **aucun clic ne l'atteint**. On le monte donc
   * dans le conteneur Radix le plus proche — fenetre ou panneau — et on
   * retombe sur le `body` en page normale.
   *
   * La regle vit ici, dans le composant qui possede le portail, plutot que
   * dans chaque ecran qui l'utilise : un formulaire n'a pas a connaitre ce
   * detail pour choisir son conteneur.
   */
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popperContainer = useCallback(
    () =>
      (anchorRef.current?.closest(
        '[data-slot="dialog-content"], [data-slot="sheet-content"]',
      ) as HTMLElement | null) ?? document.body,
    [],
  );

  // Bouton d'ouverture wrappé dans le Tooltip du thème (charte oui-crm).
  const OpenPickerButton = (props: IconButtonProps) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton {...props} />
      </TooltipTrigger>
      <TooltipContent variant="light">{tooltipLabel}</TooltipContent>
    </Tooltip>
  );

  return (
    // `display: contents` : l'ancre sert a retrouver le conteneur Radix, elle
    // ne doit rien peser dans la mise en page.
    <span ref={anchorRef} style={{ display: 'contents' }}>
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={fr}
        localeText={FR_LOCALE_TEXT}
      >
        <TimePicker
          value={toDate(value)}
          onChange={(d) => onChange(toHHMM(d))}
          disabled={disabled}
          ampm={false}
          views={['hours', 'minutes']}
          // `minutesStep` ne pilote que l'horloge analogique ; l'horloge a
          // colonnes du picker de bureau se regle par `timeSteps`, qui ne
          // genere que les minutes voulues au lieu de les desactiver.
          timeSteps={
            minutesStep ? { hours: 1, minutes: minutesStep } : undefined
          }
          // Hors du creneau, les heures sont **retirees** de la colonne plutot
          // que grisees : une valeur affichee mais inerte se clique quand meme.
          skipDisabled
          format="HH:mm"
          minTime={toDate(minTime) ?? undefined}
          maxTime={toDate(maxTime) ?? undefined}
          referenceDate={toDate(referenceTime) ?? undefined}
          slots={{ openPickerButton: OpenPickerButton }}
          slotProps={{
            textField: { size: 'small', sx: fieldSx(size) },
            popper: { sx: POPPER_SX, container: popperContainer },
            openPickerButton: { 'aria-label': tooltipLabel },
            // Picker desktop : la sélection valide directement → pas d'OK/Annuler.
            actionBar: { actions: [] },
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
    </span>
  );
}
