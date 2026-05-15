import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-glass-bg backdrop-blur-xl border border-glass-border shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
