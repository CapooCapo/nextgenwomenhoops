import React, { LabelHTMLAttributes } from "react";
import styles from "./Label.module.scss";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className = "", required, children, ...props }: LabelProps) {
  return (
    <label className={[styles.label, className].filter(Boolean).join(" ")} {...props}>
      {children}
      {required && <span className={styles.required} aria-hidden="true">*</span>}
    </label>
  );
}
