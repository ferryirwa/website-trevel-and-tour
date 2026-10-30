import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        id={id}
        className={`input ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";
