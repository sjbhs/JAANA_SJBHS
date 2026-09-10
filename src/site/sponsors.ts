import type { ConnectSponsorEntry } from "./types.js";

/**
 * Canonical sponsor directory.
 *
 * Add, remove, reorder, or update sponsors here. The public site and API both
 * consume this list, so sponsor records do not belong in persisted site-content
 * JSON.
 */
export const sponsors = [
  {
    name: "Alpha Omega",
    website: "https://alphaomega.com/",
    logoSrc: "/assets/sponsors/alpha-omega-logo.png",
    logoAlt: "Alpha Omega logo",
    tier: "Gold",
    alumni: "Gautam Ijoor",
    batch: "1989"
  },
  {
    name: "AIMDRIVE-AI",
    website: "https://aimdrive.com/",
    logoSrc: "/assets/sponsors/aimdrive-ai-logo.png",
    logoAlt: "AIMDRIVE-AI powered by Anklesaria logo",
    tier: "Gold",
    alumni: "Jimmy Anklesaria",
    batch: "1972"
  },
  {
    name: "Meta Mind Global Corporation",
    website: "https://www.mmgc.us/",
    logoSrc: "/assets/sponsors/meta-mind-global-corporation-logo.png",
    logoAlt: "Meta Mind Global Corporation logo",
    tier: "Gold",
    alumni: "Vishal Currie",
    batch: "1988"
  },
  {
    name: "Learn For Life Foundation",
    website: "https://learnforlifefoundation.org/",
    logoSrc: "/assets/sponsors/learn-for-life-foundation-logo.png",
    logoAlt: "Learn For Life Foundation logo",
    tier: "Gold",
    alumni: "Thomas Thekkethala",
    batch: "1977"
  },
  {
    name: "Batch of 1997",
    website: "",
    logoSrc: "/assets/sponsors/class-of-1997.svg",
    logoAlt: "Class of 1997 sponsor mark",
    tier: "Bronze",
    alumni: "Class of 1997",
    batch: "1997"
  },
  {
    name: "Niren Saldanha",
    website: "",
    logoSrc: "",
    logoAlt: "",
    tier: "Bronze",
    alumni: "Class of 1988",
    batch: "1988"
  }
] satisfies ConnectSponsorEntry[];
