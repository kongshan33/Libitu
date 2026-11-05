"use client";

import { Show } from "@clerk/nextjs";
import { AuthControls } from "@/features/auth/components/AuthControls";
import styles from "./LandingPage.module.css";

export function LandingNavigation() {
  return <nav className={styles.nav} aria-label="Main navigation">
    <Show when="signed-out"><a className={styles.howLink} href="#how-it-works">How it works</a></Show>
    <div className={styles.account}><AuthControls /></div>
  </nav>;
}
