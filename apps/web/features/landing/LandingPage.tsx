import { buttonAppearance } from "@/components/ui/button";
import Link from "@/components/ui/PrefetchLink";
import { BrandLogo } from "@/components/BrandLogo";
import { ArrowDown, ArrowRight, Bookmark, Puzzle, MessageCircle, Quote, Waves } from "lucide-react";
import { LandingNavigation } from "./LandingNavigation";
import { VideoEntry } from "./VideoEntry";
import { chromeStoreHref } from "./entry";
import styles from "./LandingPage.module.css";

function ChromeIcon() {
  return <svg className={styles.chromeIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
    <path d="M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14" />
  </svg>;
}

export function LandingPage() {
  const extensionUrl = chromeStoreHref(process.env.LIBITU_CHROME_STORE_URL);

  return <div className={styles.page}>
    <a className={styles.skipLink} href="#main">Skip to content</a>
    <header className={styles.header}>
      <BrandLogo className={styles.logo} />
      <LandingNavigation />
    </header>

    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.wave} aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <i key={index} />)}</div>
        <h1 id="hero-title"><span>Learn from real speech.</span><em>Then actually say it.</em></h1>
        <VideoEntry />
        <div className={styles.extensionEntry}>
          <span className={styles.entryDivider}>or</span>
          <a {...buttonAppearance({ variant: "secondary", size: "md", className: `${styles.extensionButton} ${styles.installButton}` })}  href={extensionUrl ?? "#extension"}
            target={extensionUrl ? "_blank" : undefined} rel={extensionUrl ? "noopener noreferrer" : undefined}
            aria-describedby="extension-help">
            <ChromeIcon />Add to Chrome
          </a>
          <p id="extension-help" className={styles.extensionHelp}>Use Libitu directly on supported YouTube videos.
            {!extensionUrl ? <span>Chrome Web Store release coming soon · View installation details</span> : null}
          </p>
        </div>
        <a className={styles.scrollCue} href="#how-it-works">Explore how it works <ArrowDown size={16} aria-hidden="true" /></a>
      </section>

      <section id="how-it-works" className={styles.stepsSection} aria-labelledby="steps-title">
        <div className={styles.sectionIntro}><p className={styles.kicker}>FROM WATCHING TO SPEAKING</p><h2 id="steps-title">Make it your English.</h2><p>Keep what is useful. Practice in a way that works for you.</p></div>
        <div className={styles.stepsGrid}>
          <article className={styles.step}>
            <div className={styles.stepIcon}><Bookmark size={21} aria-hidden="true" /></div>
            <div className={styles.stepHeading}><h3>Collect</h3><span>01</span></div>
            <p>Discover phrases, idioms, and sentence patterns in a video. Save the ones you want to make your own.</p>
            <span className={styles.stepCaption}>Your words, in context</span>
          </article>
          <article className={styles.step}>
            <div className={styles.stepIcon}><Waves size={22} aria-hidden="true" /></div>
            <div className={styles.stepHeading}><h3>Shadow</h3><span>OPTIONAL</span></div>
            <p>Listen, repeat, and explore sound, rhythm, and melody, one sentence at a time. Or go straight to a conversation.</p>
            <span className={styles.stepCaption}>A little practice out loud</span>
          </article>
          <article className={styles.step}>
            <div className={styles.stepIcon}><MessageCircle size={21} aria-hidden="true" /></div>
            <div className={styles.stepHeading}><h3>Use</h3><span>02</span></div>
            <p>Take your saved phrases into a work or everyday scenario. Speak with an AI partner and get feedback on your conversation.</p>
            <span className={styles.stepCaption}>Language you can reach for</span>
          </article>
        </div>
        <p className={styles.accountNote}>Explore a video first. Sign in when you are ready to shadow, start a mission, or keep your collection across devices.</p>
      </section>

      <section className={styles.exampleSection} aria-labelledby="example-title">
        <div className={styles.exampleIntro}><p className={styles.kicker}>A SMALL EXAMPLE</p><h2 id="example-title">From “I know that phrase”<br />to “I just used it.”</h2><p>The next conversation is where it becomes yours.</p></div>
        <div className={styles.exampleCard}>
          <div className={styles.exampleHeader}><Quote size={17} aria-hidden="true" /><span>Illustrative example</span></div>
          <div className={styles.sourceLine}><span className={styles.smallLabel}>YOU HEAR</span><p>“Let’s <mark>take a step back</mark> and look at the bigger picture.”</p></div>
          <div className={styles.savedPhrase}><Bookmark size={14} aria-hidden="true" /><span>take a step back</span><span>Saved phrase</span></div>
          <div className={styles.conversation}><span className={styles.smallLabel}>YOU USE · A TEAM DISCUSSION</span><p>“Can we take a step back? I think we need to agree on the goal first.”</p></div>
        </div>
      </section>

      <section id="extension" className={styles.extensionSection} aria-labelledby="extension-title">
        <Puzzle size={24} aria-hidden="true" />
        <div><h2 id="extension-title">Add Libitu to Chrome</h2><p>With the Libitu Chrome extension installed, open an English video and click Libitu in the player or browser toolbar. Available captions travel with you into your workspace.</p>
          {!extensionUrl ? <p className={styles.extensionNote}>The Chrome Web Store install link is not available here yet. You can start by pasting a video link above.</p> : null}
        </div>
        {extensionUrl ? <a {...buttonAppearance({ variant: "secondary", size: "md", className: styles.extensionButton })}  href={extensionUrl} target="_blank" rel="noopener noreferrer">Add to Chrome<ArrowRight size={15} aria-hidden="true" /></a> : null}
      </section>

      <section className={styles.closing} aria-labelledby="closing-title"><p className={styles.kicker}>ONE VIDEO. SOMETHING TO SAY.</p><h2 id="closing-title">Start with something you want to watch.</h2><a {...buttonAppearance({ variant: "primary", size: "md", className: styles.primaryButton })}  href="#video-url">Paste a video link<ArrowRight size={17} aria-hidden="true" /></a></section>
    </main>
    <footer className={styles.footer}><BrandLogo className={styles.logo} /><span>Make it your English.</span><nav aria-label="Footer navigation"><a href="#how-it-works">How it works</a><Link href="/profile">My learning</Link></nav></footer>
  </div>;
}
