"use client";

import React, { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { submitClubRegistrationAction } from "../../../../app/club-registration/actions";
import { initialRegistrationActionState } from "../../../../app/club-registration/registrationActionState";
import { FormField } from "../../../ui/FormField/FormField";
import { Label } from "../../../ui/Label/Label";
import { Input } from "../../../ui/Input/Input";
import { Button } from "../../../ui/Button/Button";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { FileUploadField } from "../FileUploadField/FileUploadField";
import styles from "./RegistrationForm.module.scss";

export function RegistrationForm() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitClubRegistrationAction,
    initialRegistrationActionState
  );

  if (state.status === "success") {
    return (
      <div className={styles.success} role="alert">
        <h2 className={styles.successTitle}>
          Success
        </h2>
        <p className={styles.successMessage}>
          {t("clubRegistration.form.success")}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={styles.form} noValidate>
      {state.networkError && (
        <div className={styles.globalError}>
          <ErrorMessage message={t("clubRegistration.form.error")} />
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        
        <FormField error={state.fieldErrors?.name?.[0]}>
          <Label htmlFor="name" required>{t("clubRegistration.form.name")}</Label>
          <Input
            id="name"
            name="name"
            required
            aria-required="true"
            error={!!state.fieldErrors?.name}
          />
        </FormField>

        <FormField error={state.fieldErrors?.province_region?.[0]}>
          <Label htmlFor="province_region" required>{t("clubRegistration.form.region")}</Label>
          <Input
            id="province_region"
            name="province_region"
            required
            aria-required="true"
            error={!!state.fieldErrors?.province_region}
          />
        </FormField>

        <FormField error={state.fieldErrors?.representative_name?.[0]}>
          <Label htmlFor="representative_name" required>{t("clubRegistration.form.representative")}</Label>
          <Input
            id="representative_name"
            name="representative_name"
            required
            aria-required="true"
            error={!!state.fieldErrors?.representative_name}
          />
        </FormField>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Documents</h2>
        
        <FileUploadField
          id="capability_profile"
          name="capability_profile"
          label={t("clubRegistration.form.capabilityProfile")}
          error={state.fieldErrors?.capability_profile?.[0]}
        />

        <FileUploadField
          id="u20_athlete_list"
          name="u20_athlete_list"
          label={t("clubRegistration.form.u20AthleteList")}
          error={state.fieldErrors?.u20_athlete_list?.[0]}
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className={styles.submitBtn}
        >
          {isPending 
            ? "Submitting..." 
            : t("clubRegistration.form.submit")}
        </Button>
      </div>
    </form>
  );
}
