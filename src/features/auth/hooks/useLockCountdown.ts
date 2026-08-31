import { useEffect, useState } from 'react';

const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;

function remainingSeconds(until: Date): number {
  return Math.max(0, Math.ceil((until.getTime() - Date.now()) / SECOND_MS));
}

/** Formate un reste en `m min s` / `s s`, sans dependance de locale. */
function format(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

/**
 * Compte a rebours du deverrouillage. Renvoie null quand il n'y a pas de date
 * exploitable ou que le delai est ecoule — l'appelant retombe alors sur le
 * message generique et peut reactiver le formulaire.
 */
export function useLockCountdown(until: Date | null): string | null {
  const [left, setLeft] = useState(() => (until ? remainingSeconds(until) : 0));

  useEffect(() => {
    if (!until) return;

    setLeft(remainingSeconds(until));
    const id = setInterval(() => {
      const next = remainingSeconds(until);
      setLeft(next);
      if (next === 0) clearInterval(id);
    }, SECOND_MS);

    return () => clearInterval(id);
  }, [until]);

  if (!until || left <= 0) return null;
  return format(left);
}
