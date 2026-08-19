import React, { HTMLAttributes } from "react";
import styles from "./FormField.module.scss";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export function FormField({ className = "", error, children, ...props }: FormFieldProps) {
  return (
    <div className={[styles.formField, className].filter(Boolean).join(" ")} {...props}>
      {children}
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}
