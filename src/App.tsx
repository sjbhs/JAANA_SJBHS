import { FormEvent, startTransition, useEffect, useRef, useState } from "react";

type TabId = "overview" | "give" | "connect" | "contact";

type InquiryForm = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
};

type TabConfig = {
  id: TabId;
  label: string;
  kicker: string;
  title: string;
  copy: string;
};

type PriorityCard = {
  title: string;
  body: string;
  points: string[];
  cta: string;
  tab: TabId;
};

type CauseCard = {
  title: string;
  summary: string;
  minimum: string;
  purpose: string;
  goal: string;
  impact: string;
  support: string[];
  donationWays: string[];
};

type DonationTrack = {
  title: string;
  minimum: string;
  summary: string;
  details: string[];
};

type PaymentOption = {
  title: string;
  shortTitle?: string;
  detail: string;
  href: string;
  action: string;
};

type ContactChannel = {
  label: string;
  value: string;
  href: string;
};

type SponsorTier = {
  title: string;
  amount: string;
  benefits: string[];
};

type EventHighlight = {
  title: string;
  body: string;
};

type SecondaryPage = {
  title: string;
  body: string;
};

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

type HouseShield = {
  src: string;
  alt: string;
};

type DonationMenuProps = {
  buttonClassName: string;
  label?: string;
  options: PaymentOption[];
  align?: "left" | "right";
  variant?: "floating" | "stacked";
};

const tabs: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    kicker: "Priority Build",
    title: "The first release should concentrate on Give, Contact, and North America Connect 2026.",
    copy:
      "The giving flow is now consolidated into one cleaner destination, while the event and contact pages remain the other primary paths."
  },
  {
    id: "give",
    label: "Give",
    kicker: "Giving",
    title: "Give to the SJBHS OBA from the United States.",
    copy: ""
  },
  {
    id: "connect",
    label: "Connect 2026",
    kicker: "North America Connect 2026",
    title: "Promote the September 19 and 20, 2026 gathering in the Washington, D.C. metro area.",
    copy:
      "This page foregrounds the save-the-date message, sponsorship opportunity, and placeholders for tickets, venue details, and additional event information."
  },
  {
    id: "contact",
    label: "Contact",
    kicker: "Stay Involved",
    title: "Reach the OBA or JAANA for donations, sponsorship, or general alumni coordination.",
    copy:
      "Contact remains available, but the strongest conversion paths now point toward Causes, Donate, and North America Connect 2026."
  }
];

const impactStats = [
  { value: "6", label: "priority causes available on the Give page" },
  { value: "$12K", label: "minimum USA endowment commitment, payable over 3 years" },
  { value: "Sept 19-20, 2026", label: "North America Connect weekend in the Washington, D.C. metro area" }
];

const priorityCards: PriorityCard[] = [
  {
    title: "Give",
    body:
      "The giving page now combines causes and donation routes into one cleaner flow, so donors can choose what to support and act from the same place.",
    points: [
      "Student Scholarships",
      "Teachers Insurance Program",
      "Mid-Day Meal Program",
      "Student Awards Program",
      "School Infrastructure Development",
      "Other Jesuit causes"
    ],
    cta: "Open Give page",
    tab: "give"
  },
  {
    title: "Donation process",
    body:
      "The United States donation process stays explicit, with endowment, grant, and overflow donation routes, plus ACH, card, and stock transfer options.",
    points: [
      "Endowment Account",
      "One-time Grant",
      "One-time Donation",
      "ACH, card, and stock transfer instructions",
      "Direct donation method links"
    ],
    cta: "Open Donate",
    tab: "give"
  },
  {
    title: "North America Connect 2026",
    body:
      "Use the event page as the forward-looking campaign page, with the save-the-date treatment, sponsor packet, and placeholders for tickets and logistics.",
    points: [
      "Washington, D.C. metro area",
      "Saturday Dinner and Sunday Picnic Lunch",
      "100+ in-person attendees and 300+ online reach",
      "Call for sponsors materials and contacts"
    ],
    cta: "Open Connect 2026",
    tab: "connect"
  }
];

const causeCards: CauseCard[] = [
  {
    title: "Student Scholarships",
    summary: "Help students stay in school and pursue their education without interruption.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Enable students requiring financial aid to pursue their education goals without interruption.",
    goal: "Goal: INR 1,00,00,000 annually | USD 120,000 annually",
    impact: "Impact: 114 students supported in Academic Year 2024-25.",
    support: [
      "Loyola Scholarship Scheme: annual commitment of INR 75,000 (approx. USD 900) per scholar for 10 years.",
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "One-time grant for immediate scholarship support.",
      "Endowment support for recurring annual scholarships.",
      "Smaller contributions can still be directed into the scholarship effort through the standard donation route."
    ]
  },
  {
    title: "Teachers Insurance Program",
    summary: "Protect teaching staff, support staff, retired staff, and eligible families with insurance cover.",
    minimum: "From INR 500 | approx. USD 6",
    purpose:
      "Provide teaching staff, support staff, retired staff, and their families with health and personal accident insurance cover.",
    goal: "Goal: INR 30,00,000 annually | USD 35,000 annually",
    impact:
      "Impact: health insurance coverage of INR 3,00,000 for 540 lives, plus personal accident coverage for 180 teaching staff.",
    support: [
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "One-time grant to support the current insurance cycle.",
      "Endowment support for a recurring annual contribution to the insurance pool.",
      "Smaller donor gifts can still be routed toward teacher welfare through the standard donation process."
    ]
  },
  {
    title: "Mid-Day Meal Program",
    summary: "Fund daily nourishment for children through the school’s mid-day meal support.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Provide children with a nourishing meal every school day.",
    goal: "Goal: INR 21,00,000 annually | USD 25,000 annually",
    impact: "Impact: 3,000 meals supported in Academic Year 2024-25.",
    support: [
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "One-time grant for immediate meal programme funding.",
      "Endowment support to create a more durable annual meal subsidy.",
      "Smaller gifts can still be applied to the programme through the standard donation route."
    ]
  },
  {
    title: "Student Awards Program",
    summary: "Back prizes and recognition that reinforce excellence in academics, sport, and the arts.",
    minimum: "INR 1,00,000 endowment | approx. USD 1,200",
    purpose: "Promote excellence in academics, sports, and the arts at the right stages of school life.",
    goal: "Goal: build an awards system that strengthens recognition, morale, and aspiration.",
    impact:
      "Impact: awards timed to key classes and levels to reinforce confidence, achievement, and continuity across the student journey.",
    support: [
      "Endowment fund minimum of INR 1,00,000 (approx. USD 1,200), with proceeds awarded annually.",
      "Useful for donors who want named recognition attached to a recurring annual prize."
    ],
    donationWays: [
      "Endowment support is the primary route for recurring annual awards.",
      "Named donor-backed prizes work especially well here.",
      "This cause suits donors who want visible, long-term recognition tied to student excellence."
    ]
  },
  {
    title: "School Infrastructure Development",
    summary: "Support classrooms, laboratories, sports facilities, and named campus development projects.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Support classrooms, sports facilities, laboratories, and other campus development needs.",
    goal: "Goal: INR 25,00,00,000 | USD 2,750,000",
    impact:
      "Impact: legacy-led contributions can fund named learning spaces and long-term improvements across the school campus.",
    support: [
      "Name a classroom: INR 25,00,000 (approx. USD 30,000).",
      "Name on a pillar or pavilion plaque: INR 5,00,000 (approx. USD 6,000).",
      "General grants from INR 500 (approx. USD 6) and multiples thereof."
    ],
    donationWays: [
      "One-time grant for immediate capital support.",
      "Named giving opportunities for classrooms, pillars, and pavilions.",
      "General contributions can still be directed toward broader infrastructure needs."
    ]
  },
  {
    title: "Other Jesuit causes",
    summary: "Direct support to allied BJES and Josephite causes beyond the core OBA buckets.",
    minimum: "From INR 500 | approx. USD 6",
    purpose:
      "Support allied BJES and Josephite causes when donors want to direct funds beyond the core OBA school-support buckets.",
    goal: "Goal: donor-directed support routed through the same compliant USA donation process.",
    impact:
      "Impact: allied causes can be acknowledged in OBA communications and the annual report with credit to donors.",
    support: [
      "Use the donation agreement to specify the intended end use clearly.",
      "Suitable for individual, family, or batch-led contributions supporting allied Jesuit work.",
      "The same endowment, grant, and donation routes apply."
    ],
    donationWays: [
      "Use the donation agreement to state the exact Jesuit or BJES cause you want supported.",
      "One-time grants work well for directed needs requiring current deployment.",
      "Endowment and general donation routes can still be used when a recurring or pooled structure is more appropriate."
    ]
  }
];

const donationTracks: DonationTrack[] = [
  {
    title: "Endowment Account",
    minimum: "Minimum $12,000 | approx. INR 10,00,000 payable over 3 years",
    summary:
      "A long-term giving route where the corpus is invested and annual gains are distributed to the designated cause.",
    details: [
      "Built for recurring long-term support rather than a single campaign cycle.",
      "Annual distributions are donor-directed, subject to a minimum 5% payout of the corpus.",
      "Donors may opt in for visibility into the Fidelity account and invest in consultation with an advisor."
    ]
  },
  {
    title: "One-time Grant",
    minimum: "Minimum $1,000 | approx. INR 83,000",
    summary:
      "The full gift is sent through to the OBA for the specific cause or use named in the donation agreement.",
    details: [
      "Best for immediate cause support where the donor wants funds deployed now.",
      "Works well for scholarships, teacher welfare, meals, infrastructure, or named donor campaigns.",
      "Deployment instructions are shared with the OBA alongside the grant."
    ]
  },
  {
    title: "One-time Donation",
    minimum: "For amounts below $1,000 | approx. INR 83,000, or amounts above what can be deployed annually",
    summary:
      "Smaller gifts and excess amounts are held in the overflow Fidelity account until deployment is possible.",
    details: [
      "Provides a path for smaller gifts while preserving compliance and tracking.",
      "Also catches excess amounts that cannot be deployed in a single annual cycle.",
      "Keeps the donation path open for alumni who want to contribute now, even outside the grant threshold."
    ]
  }
];

const donationContacts: ContactChannel[] = [
  {
    label: "JAANA Finance",
    value: "jaanafinance@gmail.com",
    href: "mailto:jaanafinance@gmail.com?subject=JAANA%20General%20Endowment"
  },
  {
    label: "Donations desk",
    value: "donations@sjbhsoba.net",
    href: "mailto:donations@sjbhsoba.net"
  },
  {
    label: "OBA President",
    value: "president@sjbhsoba.net",
    href: "mailto:president@sjbhsoba.net"
  },
  {
    label: "Joint Treasurer",
    value: "jt.treasurer@sjbhsoba.net",
    href: "mailto:jt.treasurer@sjbhsoba.net"
  }
];

const paymentOptions: PaymentOption[] = [
  {
    title: "ACH or wire transfer",
    shortTitle: "ACH / Wire",
    detail: "Request current banking instructions directly from JAANA Finance.",
    href: "mailto:jaanafinance@gmail.com?subject=JAANA%20General%20Endowment",
    action: "Request instructions"
  },
  {
    title: "Credit or debit card",
    shortTitle: "Card payment",
    detail: "Use the JAANA payment page for card donations. Processing fees apply.",
    href: "https://jaana.co/ways-to-give/",
    action: "Open payment page"
  },
  {
    title: "Stock transfer",
    shortTitle: "Stock transfer",
    detail: "Request the stock transfer instructions from JAANA Finance before initiating the transfer.",
    href: "mailto:jaanafinance@gmail.com?subject=JAANA%20Stock%20Transfer%20Info",
    action: "Request stock transfer info"
  }
];

const sponsorHighlights: EventHighlight[] = [
  {
    title: "Save the date",
    body:
      "North America Connect is planned for September 19 and 20, 2026 in the Washington, D.C. metro area, with a Saturday Dinner and Sunday Picnic Lunch."
  },
  {
    title: "Audience and reach",
    body:
      "The sponsor packet projects 100+ in-person attendees across alumni and families, plus 300+ additional members reached through JAANA social channels."
  },
  {
    title: "Charitable impact",
    body:
      "Event proceeds are intended to support the SJBHS OBA Teachers Insurance fund covering teaching staff, support staff, retired staff, and eligible families."
  },
  {
    title: "Why sponsors fit here",
    body:
      "The pitch is aimed at a high-trust alumni audience seeking services across real estate, finance, tax, wealth planning, senior care, insurance, banking, and legal work."
  }
];

const sponsorTiers: SponsorTier[] = [
  {
    title: "Bronze",
    amount: "$500-$999",
    benefits: [
      "Text listing in the brochure and digital brochure.",
      "Rolling presentation listing at the venue.",
      "Tagged in thank-you and recap communications."
    ]
  },
  {
    title: "Silver",
    amount: "$1,000-$1,499",
    benefits: [
      "Half-page ad in the brochure and digital brochure.",
      "Logo in the rolling presentation plus banner placement.",
      "Individual social post and 1 included ticket."
    ]
  },
  {
    title: "Gold",
    amount: "$1,500+",
    benefits: [
      "Full-page brochure ad, QR option, and hyperlinks in the digital brochure.",
      "Feature-story or video treatment on social media.",
      "Individual table or sponsor-zone visibility, podium recognition, and 2 included tickets."
    ]
  }
];

const connectMoments: GalleryImage[] = [
  {
    src: "/assets/connect-group-night.jpg",
    alt: "A large OBA community group gathered outdoors at night under string lights.",
    caption: "The site can still carry the warmth and scale of recent Connect gatherings."
  },
  {
    src: "/assets/connect-group-steps.jpg",
    alt: "A multi-generational alumni group standing on steps outside a heritage building.",
    caption: "Past Connect imagery helps establish the tone while North America Connect 2026 is still taking shape."
  },
  {
    src: "/assets/connect-carols.jpg",
    alt: "A group singing together at a festive OBA Christmas gathering.",
    caption: "Family participation and school-centered fellowship remain part of the event story."
  }
];

const sponsorMaterials: GalleryImage[] = [
  {
    src: "/assets/call-for-sponsors-1.png",
    alt: "First page of the North America Connect 2026 call for sponsors packet.",
    caption: "Call for Sponsors: overview page"
  },
  {
    src: "/assets/call-for-sponsors-2.png",
    alt: "Second page of the North America Connect 2026 call for sponsors packet detailing sponsor tiers.",
    caption: "Call for Sponsors: sponsorship tiers"
  }
];

const connectPlaceholders: SecondaryPage[] = [
  {
    title: "Buy tickets",
    body: "Hold this space for ticketing once pricing, registration flow, and batch allocations are finalized."
  },
  {
    title: "Venue and lodging",
    body: "Keep a placeholder for venue confirmation, hotel block details, and local travel notes for out-of-town attendees."
  },
  {
    title: "Weekend schedule",
    body: "Reserve room for the detailed Saturday and Sunday programme once programming is approved."
  }
];

const secondaryPages: SecondaryPage[] = [
  {
    title: "About Us",
    body: "Keep this page lightweight for now with placeholder copy that can be expanded later."
  },
  {
    title: "Gallery and previous reunions",
    body: "Past event folders can remain secondary while the 2026 event page is front and center."
  },
  {
    title: "Mentor, Volunteer, Statements, and External Sites",
    body: "These pages can stay in backlog mode until the core give flow and Connect 2026 content are locked."
  }
];

const houseShields: HouseShield[] = [
  {
    src: "/assets/house-andrew.svg",
    alt: "St. Andrew house shield"
  },
  {
    src: "/assets/house-george.svg",
    alt: "St. George house shield"
  },
  {
    src: "/assets/house-david.svg",
    alt: "St. David house shield"
  },
  {
    src: "/assets/house-patrick.svg",
    alt: "St. Patrick house shield"
  }
];

const contactChannels: ContactChannel[] = [
  {
    label: "Donations",
    value: "donations@sjbhsoba.net",
    href: "mailto:donations@sjbhsoba.net"
  },
  {
    label: "JAANA Finance",
    value: "jaanafinance@gmail.com",
    href: "mailto:jaanafinance@gmail.com?subject=JAANA%20General%20Endowment"
  },
  {
    label: "Sponsors",
    value: "Nikhil, Anagha, Vishal",
    href: "mailto:nikhil.mascarenhas@gmail.com?cc=anagha.todalbagi@gmail.com,vcurrie@gmail.com&subject=North%20America%20Connect%202026%20Sponsorship"
  },
  {
    label: "President",
    value: "president@sjbhsoba.net",
    href: "mailto:president@sjbhsoba.net"
  },
  {
    label: "Website",
    value: "www.sjbhsoba.net",
    href: "https://www.sjbhsoba.net"
  }
];

const inquiryTopics = [
  "Support a cause",
  "Donate from the USA",
  "Sponsor North America Connect 2026",
  "General alumni question"
];

const initialForm: InquiryForm = {
  name: "",
  email: "",
  organization: "",
  interest: "",
  notes: ""
};

function DonationMenu({
  buttonClassName,
  label = "Donate now",
  options,
  align = "left",
  variant = "floating"
}: DonationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const stackedListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || variant !== "stacked") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const lastOption = stackedListRef.current?.lastElementChild as HTMLElement | null;
      lastOption?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth"
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, variant]);

  if (variant === "stacked") {
    return (
      <div className="donation-menu is-stacked" ref={menuRef}>
        <button
          className={`${buttonClassName} donation-menu-trigger${isOpen ? " is-open" : ""}`}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {label}
          <span className="donation-menu-caret" aria-hidden="true">
            ▾
          </span>
        </button>

        {isOpen ? (
          <div className="donation-menu-panel is-stacked-list" role="menu" ref={stackedListRef}>
            {options.map((option) => (
              <a
                key={option.title}
                className="donation-menu-item is-link-only"
                href={option.href}
                role="menuitem"
                target={option.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
              >
                <strong>{option.shortTitle ?? option.title}</strong>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="donation-menu" ref={menuRef}>
      <button
        className={`${buttonClassName} donation-menu-trigger${isOpen ? " is-open" : ""}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
        <span className="donation-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={`donation-menu-panel${align === "right" ? " is-right" : ""}`} role="menu">
          {options.map((option) => (
            <a
              key={option.title}
              className="donation-menu-item"
              href={option.href}
              role="menuitem"
              target={option.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
            >
              <strong>{option.title}</strong>
              <span>{option.detail}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCause, setSelectedCause] = useState<CauseCard | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const syncTabWithHash = () => {
      const nextTab = window.location.hash.replace("#", "");

      if (nextTab === "causes") {
        startTransition(() => {
          setActiveTab("give");
        });
        window.history.replaceState(null, "", "#give");
        return;
      }

      if (tabs.some((tab) => tab.id === nextTab)) {
        startTransition(() => {
          setActiveTab(nextTab as TabId);
        });
      }
    };

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);

    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  useEffect(() => {
    if (!lightboxImage && !selectedCause) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
        setSelectedCause(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [lightboxImage, selectedCause]);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("Unable to reach the inquiry service.");
        }

        const payload = (await response.json()) as { status: string };

        if (!cancelled) {
          startTransition(() => {
            setBackendOnline(payload.status === "ok");
          });
        }
      } catch {
        if (!cancelled) {
          startTransition(() => {
            setBackendOnline(false);
          });
        }
      }
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const activateTab = (tabId: TabId) => {
    setSelectedCause(null);
    setLightboxImage(null);

    startTransition(() => {
      setActiveTab(tabId);
    });

    window.history.replaceState(null, "", `#${tabId}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusTone("idle");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setForm(initialForm);
      setStatusTone("success");
      setStatusMessage(payload.message ?? "Thanks for reaching out.");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabDetails = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isOverviewTab = activeTab === "overview";

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <button
            className="brand-lockup"
            onClick={() => activateTab("overview")}
            type="button"
            aria-label="Go to overview"
          >
            <img src="/assets/oba-connect-mark.png" alt="SJBHS OBA Connect" />
            <div>
              <span>SJBHS OBA</span>
              <strong>Connect</strong>
            </div>
          </button>

          <div className="house-shields header-shields" aria-label="SJBHS house shields">
            {houseShields.map((shield) => (
              <div className="house-shield" key={shield.src}>
                <img src={shield.src} alt={shield.alt} />
              </div>
            ))}
          </div>

          <div className="header-actions">
            <nav className="site-nav" aria-label="Homepage sections" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  className={activeTab === tab.id ? "site-tab is-active" : "site-tab"}
                  onClick={() => activateTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <DonationMenu buttonClassName="header-cta" options={paymentOptions} align="right" />
          </div>
        </div>
      </header>

      <main className={isOverviewTab ? "main-overview" : "main-subpage"}>
        {isOverviewTab ? (
          <>
            <section className="hero-section">
              <div className="hero-copy">
                <div className="hero-brand" aria-label="JAANA identity">
                  <img src="/assets/jaana-wordmark.png" alt="JAANA wordmark" />
                  <h1 className="hero-motto">Fide et Labore.</h1>
                </div>
                <p className="hero-lead">
                  This version of the site now concentrates the giving experience into one cleaner page, alongside
                  North America Connect 2026 and direct contact.
                </p>

                <div className="hero-actions">
                  <button className="primary-button" type="button" onClick={() => activateTab("give")}>
                    Give now
                  </button>
                  <button className="secondary-button" type="button" onClick={() => activateTab("connect")}>
                    See Connect 2026
                  </button>
                </div>

                <div className="impact-strip" aria-label="Priority highlights">
                  {impactStats.map((stat) => (
                    <article key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hero-media">
                <button
                  className="photo-button media-tile media-tile-main"
                  type="button"
                  onClick={() => setLightboxImage(connectMoments[0])}
                >
                  <img src={connectMoments[0].src} alt="" />
                </button>
                <div className="media-stack">
                  <button
                    className="photo-button media-tile media-tile-small"
                    type="button"
                    onClick={() => setLightboxImage(connectMoments[1])}
                  >
                    <img src={connectMoments[1].src} alt="" />
                  </button>
                  <button
                    className="photo-button media-tile media-tile-small"
                    type="button"
                    onClick={() => setLightboxImage(connectMoments[2])}
                  >
                    <img src={connectMoments[2].src} alt="" />
                  </button>
                </div>
              </div>
            </section>

            <section id="overview-panel" className="overview-shell" role="tabpanel" aria-label="Overview">
              <div className="featured-heading priority-heading">
                <div>
                  <h3>The primary workstreams are now visible as the first thing users see.</h3>
                </div>
              </div>

              <div className="priority-grid">
                {priorityCards.map((card) => (
                  <article className="priority-card" key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                    <ul className="detail-list">
                      {card.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <button className="inline-button priority-link" type="button" onClick={() => activateTab(card.tab)}>
                      {card.cta}
                    </button>
                  </article>
                ))}
              </div>

              <div className="secondary-pages-card">
                <div className="featured-heading">
                  <div>
                    <h3>Other pages remain available as secondary follow-on work.</h3>
                  </div>
                </div>

                <div className="secondary-page-grid">
                  {secondaryPages.map((page) => (
                    <article className="secondary-page-card" key={page.title}>
                      <h3>{page.title}</h3>
                      <p>{page.body}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="school-banner-card">
                <img src="/assets/sjbhs-main-banner.jpg" alt="St. Joseph's Boys' High School campus banner" />
                <div className="school-banner-copy">
                  <h3>The priority pages still point back to the school and its community.</h3>
                  <p>
                    Causes define what gets funded, donate shows how US support is routed, and North America Connect
                    2026 acts as the forward-looking event page that grows community and sponsorship.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "give" ? (
          <section id="give-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Give">
            <div className="donation-page-header">
              <div className="donation-page-copy">
                <h2>{activeTabDetails.title}</h2>
                {activeTabDetails.copy ? <p>{activeTabDetails.copy}</p> : null}
              </div>

              <div className="donation-header-actions">
                <DonationMenu buttonClassName="primary-button" options={paymentOptions} />
              </div>
            </div>

            <div className="donation-summary-bar">
              <article className="donation-summary-item">
                <span>Causes</span>
                <strong>6 priority funds</strong>
              </article>
              <article className="donation-summary-item">
                <span>Endowment</span>
                <strong>$12,000 | approx. INR 10,00,000</strong>
              </article>
              <article className="donation-summary-item">
                <span>Grant</span>
                <strong>
                  $1,000 | approx.
                  <br />
                  INR 83,000
                </strong>
              </article>
              <article className="donation-summary-item">
                <span>USA route</span>
                <strong>FCRA-compliant and U.S. tax-deductible</strong>
              </article>
            </div>

            <section className="give-section">
              <div className="give-section-head">
                <h3>Choose a cause</h3>
              </div>

              <div className="cause-list" aria-label="Cause list">
                {causeCards.map((cause) => (
                  <button className="cause-list-item" key={cause.title} type="button" onClick={() => setSelectedCause(cause)}>
                    <div className="cause-list-copy">
                      <h3>{cause.title}</h3>
                      <p>{cause.summary}</p>
                    </div>

                    <div className="cause-list-meta">
                      <span>Minimum amount</span>
                      <strong>{cause.minimum}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="give-section">
              <div className="give-section-head">
                <h3>Choose a giving route</h3>
              </div>

              <div className="support-grid donate-grid donation-route-grid">
                {donationTracks.map((track) => (
                  <article className="support-card donation-route-card" key={track.title}>
                    <p className="support-note">{track.minimum}</p>
                    <h3>{track.title}</h3>
                    <p>{track.summary}</p>
                    <ul className="detail-list">
                      {track.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="give-section give-contact-section">
              <div className="give-section-head">
                <h3>Contacts</h3>
              </div>

              <div className="donation-detail-grid donation-contact-grid">
                {donationContacts.map((channel) => (
                  <article className="donation-contact-tile" key={channel.label}>
                    <span>{channel.label}</span>
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      {channel.value}
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {activeTab === "connect" ? (
          <section id="connect-panel" className="subpage-shell" role="tabpanel" aria-label="North America Connect 2026">
            <div className="subpage-hero">
              <div className="subpage-copy">
                <span className="section-kicker">{activeTabDetails.kicker}</span>
                <h2>{activeTabDetails.title}</h2>
                <p>{activeTabDetails.copy}</p>
              </div>

              <aside className="event-poster">
                <strong>North America Connect 2026</strong>
                <p>Washington, D.C. metro area</p>
                <div className="event-poster-meta">
                  <span>Saturday Dinner</span>
                  <span>Sunday Picnic Lunch</span>
                  <span>September 19-20, 2026</span>
                </div>
                <div className="process-actions">
                  <a className="inline-link event-link" href="/docs/north-america-connect-2026-call-for-sponsors.pdf" target="_blank" rel="noreferrer">
                    Download sponsor packet
                  </a>
                  <a
                    className="inline-link event-link"
                    href="mailto:nikhil.mascarenhas@gmail.com?cc=anagha.todalbagi@gmail.com,vcurrie@gmail.com&subject=North%20America%20Connect%202026%20Sponsorship"
                  >
                    Contact sponsors team
                  </a>
                </div>
              </aside>
            </div>

            <div className="event-highlight-grid">
              {sponsorHighlights.map((item) => (
                <article className="story-card event-card" key={item.title}>
                  <span>{item.title}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>

            <div className="section-block">
              <div className="featured-heading">
                <div>
                  <h3>Bronze, Silver, and Gold are already defined in the packet.</h3>
                </div>
              </div>

              <div className="support-grid donate-grid">
                {sponsorTiers.map((tier) => (
                  <article className="support-card sponsor-tier-card" key={tier.title}>
                    <p className="support-note">{tier.amount}</p>
                    <h3>{tier.title}</h3>
                    <ul className="detail-list">
                      {tier.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className="section-block">
              <div className="featured-heading">
                <div>
                  <h3>Sponsor collateral is embedded directly on the page.</h3>
                </div>
              </div>

              <div className="featured-photo-strip sponsor-material-grid">
                {sponsorMaterials.map((material) => (
                  <button
                    className="featured-photo sponsor-material"
                    key={material.src}
                    type="button"
                    onClick={() => setLightboxImage(material)}
                  >
                    <img src={material.src} alt={material.alt} />
                    <span>{material.caption}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="section-block">
              <div className="featured-heading">
                <div>
                  <h3>Buy tickets and detailed logistics can come online next.</h3>
                </div>
              </div>

              <div className="support-grid donate-grid">
                {connectPlaceholders.map((item) => (
                  <article className="support-card" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="section-block">
              <div className="featured-heading">
                <div>
                  <h3>Existing photo assets keep the 2026 page from feeling empty while details are still being finalized.</h3>
                </div>
              </div>

              <div className="featured-photo-strip">
                {connectMoments.map((photo) => (
                  <button className="featured-photo" key={photo.src} type="button" onClick={() => setLightboxImage(photo)}>
                    <img src={photo.src} alt={photo.alt} />
                    <span>{photo.caption}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "contact" ? (
          <section id="contact-panel" className="subpage-shell" role="tabpanel" aria-label="Contact">
            <div className="subpage-hero">
              <div className="subpage-copy">
                <span className="section-kicker">{activeTabDetails.kicker}</span>
                <h2>{activeTabDetails.title}</h2>
                <p>{activeTabDetails.copy}</p>
              </div>

              <aside className="subpage-aside">
                <strong>{backendOnline ? "Form connected" : "Form offline"}</strong>
                <p>
                  {backendOnline
                    ? "The inquiry service is ready to collect outreach about causes, donations, sponsorships, and alumni coordination."
                    : "The form is visible for review, but the connected service is not currently responding."}
                </p>
              </aside>
            </div>

            <div className="contact-panel">
              <div className="contact-sidebar">
                <article className="contact-card">
                  <h3>Donation, sponsorship, and alumni outreach</h3>
                  <ul className="contact-list">
                    {contactChannels.map((channel) => (
                      <li key={channel.label}>
                        <span>{channel.label}</span>
                        <a
                          href={channel.href}
                          target={channel.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                        >
                          {channel.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <form className="inquiry-card" onSubmit={handleSubmit}>
                <div className="form-heading">
                  <h3>Tell the OBA how you want to stay involved.</h3>
                  <p>
                    Use this for cause support, USA donations, sponsorship enquiries, chapter coordination, or general
                    alumni questions.
                  </p>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Name</span>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                  </label>

                  <label>
                    <span>Batch / City / Organization</span>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))}
                    />
                  </label>

                  <label>
                    <span>What is this about?</span>
                    <select
                      required
                      value={form.interest}
                      onChange={(event) => setForm((current) => ({ ...current, interest: event.target.value }))}
                    >
                      <option value="">Select one</option>
                      {inquiryTopics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="full-width">
                    <span>Notes</span>
                    <textarea
                      rows={4}
                      value={form.notes}
                      placeholder="Share context, timing, intended cause, or sponsorship needs."
                      onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    />
                  </label>
                </div>

                <div className="form-footer">
                  <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Submit inquiry"}
                  </button>
                  {statusMessage ? <p className={`status-note ${statusTone}`}>{statusMessage}</p> : null}
                </div>
              </form>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="site-footer">
        <div>
          <strong>SJBHS OBA Connect</strong>
          <span>Reframed around one Give page, the USA donation flow, and North America Connect 2026.</span>
        </div>
        <a href="mailto:donations@sjbhsoba.net">donations@sjbhsoba.net</a>
      </footer>

      {selectedCause ? (
        <div
          className="cause-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cause-dialog-title"
          onClick={() => setSelectedCause(null)}
        >
          <div className="cause-dialog-shell" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close cause-dialog-close" type="button" onClick={() => setSelectedCause(null)}>
              Close
            </button>

            <div className="cause-dialog-header">
              <h3 id="cause-dialog-title">{selectedCause.title}</h3>
              <p>{selectedCause.purpose}</p>
            </div>

            <div className="cause-dialog-grid">
              <article className="cause-dialog-panel cause-dialog-summary-panel">
                <div className="cause-dialog-summary-item">
                  <span>Minimum amount</span>
                  <strong>{selectedCause.minimum}</strong>
                </div>

                <div className="cause-dialog-summary-item">
                  <span>Target</span>
                  <p className="cause-dialog-target-text">{selectedCause.goal.replace(/^Goal:\s*/, "")}</p>
                </div>
              </article>

              <article className="cause-dialog-panel cause-dialog-content-panel">
                <div className="cause-dialog-section">
                  <h4>Impact</h4>
                  <p>{selectedCause.impact.replace(/^Impact:\s*/, "")}</p>
                </div>

                <div className="cause-dialog-section">
                  <h4>Where support can go</h4>
                  <ul className="detail-list">
                    {selectedCause.support.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>

            <div className="cause-dialog-actions">
              <a className="secondary-button cause-secondary-action" href="mailto:donations@sjbhsoba.net">
                Email
              </a>
              <DonationMenu buttonClassName="primary-button" options={paymentOptions} variant="stacked" />
            </div>
          </div>
        </div>
      ) : null}

      {lightboxImage ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.caption}
          onClick={() => setLightboxImage(null)}
        >
          <div className="lightbox-shell" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" type="button" onClick={() => setLightboxImage(null)}>
              Close
            </button>
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
            <p>{lightboxImage.caption}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
