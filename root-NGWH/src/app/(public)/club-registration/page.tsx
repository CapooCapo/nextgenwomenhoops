import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUserSession } from "@/server/auth/userAuth";
import { Container } from "@/components/ui/Container/Container";
import { RegistrationForm } from "@/components/features/registration/RegistrationForm/RegistrationForm";
import { RegistrationIntroGate } from "@/components/features/registration/RegistrationIntroGate/RegistrationIntroGate";
import { REGISTRATION_INTRO_COOKIE_NAME } from "./introConstants";
import styles from "./page.module.scss";

export default async function ClubRegistrationPage() {
  const session = await getUserSession();
  if (!session.authenticated) {
    redirect("/login?redirectTo=/club-registration");
  }

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
