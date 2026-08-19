import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { RegistrationForm } from "@/components/features/registration/RegistrationForm/RegistrationForm";
import { RegistrationIntroGate } from "@/components/features/registration/RegistrationIntroGate/RegistrationIntroGate";
import { REGISTRATION_INTRO_COOKIE_NAME } from "./introConstants";
import styles from "./page.module.scss";

// Sprint 3 — REQ-REG-001 (form container)/002 (fields)/003 (uploads).
// See .ai/lld/club-registration.md. REQ-REG-004/005 (Club Dashboard,
// authenticated roster updates) are out of scope — BLOCKED on
// OQ-012/OQ-013, not built here.
//
// First-visit intro (§21 of the LLD) — UX enhancement, not
// requirement-workbook-sourced: the cookie is read here, server-side, so
// a returning visitor's very first render already skips the intro
// (no client-side flash of the animation before hydration).
export default async function ClubRegistrationPage() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const hasSeenIntro =
    cookieStore.get(REGISTRATION_INTRO_COOKIE_NAME)?.value === "true";

  return (
    <Container>
      <RegistrationIntroGate hasSeenIntro={hasSeenIntro}>
        <h1 className={styles.title}>{t("pages.clubRegistration.title")}</h1>
        <RegistrationForm />
      </RegistrationIntroGate>
    </Container>
  );
}
