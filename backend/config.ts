export interface ServerConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseServiceRoleKey: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getServerConfig(): ServerConfig {
  return {
    supabaseUrl: required("SUPABASE_URL"),
    supabasePublishableKey: required("SUPABASE_PUBLISHABLE_KEY"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasOpenAIConfig(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL && process.env.OPENAI_MODEL.trim()
    ? process.env.OPENAI_MODEL.trim()
    : DEFAULT_OPENAI_MODEL;
}

export function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim();
  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  return {
    apiKey,
    model: getOpenAIModel(),
  };
}
