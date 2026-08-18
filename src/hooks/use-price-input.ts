import { useEffect, useMemo, useRef, useState } from 'react';

type UsePriceInputOptions = {
  /** Value to sync from when it changes externally (e.g. loading a draft) */
  value: number | null | undefined;
  /** Called when the parsed numeric value changes */
  onChange: (value: number | undefined) => void;
  /** Max number of decimals accepted. Default 2 (euros + centimes). */
  maxDecimals?: number;
};

/**
 * Hook for decimal numeric inputs (default: euros with centimes).
 *
 * Maintains a raw string state to allow intermediate input states
 * (trailing comma, trailing zeros) that would be lost with immediate
 * number conversion. Limits input to `maxDecimals` decimal places.
 * Displays with French comma separator, accepts both comma and dot.
 *
 * @example
 * // Prices (default 2 decimals)
 * const price = usePriceInput({ value, onChange });
 * // CAF coefficients (4 decimals)
 * const coef = usePriceInput({ value, onChange, maxDecimals: 4 });
 * <Input value={input.raw} onChange={input.onInputChange} onBlur={input.onBlur} />
 */
export function usePriceInput({
  value,
  onChange,
  maxDecimals = 2,
}: UsePriceInputOptions) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
      }),
    [maxDecimals],
  );

  const inputRegex = useMemo(
    () => new RegExp(`^\\d*[.,]?\\d{0,${maxDecimals}}$`),
    [maxDecimals],
  );

  const [raw, setRaw] = useState(value != null ? formatter.format(value) : '');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (value != null) {
      const current = parseFloat(
        raw.replace(/[\s\u202F\u00A0]/g, '').replace(',', '.'),
      );
      if (current !== value) {
        setRaw(formatter.format(value));
      }
    } else if (raw !== '' && raw !== ',' && raw !== '.') {
      setRaw('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Strip thousand separators (spaces / narrow no-break spaces) for validation
    const stripped = input.replace(/[\s\u202F\u00A0]/g, '');
    if (stripped !== '' && !inputRegex.test(stripped)) return;
    setRaw(input);
    const normalized = stripped.replace(',', '.');
    if (normalized === '' || normalized === '.') {
      onChangeRef.current(undefined);
    } else {
      const num = parseFloat(normalized);
      if (Number.isFinite(num)) onChangeRef.current(num);
    }
  };

  const onBlur = () => {
    if (value != null) {
      setRaw(formatter.format(value));
    } else {
      setRaw('');
    }
  };

  return { raw, onInputChange, onBlur };
}
