"use client";

import { currentAuthReturnUrl } from "@/features/navigation/return-location";

import { Button, ButtonLink } from "@/components/ui/button";

import styles from "./AuthControls.module.css";

import { Show, UserButton, useClerk, useUser } from "@clerk/nextjs";

export function AuthControls({ showProfileLink = true, buttonSize = "inherit" }: { showProfileLink?: boolean; buttonSize?: "sm" | "inherit" } = {}) {
  const clerk = useClerk();
  const { user } = useUser();

  function signIn() {
    const returnUrl = currentAuthReturnUrl();
    clerk.openSignIn({
      forceRedirectUrl: returnUrl,
      signUpForceRedirectUrl: returnUrl,
      // One entry point; users explicitly switch to registration inside Clerk.
      withSignUp: false,
      transferable: false,
    });
  }

  return (
    <div className="auth-controls" aria-label="Account">
      <Show when="signed-out">
        <Button variant="secondary" size={buttonSize} className="auth-button" type="button" onClick={signIn}>Sign in</Button>
      </Show>
      <Show when="signed-in">
        {showProfileLink ? <ButtonLink variant="secondary" size={buttonSize} className="auth-button" style={{ textDecoration: "none" }} href="/profile">My learning</ButtonLink> : null}
        <span className={styles.avatar}><span aria-hidden="true">{(user?.firstName || user?.username || "U").slice(0, 1).toUpperCase()}</span><span className={styles.accountMenu}><UserButton /></span></span>
      </Show>
    </div>
  );
}
