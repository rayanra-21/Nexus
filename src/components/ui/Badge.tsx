import React from "react";

export type BadgeVariant = "primary" | "secondary" | "gray" | "success" | "warning" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "gray",
  children,
  className = "",
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: "bg-primary-100 text-primary-800",
    secondary: "bg-secondary-100 text-secondary-800",
    gray: "bg-gray-100 text-gray-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    error: "bg-error-100 text-error-800",
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${variantStyles[variant]} ${className}`}
      {...props} // now onClick works
    >
      {children}
    </div>
  );
};
