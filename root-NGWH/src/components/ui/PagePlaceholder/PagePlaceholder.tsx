import React from "react";
import styles from "./PagePlaceholder.module.scss";

interface PagePlaceholderProps {
  title: string;
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <h1>{title}</h1>
      <p>This page is currently under construction.</p>
    </div>
  );
}
