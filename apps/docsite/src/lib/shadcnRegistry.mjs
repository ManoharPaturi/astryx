// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared names and commands for Astryx shadcn Registry items.
 * @input Package, component, block, and page identifiers.
 * @output Deterministic item names and install commands.
 * @position Shared contract between registry generation and docsite UI.
 */

export function resolveShadcnRegistryOrigin(env = process.env) {
  const explicitOrigin = env.NEXT_PUBLIC_ASTRYX_REGISTRY_ORIGIN;
  if (explicitOrigin) {
    return explicitOrigin.replace(/\/$/, '');
  }

  const siteOrigin =
    env.NEXT_PUBLIC_SITE_URL ??
    (env.VERCEL_URL
      ? `https://${env.VERCEL_URL}`
      : 'https://astryx.atmeta.com');
  return `${siteOrigin.replace(/\/$/, '')}/r`;
}

export const SHADCN_REGISTRY_ORIGIN = resolveShadcnRegistryOrigin();

export const SHADCN_REGISTRY_IS_PREVIEW =
  SHADCN_REGISTRY_ORIGIN !== 'https://astryx.atmeta.com/r';

export function slugifyRegistryName(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function shadcnComponentItemName(packageName, componentName) {
  const packagePart =
    packageName === '@astryxdesign/core'
      ? ''
      : `${slugifyRegistryName(packageName.replace(/^@astryxdesign\//, ''))}-`;
  return `astryx-${packagePart}component-${slugifyRegistryName(componentName)}`;
}

export function shadcnBlockItemName(dirName, isShowcase) {
  return `astryx-${isShowcase ? 'showcase' : 'example'}-${slugifyRegistryName(dirName)}`;
}

export function shadcnPageItemName(slug) {
  return `astryx-page-${slugifyRegistryName(slug)}`;
}

export function shadcnInstallCommand(
  itemName,
  registryOrigin = SHADCN_REGISTRY_ORIGIN,
) {
  return `npx shadcn@latest add ${registryOrigin}/${itemName}.json`;
}
