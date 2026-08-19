import React, { forwardRef } from "react";
import { FormField } from "../../../ui/FormField/FormField";
import { Label } from "../../../ui/Label/Label";
import { Input } from "../../../ui/Input/Input";
import styles from "./FileUploadField.module.scss";

interface FileUploadFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FileUploadField = forwardRef<HTMLInputElement, FileUploadFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <FormField error={error} className={`${styles.field} ${className || ""}`}>
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
        <Input
          type="file"
          id={id}
          ref={ref}
          error={!!error}
          aria-describedby={
            [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={styles.input}
          {...props}
        />
      </FormField>
    );
  }
);

FileUploadField.displayName = "FileUploadField";
