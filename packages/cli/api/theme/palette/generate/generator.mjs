// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * Production implementation of the Astryx OKLCH palette recipe. It creates
 * candidates only: it does not modify theme tokens or claim accessibility.
 */

import {
  hexToOklch,
  luminance,
  maxOklchChroma,
  normalizeColor,
  oklabCoordinates,
  oklabCoordinatesToHex,
  oklchClampedHex,
  toneToOklabLightness,
} from './color.mjs';

export const PALETTE_RECIPE = 'astryx-oklch-v1';
export const DEFAULT_19_STOPS = Object.freeze([
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
]);
export const COMPACT_9_STOPS = Object.freeze([
  10, 20, 30, 40, 50, 60, 70, 80, 90,
]);

const DARK_CHROMA_FACTOR = 0.85;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeHue(hue) {
  return ((hue % 360) + 360) % 360;
}

function hueDistance(a, b) {
  const difference = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(difference, 360 - difference);
}

function signedHueDelta(from, to) {
  return ((normalizeHue(to) - normalizeHue(from) + 540) % 360) - 180;
}

function interpolateHue(a, b, amount) {
  const delta = ((b - a + 540) % 360) - 180;
  return normalizeHue(a + delta * amount);
}

export function validateStops(stops) {
  if (!Array.isArray(stops) || stops.length === 0) {
    throw new Error('A palette requires at least one stop.');
  }
  for (const stop of stops) {
    if (!Number.isFinite(stop) || stop < 0 || stop > 100) {
      throw new Error(
        `Stop ${String(stop)} must be a finite number from 0 to 100.`,
      );
    }
  }
  for (let index = 1; index < stops.length; index++) {
    if (stops[index] <= stops[index - 1]) {
      throw new Error('Stops must be unique and strictly increasing.');
    }
  }
  return [...stops];
}

export function parseStopList(input) {
  const values = String(input)
    .split(',')
    .map(value => value.trim());
  if (values.some(value => value === '' || !Number.isFinite(Number(value)))) {
    throw new Error('Every custom stop must be a number from 0 to 100.');
  }
  return validateStops(values.map(Number));
}

function modesForStrategy(strategy) {
  if (strategy === 'light-only') return ['light'];
  if (strategy === 'dark-only') return ['dark'];
  if (strategy === 'light-and-dark') return ['light', 'dark'];
  throw new Error(`Unknown mode strategy: ${String(strategy)}`);
}

function hueBalanceFactor(hue) {
  const normalized = normalizeHue(hue);
  if (normalized >= 70 && normalized < 115) return 0.94;
  if (normalized >= 115 && normalized < 175) return 0.78;
  if (normalized >= 175 && normalized < 230) return 0.82;
  if (normalized >= 285 && normalized < 340) return 0.9;
  return 1;
}

function toneAdjustedHue(hue, tone) {
  const normalized = normalizeHue(hue);
  if (normalized < 40 || normalized >= 70 || tone >= 50) return normalized;
  const darkening = clamp((50 - tone) / 40, 0, 1);
  return normalizeHue(normalized - 18 * Math.sqrt(darkening));
}

function toneChromaEnvelope(tone) {
  const normalized = clamp(tone / 100, 0, 1);
  return 0.18 + 0.82 * Math.sqrt(Math.max(0, Math.sin(Math.PI * normalized)));
}

function vibrancyMultiplier(vibrancy) {
  if (!Number.isFinite(vibrancy) || vibrancy < 0 || vibrancy > 100) {
    throw new Error('Vibrancy must be a number from 0 to 100.');
  }
  if (vibrancy <= 25) return (vibrancy / 25) * 0.72;
  if (vibrancy <= 50) return 0.72 + ((vibrancy - 25) / 25) * 0.28;
  return 1 + (vibrancy - 50) * 0.0096;
}

function coordinatedChroma(sourceChroma) {
  return sourceChroma * 0.35 + 0.18 * 0.65;
}

function colorToPolar(color) {
  const value = hexToOklch(color);
  return {lightness: value.L, chroma: value.C, hue: value.H};
}

function neutralPolar(profile, seed) {
  if (profile === 'custom') return colorToPolar(seed);
  const hue = profile === 'warm-v1' ? 75 : profile === 'cool-v1' ? 250 : 0;
  if (!['neutral-v1', 'warm-v1', 'cool-v1'].includes(profile)) {
    throw new Error(`Unknown neutral profile: ${String(profile)}`);
  }
  return {
    lightness: 0.5,
    chroma: profile === 'neutral-v1' ? 0 : 0.018,
    hue,
  };
}

function anchorPolarAtStop(seed, anchors, stop) {
  if (anchors.length === 0) return seed;
  const sorted = [...anchors].sort((a, b) => a.stop - b.stop);
  const lower = [...sorted].reverse().find(anchor => anchor.stop <= stop);
  const upper = sorted.find(anchor => anchor.stop >= stop);
  if (!lower || !upper || lower.stop === upper.stop) {
    return colorToPolar(normalizeColor((lower ?? upper ?? sorted[0]).color));
  }
  const start = colorToPolar(normalizeColor(lower.color));
  const end = colorToPolar(normalizeColor(upper.color));
  const amount = (stop - lower.stop) / (upper.stop - lower.stop);
  return {
    lightness: start.lightness + (end.lightness - start.lightness) * amount,
    chroma: start.chroma + (end.chroma - start.chroma) * amount,
    hue: interpolateHue(start.hue, end.hue, amount),
  };
}

function generateCandidate(
  source,
  tone,
  mode,
  vibrancy,
  coordinateWithOtherFamilies,
) {
  // Stop labels are literal tones in both modes. Dark-mode character comes
  // from its chroma treatment, not from silently shifting the requested tone.
  const adjustedTone = tone;
  const adjustedHue = toneAdjustedHue(source.hue, adjustedTone);
  const baseChroma = coordinateWithOtherFamilies
    ? coordinatedChroma(source.chroma)
    : source.chroma;
  const chroma =
    baseChroma *
    vibrancyMultiplier(vibrancy) *
    hueBalanceFactor(adjustedHue) *
    toneChromaEnvelope(adjustedTone) *
    (mode === 'dark' ? DARK_CHROMA_FACTOR : 1);
  const lightness = toneToOklabLightness(adjustedTone);
  return {
    hex: oklchClampedHex(lightness, chroma, adjustedHue),
    gamutMapped: chroma > maxOklchChroma(adjustedHue, lightness) + 0.000001,
  };
}

export function perceptualDelta(colorA, colorB) {
  const [lightnessA, aA, bA] = oklabCoordinates(colorA);
  const [lightnessB, aB, bB] = oklabCoordinates(colorB);
  return (
    Math.sqrt(
      (lightnessA - lightnessB) ** 2 + (aA - aB) ** 2 + (bA - bB) ** 2,
    ) * 100
  );
}

function interpolateColor(colorA, colorB, amount) {
  const start = hexToOklch(colorA);
  const end = hexToOklch(colorB);
  return oklchClampedHex(
    start.L + (end.L - start.L) * amount,
    start.C + (end.C - start.C) * amount,
    interpolateHue(start.H, end.H, amount),
  );
}

function applyAnchor(candidate, anchor) {
  const target = normalizeColor(anchor.color);
  let generatedColor = candidate;
  if (anchor.policy === 'exact') {
    generatedColor = target;
  } else if (anchor.policy === 'bounded') {
    const tolerance = anchor.maxDeltaE;
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      throw new Error(
        `Bounded anchor at stop ${anchor.stop} requires a non-negative maxDeltaE.`,
      );
    }
    if (perceptualDelta(candidate, target) > tolerance) {
      let low = 0;
      let high = 1;
      for (let index = 0; index < 18; index++) {
        const amount = (low + high) / 2;
        const mixed = interpolateColor(target, candidate, amount);
        if (perceptualDelta(mixed, target) <= tolerance) low = amount;
        else high = amount;
      }
      generatedColor = interpolateColor(target, candidate, low);
    }
  } else if (anchor.policy === 'preferred') {
    generatedColor = interpolateColor(candidate, target, 0.35);
  } else {
    throw new Error(`Unknown anchor policy: ${String(anchor.policy)}`);
  }
  return {
    ...anchor,
    color: target,
    generatedColor,
    deltaE: perceptualDelta(generatedColor, target),
  };
}

function smoothstep(amount) {
  const value = clamp(amount, 0, 1);
  return value * value * (3 - 2 * value);
}

function interpolateDelta(start, end, amount) {
  return [
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    start[2] + (end[2] - start[2]) * amount,
  ];
}

function correctionAtStop(corrections, stop) {
  const zero = [0, 0, 0];
  if (corrections.length === 0) return zero;
  const first = corrections[0];
  if (stop <= first.stop) {
    const boundary = Math.max(0, first.stop - 25);
    if (stop <= boundary && boundary !== first.stop) return zero;
    const amount =
      boundary === first.stop
        ? 1
        : smoothstep((stop - boundary) / (first.stop - boundary));
    return interpolateDelta(zero, first.delta, amount);
  }
  const last = corrections[corrections.length - 1];
  if (stop >= last.stop) {
    const boundary = Math.min(100, last.stop + 25);
    if (stop >= boundary && boundary !== last.stop) return zero;
    const amount =
      boundary === last.stop
        ? 1
        : smoothstep((stop - last.stop) / (boundary - last.stop));
    return interpolateDelta(last.delta, zero, amount);
  }
  const upperIndex = corrections.findIndex(item => item.stop > stop);
  const lower = corrections[upperIndex - 1];
  const upper = corrections[upperIndex];
  return interpolateDelta(
    lower.delta,
    upper.delta,
    smoothstep((stop - lower.stop) / (upper.stop - lower.stop)),
  );
}

function applyAnchorCorrections(colors, stops, anchors) {
  if (anchors.length === 0) return {colors, anchors: []};
  const corrections = anchors
    .map(anchor => {
      const candidate = colors[anchor.stop];
      const result = applyAnchor(candidate, anchor);
      const base = oklabCoordinates(candidate);
      const target = oklabCoordinates(result.generatedColor);
      return {
        stop: anchor.stop,
        delta: [target[0] - base[0], target[1] - base[1], target[2] - base[2]],
        result,
      };
    })
    .sort((a, b) => a.stop - b.stop);
  const corrected = {};
  for (const stop of stops) {
    const base = oklabCoordinates(colors[stop]);
    const delta = correctionAtStop(corrections, stop);
    corrected[stop] = oklabCoordinatesToHex([
      base[0] + delta[0],
      base[1] + delta[1],
      base[2] + delta[2],
    ]);
  }
  for (const correction of corrections) {
    corrected[correction.stop] = correction.result.generatedColor;
  }
  return {
    colors: corrected,
    anchors: corrections.map(correction => correction.result),
  };
}

function assertAnchorSet(anchors, stops) {
  const seen = new Set();
  for (const anchor of anchors) {
    normalizeColor(anchor.color);
    if (!['light', 'dark'].includes(anchor.mode)) {
      throw new Error(`Unknown anchor mode: ${String(anchor.mode)}`);
    }
    if (!stops.includes(anchor.stop)) {
      throw new Error(
        `Anchor stop ${anchor.stop} is not present in the requested stop layout.`,
      );
    }
    const key = `${anchor.mode}:${anchor.stop}`;
    if (seen.has(key)) {
      throw new Error(
        `Duplicate anchor for ${anchor.mode} stop ${anchor.stop}.`,
      );
    }
    seen.add(key);
  }
}

function buildDiagnostics(colors, stops, sourceHue, gamutMappedStops, anchors) {
  let monotonic = true;
  let minimumAdjacentDeltaE = Number.POSITIVE_INFINITY;
  let maximumAdjacentDeltaE = 0;
  let maximumHueDrift = 0;
  let hueIdentityRisk = null;
  for (let index = 0; index < stops.length; index++) {
    const stop = stops[index];
    const color = colors[stop];
    const oklch = hexToOklch(color);
    if (oklch.C >= 0.015) {
      const drift = signedHueDelta(sourceHue, oklch.H);
      maximumHueDrift = Math.max(
        maximumHueDrift,
        hueDistance(sourceHue, oklch.H),
      );
      if (sourceHue >= 230 && sourceHue < 285 && drift > 12) {
        hueIdentityRisk = 'blue-to-purple';
      }
      if (sourceHue >= 70 && sourceHue < 115 && drift < -12) {
        hueIdentityRisk = 'yellow-to-brown';
      }
    }
    if (index === 0) continue;
    const previous = colors[stops[index - 1]];
    if (luminance(color) + 0.000001 < luminance(previous)) monotonic = false;
    const adjacentDelta = perceptualDelta(previous, color);
    minimumAdjacentDeltaE = Math.min(minimumAdjacentDeltaE, adjacentDelta);
    maximumAdjacentDeltaE = Math.max(maximumAdjacentDeltaE, adjacentDelta);
  }
  return {
    monotonic,
    minimumAdjacentDeltaE:
      minimumAdjacentDeltaE === Number.POSITIVE_INFINITY
        ? 0
        : minimumAdjacentDeltaE,
    maximumAdjacentDeltaE,
    maximumHueDrift,
    hueIdentityRisk,
    gamutMappedStops,
    anchors,
  };
}

function generateRamp(request, family, mode) {
  const seedHex = normalizeColor(family.seed);
  const anchors = (family.anchors ?? []).filter(anchor => anchor.mode === mode);
  assertAnchorSet(family.anchors ?? [], request.stops);
  const seed =
    family.kind === 'neutral'
      ? neutralPolar(request.neutralProfile, seedHex)
      : colorToPolar(seedHex);
  const colors = {};
  const gamutMappedStops = [];
  const diagnosticReference = generateCandidate(
    seed,
    50,
    mode,
    request.vibrancy,
    family.kind !== 'neutral',
  ).hex;
  for (const stop of request.stops) {
    const source = anchorPolarAtStop(seed, anchors, stop);
    const generated = generateCandidate(
      source,
      stop,
      mode,
      request.vibrancy,
      family.kind !== 'neutral',
    );
    colors[stop] = generated.hex;
    if (generated.gamutMapped) gamutMappedStops.push(stop);
  }
  const corrected = applyAnchorCorrections(colors, request.stops, anchors);
  const diagnostics = buildDiagnostics(
    corrected.colors,
    request.stops,
    hexToOklch(diagnosticReference).H,
    gamutMappedStops,
    corrected.anchors,
  );
  if (!diagnostics.monotonic) {
    throw new Error(
      `${family.name} ${mode} ramp is not luminance-monotonic with the requested anchors.`,
    );
  }
  return {colors: corrected.colors, diagnostics};
}

function nearestStop(stops, target) {
  return stops.reduce((best, stop) =>
    Math.abs(stop - target) < Math.abs(best - target) ? stop : best,
  );
}

function buildCoordinationDiagnostics(request, families) {
  const stop = nearestStop(request.stops, 50);
  const chromaticIds = new Set(
    request.families
      .filter(family => family.kind !== 'neutral')
      .map(family => family.id),
  );
  return modesForStrategy(request.modeStrategy).map(mode => {
    const samples = families
      .filter(family => chromaticIds.has(family.id) && family[mode])
      .map(family => {
        const color = family[mode].colors[stop];
        return {
          id: family.id,
          name: family.name,
          color,
          chroma: hexToOklch(color).C,
        };
      });
    let closestFamilies = null;
    let minimumFamilyDeltaE = Number.POSITIVE_INFINITY;
    for (let index = 0; index < samples.length; index++) {
      for (let next = index + 1; next < samples.length; next++) {
        const delta = perceptualDelta(
          samples[index].color,
          samples[next].color,
        );
        if (delta < minimumFamilyDeltaE) {
          minimumFamilyDeltaE = delta;
          closestFamilies = [samples[index].name, samples[next].name];
        }
      }
    }
    const byChroma = [...samples].sort((a, b) => a.chroma - b.chroma);
    const weakest = byChroma[0];
    const strongest = byChroma[byChroma.length - 1];
    return {
      mode,
      stop,
      closestFamilies,
      minimumFamilyDeltaE:
        minimumFamilyDeltaE === Number.POSITIVE_INFINITY
          ? null
          : minimumFamilyDeltaE,
      strongestFamily: strongest?.name ?? null,
      weakestFamily: weakest?.name ?? null,
      chromaRatio:
        weakest && strongest && weakest.chroma > 0.0001
          ? strongest.chroma / weakest.chroma
          : null,
    };
  });
}

export function normalizeGenerationRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Palette generation config must be an object.');
  }
  const families = input.families;
  if (!Array.isArray(families) || families.length === 0) {
    throw new Error('Palette generation requires at least one family.');
  }
  const ids = new Set();
  const normalizedFamilies = families.map((family, index) => {
    if (!family || typeof family !== 'object' || Array.isArray(family)) {
      throw new Error(`Family ${index} must be an object.`);
    }
    const id = String(family.id ?? '').trim();
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new Error(
        `Family ${index} id must use lower-kebab-case characters.`,
      );
    }
    if (ids.has(id)) throw new Error(`Duplicate family id: ${id}.`);
    ids.add(id);
    const kind = family.kind ?? 'chromatic';
    if (!['chromatic', 'neutral'].includes(kind)) {
      throw new Error(`Unknown family kind: ${String(kind)}`);
    }
    return {
      id,
      name: String(family.name ?? id),
      seed: normalizeColor(family.seed),
      kind,
      anchors: Array.isArray(family.anchors) ? family.anchors : [],
    };
  });
  const request = {
    recipe: PALETTE_RECIPE,
    vibrancy: input.vibrancy ?? 50,
    neutralProfile: input.neutralProfile ?? 'neutral-v1',
    modeStrategy: input.modeStrategy ?? 'light-and-dark',
    stops: validateStops(input.stops ?? DEFAULT_19_STOPS),
    families: normalizedFamilies,
  };
  vibrancyMultiplier(request.vibrancy);
  modesForStrategy(request.modeStrategy);
  return request;
}

export function generatePaletteSet(input) {
  const request = normalizeGenerationRequest(input);
  const families = [];
  const errors = [];
  for (const family of request.families) {
    try {
      const generated = {
        id: family.id,
        name: family.name,
        seed: family.seed,
      };
      for (const mode of modesForStrategy(request.modeStrategy)) {
        generated[mode] = generateRamp(request, family, mode);
      }
      families.push(generated);
    } catch (error) {
      errors.push({
        familyId: family.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return {
    recipe: PALETTE_RECIPE,
    status: 'candidate',
    request,
    families,
    coordination: buildCoordinationDiagnostics(request, families),
    errors,
  };
}

/**
 * Generate candidate palette data without reading or writing files.
 *
 * @param {import('../../theme.type.mjs').TonalPaletteGenerationInput} input
 * @returns {import('../../theme.type.mjs').TonalPaletteCandidate}
 */
export function generateTonalPalette(input) {
  const result = generatePaletteSet(input);
  if (result.errors.length > 0) {
    throw new Error(
      result.errors
        .map(error => `${error.familyId}: ${error.message}`)
        .join('\n'),
    );
  }
  return {
    schemaVersion: 1,
    status: 'candidate',
    recipe: PALETTE_RECIPE,
    palette: Object.fromEntries(
      result.families.map(family => [
        family.id,
        {
          name: family.name,
          ...(family.light ? {light: family.light.colors} : {}),
          ...(family.dark ? {dark: family.dark.colors} : {}),
        },
      ]),
    ),
  };
}

export function serializeGenerationResult(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}
