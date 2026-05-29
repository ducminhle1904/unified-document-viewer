import * as React from "react";

function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function TooltipContent({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

export { Tooltip, TooltipTrigger, TooltipContent };
