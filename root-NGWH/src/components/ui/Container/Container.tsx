import React, { HTMLAttributes } from "react";
import styles from "./Container.module.scss";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className = "", children, ...props }: ContainerProps) {
  return (
    <div className={[styles.container, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
