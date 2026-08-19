import React, { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[styles.input, error ? styles.hasError : "", className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
