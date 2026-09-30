import { useContext } from "react";
import { LDContext } from "./context.js";
import type { Flags } from "./flags.js";
import type { TrackFn } from "./events.js";

/** All current flag values (typed). */
export function useFlags(): Flags {
  return useContext(LDContext).flags;
}

/** A single flag value by key. */
export function useFlag<K extends keyof Flags>(key: K): Flags[K] {
  return useContext(LDContext).flags[key];
}

/**
 * Returns the raw string variation value for a string-multivariate AutoFactory
 * flag. Defaults to `"control"` when LaunchDarkly is unreachable or the flag
 * is absent — the fail-safe ensures the existing behavior path is always taken.
 *
 * Wire with an exact string comparison:
 *   `useFlagVariation(FLAG_KEYS.myFlag) === "v1"`
 *
 * Never evaluate through a boolean helper — every non-empty string is truthy,
 * which would make the control variation behave like the treatment.
 */
export function useFlagVariation<K extends keyof Flags>(
  key: K,
  defaultValue: string = "control"
): string {
  const raw: unknown = useContext(LDContext).flags[key];
  return typeof raw === "string" ? raw : defaultValue;
}

/** The typed metric tracker. No-ops when LD is not configured. */
export function useTrack(): TrackFn {
  return useContext(LDContext).track;
}

/** Whether a real LaunchDarkly client is connected. */
export function useLDLive(): boolean {
  return useContext(LDContext).live;
}
