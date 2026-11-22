/**
 * Settings for the WhatsApp auto-responder, all from the environment (on the
 * server: alongside mail.env). See .env.example for what each one is.
 */

export const whatsappConfig = {
  /** Meta app → WhatsApp → API setup: a permanent System User token. */
  accessToken: () => process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  /** The business number's Phone number ID (not the phone number itself). */
  phoneNumberId: () => process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  /** Any random string; entered again in the Meta webhook settings. */
  verifyToken: () => process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  /** Meta app → Settings → Basic → App secret. Used to check webhook signatures. */
  appSecret: () => process.env.WHATSAPP_APP_SECRET ?? "",
  graphVersion: () => process.env.WHATSAPP_GRAPH_VERSION || "v23.0",
  /** Set to "false" to stop automatic replies without removing the webhook. */
  enabled: () => process.env.WHATSAPP_BOT_ENABLED !== "false",
  /** How long the bot stays quiet in a chat after handing it to the team. */
  handoffPauseHours: () => Number(process.env.WHATSAPP_HANDOFF_PAUSE_HOURS || 12),

  /** Amazon Bedrock. The API key comes from AWS_BEARER_TOKEN_BEDROCK. */
  awsRegion: () => process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1",
  /** Any chat model on Bedrock's OpenAI-compatible endpoint. */
  model: () => process.env.BEDROCK_MODEL || "qwen.qwen3-235b-a22b-2507",
};

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    whatsappConfig.accessToken() && whatsappConfig.phoneNumberId() && whatsappConfig.appSecret()
  );
}
