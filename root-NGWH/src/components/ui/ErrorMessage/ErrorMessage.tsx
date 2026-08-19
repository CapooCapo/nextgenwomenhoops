import React from "react";
import styles from "./ErrorMessage.module.scss";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorMessage({ title = "Error", message = "Something went wrong.", className = "" }: ErrorMessageProps) {
  return (
    <div className={[styles.errorContainer, className].filter(Boolean).join(" ")} role="alert">
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
