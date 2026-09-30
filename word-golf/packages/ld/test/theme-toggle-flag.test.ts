/**
 * Flag-path tests for the `enable-theme-toggle` feature flag (PR #1).
 *
 * Covers the flag-off (control) and flag-on (treatment) paths as they relate
 * to the @word-golf/ld package: the flag default, flag key constants, and the
 * METRIC_EVENTS.themeToggleUsed event key.
 *
 * `enable-theme-toggle` is a string multivariate flag ("control" | "v1").
 * The React rendering side (ThemeToggle absent/present) is not tested here
 * since the app currently has no React test harness.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { FLAG_DEFAULTS, FLAG_KEYS } from "../src/flags.js";
import { METRIC_EVENTS } from "../src/events.js";

// ---------------------------------------------------------------------------
// FLAG OFF: control path
// ---------------------------------------------------------------------------

test('flag-off: FLAG_DEFAULTS["enable-theme-toggle"] is "control" — ThemeToggle not rendered by default', () => {
  // The control path is preserved: when LD is offline or the flag targets off,
  // the default value must be "control" so ThemeToggle is never rendered.
  assert.equal(FLAG_DEFAULTS["enable-theme-toggle"], "control");
});

test("flag-off: FLAG_KEYS.enableThemeToggle resolves to the kebab-case LD key", () => {
  // Ensures useFlagVariation(FLAG_KEYS.enableThemeToggle) evaluates the correct
  // flag key and returns the "control" default in the control cohort.
  assert.equal(FLAG_KEYS.enableThemeToggle, "enable-theme-toggle");
});

test('flag-off: FLAG_DEFAULTS key set includes "enable-theme-toggle" (not undefined)', () => {
  // Verifies the key is explicitly registered in FLAG_DEFAULTS, so offline
  // contexts (no LD client) always serve "control" rather than undefined.
  assert.ok(
    Object.prototype.hasOwnProperty.call(FLAG_DEFAULTS, "enable-theme-toggle"),
    '"enable-theme-toggle" must be an explicit entry in FLAG_DEFAULTS'
  );
});

test('flag-off: FLAG_DEFAULTS["enable-theme-toggle"] is the string "control", not a boolean', () => {
  // This is a string multivariate flag — the default must be a string, not
  // a boolean. A boolean default would cause useFlagVariation to fall back
  // incorrectly and could shadow the treatment check.
  assert.equal(typeof FLAG_DEFAULTS["enable-theme-toggle"], "string");
});

// ---------------------------------------------------------------------------
// FLAG ON: treatment path — themeToggleUsed metric event
// ---------------------------------------------------------------------------

test('flag-on: METRIC_EVENTS.themeToggleUsed has the correct event key string', () => {
  // ThemeToggle's onClick calls track(METRIC_EVENTS.themeToggleUsed).
  // The guarded-release manifest wires "theme-toggle-used" as the monitoring
  // metric; this must match exactly.
  assert.equal(METRIC_EVENTS.themeToggleUsed, "theme-toggle-used");
});

test("flag-on: METRIC_EVENTS.themeToggleUsed is distinct from all other event keys", () => {
  // Ensures no accidental collision with existing metric keys — a collision
  // would pollute other guarded-release metrics.
  const allEvents = Object.entries(METRIC_EVENTS) as [string, string][];
  const duplicates = allEvents.filter(
    ([key, value]) => key !== "themeToggleUsed" && value === "theme-toggle-used"
  );
  assert.deepEqual(
    duplicates,
    [],
    '"theme-toggle-used" must not collide with other METRIC_EVENTS entries'
  );
});

test('flag-on: "theme-toggle-used" event key is present in METRIC_EVENTS taxonomy', () => {
  const values = Object.values(METRIC_EVENTS);
  assert.ok(
    values.includes("theme-toggle-used"),
    '"theme-toggle-used" must appear in METRIC_EVENTS'
  );
});

test('flag-on: "enable-theme-toggle" key is distinct from all other FLAG_KEYS values', () => {
  // Ensures no accidental collision with existing flag keys — a collision would
  // cause two features to respond to the same LaunchDarkly flag.
  const allKeys = Object.entries(FLAG_KEYS) as [string, string][];
  const duplicates = allKeys.filter(
    ([key, value]) => key !== "enableThemeToggle" && value === "enable-theme-toggle"
  );
  assert.deepEqual(
    duplicates,
    [],
    '"enable-theme-toggle" must not collide with other FLAG_KEYS values'
  );
});

// ---------------------------------------------------------------------------
// Regression guards: existing flag defaults must be unchanged
// ---------------------------------------------------------------------------

test("regression: existing boolean flag defaults are unchanged (control-path stability)", () => {
  // Adding enable-theme-toggle must not disturb existing flag defaults that
  // other guarded-release killswitch metrics depend on.
  assert.equal(FLAG_DEFAULTS["hint-button"], false);
  assert.equal(FLAG_DEFAULTS["show-mission-control"], false);
  assert.equal(FLAG_DEFAULTS["enable-random-puzzle"], false);
  assert.equal(FLAG_DEFAULTS["enable-share-result-button"], false);
  assert.equal(FLAG_DEFAULTS["enable-difficulty-picker-ux"], false);
  assert.equal(FLAG_DEFAULTS["show-powered-by-footer"], false);
  assert.equal(FLAG_DEFAULTS["enable-session-replay"], false);
});

test("regression: existing metric events are unchanged (guarded-release metrics unaffected)", () => {
  // Regression check: adding themeToggleUsed must not disturb existing events
  // that fire on both control and treatment paths.
  assert.equal(METRIC_EVENTS.puzzleCompleted, "puzzle_completed");
  assert.equal(METRIC_EVENTS.puzzleAbandoned, "puzzle_abandoned");
  assert.equal(METRIC_EVENTS.timeToSolveMs, "time_to_solve_ms");
  assert.equal(METRIC_EVENTS.madePar, "made_par");
});
