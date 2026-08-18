import { useCallback, useEffect, useMemo, useRef } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import { ZodError } from 'zod';
import { useTheme } from 'next-themes';
import { ChevronDown, Info, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReusableSpreadsheetSkeleton } from './ReusableSpreadsheetSkeleton';

function createDeleteViewer(removeRow: (index: number) => void) {
  return function DeleteViewer({ row }: { row: number; [k: string]: unknown }) {
    return (
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          removeRow(row);
        }}
        className="flex items-center justify-center w-full text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  };
}

type ReusableSpreadsheetProps = {
  data: Matrix<CellBase>;
  setData: (data: Matrix<CellBase>) => void;
  columnLabels: readonly string[];

  addRows?: (count?: number) => void;
  removeRow?: (index: number) => void;
  addRowChoices?: readonly number[];
  isLoading?: boolean;

  errors?: ZodError | null;
  errorPathRoot?: string;

  infoNote?: string;
  addButtonLabel?: string;
  errorLinePrefix?: string;
  validationRules?: readonly string[];
};

export function ReusableSpreadsheet({
  data,
  setData,
  columnLabels,
  addRows,
  removeRow,
  addRowChoices,
  isLoading,
  errors,
  errorPathRoot,
  infoNote,
  addButtonLabel,
  errorLinePrefix,
  validationRules,
}: ReusableSpreadsheetProps) {
  const { theme } = useTheme();

  const DeleteViewer = useMemo(
    () => (removeRow ? createDeleteViewer(removeRow) : null),
    [removeRow],
  );

  const rowLabels = useMemo(() => data.map((_, i) => String(i + 1)), [data]);

  const effectiveColumnLabels = useMemo(
    () => (removeRow ? [...columnLabels, ''] : [...columnLabels]),
    [columnLabels, removeRow],
  );

  const displayData = useMemo(() => {
    if (!removeRow || !DeleteViewer) return data;
    return data.map((row) => [
      ...row,
      {
        value: '',
        readOnly: true,
        DataViewer: DeleteViewer,
        className: 'spreadsheet-action-cell',
      } as CellBase,
    ]);
  }, [data, DeleteViewer, removeRow]);

  const handleChange = useCallback(
    (newData: Matrix<CellBase>) => {
      const colCount = columnLabels.length;
      const stripped = newData.map((row) => row.slice(0, colCount));
      setData(stripped);
    },
    [setData, columnLabels.length],
  );

  /* ── Paste interception ──────────────────────────────────────────────
   * react-spreadsheet listens for paste on `document` (bubble phase)
   * and updates its internal reducer state BEFORE calling onChange,
   * causing an intermediate render where rowLabels and the delete
   * column are missing for newly-pasted rows.
   *
   * Fix: listen on `document` in CAPTURE phase (fires before the
   * library's bubble listener) and call stopImmediatePropagation()
   * so the library never sees the event.
   * All values are read via refs → deps [] → the listener is stable
   * and always attached.
   * ------------------------------------------------------------------ */
  const activeCellRef = useRef<{ row: number; column: number }>({ row: 0, column: 0 });
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const setDataRef = useRef(setData);
  setDataRef.current = setData;

  const colCountRef = useRef(columnLabels.length);
  colCountRef.current = columnLabels.length;

  const removeRowRef = useRef(removeRow);
  removeRowRef.current = removeRow;

  const handleActivate = useCallback(
    (active: { row: number; column: number }) => {
      activeCellRef.current = active;
    },
    [],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // Only intercept pastes targeting our spreadsheet
      const el = spreadsheetRef.current;
      if (!el) return;
      const target = e.target as Node;
      if (!el.contains(target)) return;

      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;

      const active = activeCellRef.current;
      const colCount = colCountRef.current;

      // Don't intercept if active cell is in the action column
      if (removeRowRef.current && active.column >= colCount) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      // Parse tab-separated values from clipboard
      const lines = text.split(/\r\n|\n|\r/);
      if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
      const parsed = lines.map((line) =>
        line.split('\t').map((val) => ({ value: val } as CellBase)),
      );
      if (parsed.length === 0) return;

      // Merge pasted data into existing data at active cell position
      const currentData = dataRef.current;
      const newRowCount = Math.max(
        currentData.length,
        active.row + parsed.length,
      );
      const newData: Matrix<CellBase> = [];

      for (let r = 0; r < newRowCount; r++) {
        const existing = r < currentData.length ? [...currentData[r]] : [];
        while (existing.length < colCount) {
          existing.push({ value: '' });
        }

        const pasteIdx = r - active.row;
        if (pasteIdx >= 0 && pasteIdx < parsed.length) {
          for (let c = 0; c < parsed[pasteIdx].length; c++) {
            const targetCol = active.column + c;
            if (targetCol < colCount) {
              existing[targetCol] = parsed[pasteIdx][c];
            }
          }
        }

        newData.push(existing.slice(0, colCount));
      }

      setDataRef.current(newData);
    };

    document.addEventListener('paste', onPaste, true);
    return () => document.removeEventListener('paste', onPaste, true);
  }, []);

  const rootError = useMemo(() => {
    if (!errors) return null;
    const root = errors.issues.find((issue) => {
      if (issue.path.length <= 1) return true;
      if (
        errorPathRoot &&
        issue.path.length === 2 &&
        issue.path[0] === errorPathRoot &&
        typeof issue.path[1] !== 'number'
      ) {
        return true;
      }
      return false;
    });
    return root?.message ?? null;
  }, [errors, errorPathRoot]);

  const cellErrors = useMemo(() => {
    if (!errors) return new Map<number, string[]>();
    const map = new Map<number, string[]>();
    for (const issue of errors.issues) {
      let rowIndex: number | undefined;
      if (errorPathRoot) {
        if (
          issue.path.length === 3 &&
          issue.path[0] === errorPathRoot &&
          typeof issue.path[1] === 'number'
        ) {
          rowIndex = issue.path[1];
        }
      } else if (
        issue.path.length === 2 &&
        typeof issue.path[0] === 'number'
      ) {
        rowIndex = issue.path[0];
      }
      if (rowIndex !== undefined) {
        const existing = map.get(rowIndex);
        if (existing) {
          existing.push(issue.message);
        } else {
          map.set(rowIndex, [issue.message]);
        }
      }
    }
    return map;
  }, [errors, errorPathRoot]);

  if (isLoading) {
    return (
      <ReusableSpreadsheetSkeleton
        columns={columnLabels.length + (removeRow ? 1 : 0)}
        infoNote={infoNote}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {infoNote && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{infoNote}</AlertDescription>
        </Alert>
      )}

      <div className="spreadsheet-themed" ref={spreadsheetRef}>
        <Spreadsheet
          data={displayData}
          onChange={handleChange}
          columnLabels={effectiveColumnLabels}
          rowLabels={rowLabels}
          onActivate={handleActivate}
          className={theme === 'dark' ? 'Spreadsheet--dark-mode' : undefined}
        />
      </div>

      {cellErrors.size > 0 && (
        <div className="flex flex-col gap-2">
          {[...cellErrors.entries()].map(([row, messages]) => {
            const rowNumber = (row + 1).toLocaleString('fr-FR');
            return (
              <div
                key={row}
                className="border-l-2 border-destructive bg-destructive/10 rounded-r-md pl-3 py-2 pr-3"
              >
                {errorLinePrefix && (
                  <p className="text-xs font-medium text-destructive mb-1">
                    {errorLinePrefix} {rowNumber}
                  </p>
                )}
                {messages.map((msg, i) => (
                  <p key={i} className="text-xs text-destructive/80 pl-2">
                    {msg}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {rootError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{rootError}</p>
        </div>
      )}

      {addRows && addButtonLabel && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="dashed"
            size="sm"
            onClick={() => addRows(1)}
          >
            <Plus />
            {addButtonLabel}
          </Button>
          {addRowChoices && addRowChoices.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="dashed" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {addRowChoices.map((count) => (
                  <DropdownMenuItem
                    key={count}
                    onClick={() => addRows(count)}
                  >
                    <Plus className="h-4 w-4" />
                    {count}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {validationRules && validationRules.length > 0 && (
        <p className="text-2xs text-muted-foreground/60">
          {validationRules.join(' · ')}
        </p>
      )}
    </div>
  );
}
