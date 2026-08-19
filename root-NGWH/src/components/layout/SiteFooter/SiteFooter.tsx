import React from "react";
import { BRAND } from "../../../config/brand";
import { Container } from "../../ui/Container/Container";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.content}>
          <p className={styles.copyright}>
            &copy; {year} {BRAND.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
