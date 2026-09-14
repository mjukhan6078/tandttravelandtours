export type InquiryType = "contact" | "quote" | "inquire";

export type InquiryRecord = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  interest?: string;
  createdAt: string;
};
