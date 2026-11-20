/** First line of an Umrah builder query; the email uses it to tell builder queries apart. */
export const UMRAH_BUILDER_INTRO = "I built this Umrah package on your website:";

export type InquiryType = "contact" | "quote" | "inquire";

export type InquiryChannel = "email" | "whatsapp";

export type InquiryRecord = {
  id: string;
  type: InquiryType;
  name: string;
  /** Optional: the quick query popup only asks for name and phone. */
  email?: string;
  phone: string;
  message: string;
  interest?: string;
  /** How the visitor sent it: emailed to the T&T inbox, or opened in WhatsApp. */
  channel?: InquiryChannel;
  createdAt: string;
};
