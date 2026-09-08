export type PreviewAuthEnv = {
  DEV?: boolean;
  MODE?: string;
  VITE_ENABLE_PREVIEW_AUTH?: string | boolean;
};

export function isPreviewAuthEnabled(
  env: PreviewAuthEnv = import.meta.env,
): boolean {
  const isDev = typeof env.DEV === "boolean" ? env.DEV : env.MODE === "development";
  const optIn = env.VITE_ENABLE_PREVIEW_AUTH;
  return Boolean(isDev && (optIn === true || optIn === "true"));
}

export const brokeredPreviewStorage: Storage | undefined =
  typeof window === "undefined" ? undefined : window.localStorage;
