"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import styles from "./AppHeader.module.css";

const NavigationContext = createContext<{ focused: boolean; setFocused: (value: boolean) => void }>({ focused: false, setFocused: () => {} });

export function AppNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [focused, setFocused] = useState(false);
  const application = /^\/(practice|loadout|speaking|corpus|profile)(\/|$)/.test(pathname);
  return <NavigationContext.Provider value={{ focused, setFocused }}>
    <div className={application && !focused ? styles.application : undefined} data-navigation-focus={focused || undefined}>
      {application && !focused ? <AppHeader /> : null}
      {children}
    </div>
  </NavigationContext.Provider>;
}

export function useNavigationFocus(active: boolean) {
  const { setFocused } = useContext(NavigationContext);
  useEffect(() => { if (active) setFocused(true); return () => { if (active) setFocused(false); }; }, [active, setFocused]);
}

export function useNavigationState() { return useContext(NavigationContext); }
