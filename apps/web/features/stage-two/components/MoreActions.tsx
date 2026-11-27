"use client";

import { Ellipsis } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function MoreActions({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return <>
    <Button variant="secondary" size="sm" shape="circle" aria-label={label} title={label} popoverTarget={id}>
      <Ellipsis aria-hidden="true" />
    </Button>
    <div id={id} popover="auto" role="group" aria-label={label} className="practice-more-actions"
      onClick={event => {
        if (event.target instanceof Element && event.target.closest("button")) event.currentTarget.hidePopover();
      }}>
      {children}
    </div>
  </>;
}
