"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "@/components/ui/PrefetchLink";
import { BrandLogo } from "./BrandLogo";
import { AuthControls } from "@/features/auth/components/AuthControls";
import { readLearningLocation } from "@/features/profile/learning-location";
import { STAGE_TWO_LOCATION_CHANGED } from "@/features/stage-two/location";
import { missionHref, safeAuthReturnPath } from "@/features/navigation/return-location";
import styles from "./AppHeader.module.css";

function subscribeLocation(listener: () => void) {
  const events = ["popstate", "hashchange", STAGE_TWO_LOCATION_CHANGED];
  events.forEach(event => window.addEventListener(event, listener));
  return () => events.forEach(event => window.removeEventListener(event, listener));
}
const currentHref = () => window.location.pathname + window.location.search + window.location.hash;
const serverHref = () => "";

export function AppHeader() {
  const pathname = usePathname();
  const href = useSyncExternalStore(subscribeLocation, currentHref, serverHref);
  const { userId } = useAuth();
  const [recent, setRecent] = useState<{ owner: string; practice: string; mission: string } | null>(null);
  const active = pathname.startsWith("/profile") ? "learning" : pathname.startsWith("/corpus") ? "corpus" : /^\/(loadout|speaking)/.test(pathname) ? "mission" : "practice";
  useEffect(() => {
    if (!userId) return;
    const key = `libitu:mission-navigation:v1:${userId}`;
    let mission = "/loadout";
    try {
      const saved = safeAuthReturnPath(sessionStorage.getItem(key));
      if (saved === "/loadout" || /^\/speaking\/[^/]+(?:\/analytics)?$/.test(saved.split("?")[0])) mission = saved;
      if (pathname === "/loadout" || pathname.startsWith("/speaking/")) {
        mission = safeAuthReturnPath(window.location.pathname + window.location.search);
        sessionStorage.setItem(key, mission);
      }
    } catch { /* Navigation works when browser storage is unavailable. */ }
    setRecent({ owner: userId, practice: readLearningLocation(userId)?.href ?? "/", mission });
  }, [pathname, userId]);
  const destinations = [
    { key: "practice", href: recent && recent.owner === userId ? recent.practice : "/", label: "Practice" },
    { key: "mission", href: recent && recent.owner === userId && recent.mission !== "/loadout" ? recent.mission : missionHref("loadout", href), label: "Mission" },
    { key: "corpus", href: "/corpus", label: "Corpus" },
    { key: "learning", href: "/profile", label: "My learning" }
  ];
  return <header className={styles.header}>
    <BrandLogo className={styles.logo} />
    <nav className={styles.navigation} aria-label="Main navigation">
      {destinations.map(({ key, href, label }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined}>{label}</Link>)}
    </nav>
    <div className={styles.account}><AuthControls showProfileLink={false} buttonSize="sm" /></div>
  </header>;
}
