"use client";

import { useEffect, useRef } from "react";
import type { ConversationRecast } from "@libitu/types/speaking";
import { RecastLine } from "./ConversationPresentation";
import { observeVisible } from "./visibility";

export function ConfirmedRecast({ recast, voice = false, active, onShown }: {
  recast: ConversationRecast; voice?: boolean; active: boolean; onShown: (id: string, version: number) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active && element.current) return observeVisible(element.current, () => onShown(recast.id, recast.version));
  }, [active, recast.id, recast.version, onShown]);
  return <div ref={element} aria-label="Partner rephrasing"><RecastLine text={recast.replacement} changes={recast.changed_spans} voice={voice} /></div>;
}
