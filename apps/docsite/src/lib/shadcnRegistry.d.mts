export const SHADCN_REGISTRY_ORIGIN: string;
export const SHADCN_REGISTRY_IS_PREVIEW: boolean;
export function resolveShadcnRegistryOrigin(
  env?: Record<string, string | undefined>,
): string;
export function slugifyRegistryName(value: string): string;
export function shadcnComponentItemName(
  packageName: string,
  componentName: string,
): string;
export function shadcnBlockItemName(
  dirName: string,
  isShowcase: boolean,
): string;
export function shadcnPageItemName(slug: string): string;
export function shadcnInstallCommand(
  itemName: string,
  registryOrigin?: string,
): string;
