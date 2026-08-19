import type { ContactInfo } from "@/types/content";

/**
 * REQ-CONTACT-001 (.ai/lld/contact.md).
 * Provides clear, non-real placeholders so stakeholders can visually review
 * the Contact page layout before official data is provided.
 */
export const CONTACT_INFO_FIXTURE: ContactInfo = {
  officeAddress: {
    en: "[Office address will be updated]",
    vi: "[Địa chỉ văn phòng sẽ được cập nhật]",
  },
  hotline: {
    en: "[Hotline will be updated]",
    vi: "[Số hotline sẽ được cập nhật]",
  },
  supportEmails: [
    {
      label: {
        en: "Professional Support",
        vi: "Hỗ trợ chuyên môn",
      },
      email: {
        en: "[Professional support email will be updated]",
        vi: "[Email hỗ trợ chuyên môn sẽ được cập nhật]",
      },
    },
    {
      label: {
        en: "Sponsorship & Partnership",
        vi: "Hợp tác tài trợ",
      },
      email: {
        en: "[Sponsorship email will be updated]",
        vi: "[Email hợp tác tài trợ sẽ được cập nhật]",
      },
    },
  ],
};
