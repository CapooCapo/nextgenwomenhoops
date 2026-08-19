import React, { HTMLAttributes } from "react";
import styles from "./Card.module.scss";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className = "", elevated = false, children, ...props }: CardProps) {
  const classes = [styles.card, elevated ? styles.elevated : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
