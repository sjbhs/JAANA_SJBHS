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

type AlbumCategoryId = "oba" | "christmas" | "connect" | "sports" | "school";

type EventAlbum = {
  title: string;
  category: AlbumCategoryId;
  label: string;
  summary: string;
  cover: GalleryImage;
  photos: GalleryImage[];
};

type AlbumFolder = {
  id: AlbumCategoryId;
  title: string;
  description: string;
  albums: EventAlbum[];
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

const albumAssetVersion = "2026-04-15-1";

const withAlbumAssetVersion = (image: GalleryImage): GalleryImage =>
  image.src.startsWith("/assets/albums/")
    ? {
        ...image,
        src: `${image.src}?v=${albumAssetVersion}`
      }
    : image;

const tabs: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    kicker: "SJBHS OBA | JAANA",
    title: "Support the school, strengthen the alumni network, and help shape North America Connect 2026.",
    copy:
      "This site brings together the most important ways to stay involved: give from the United States, support or attend North America Connect 2026, and reach the team directly."
  },
  {
    id: "give",
    label: "Give",
    kicker: "Giving",
    title: "Give to St. Joseph's Boys' High School from the United States.",
    copy:
      "Choose the cause you want to support, select the giving route that fits, and direct your contribution through a clear U.S.-based process."
  },
  {
    id: "connect",
    label: "Events",
    kicker: "Events",
    title: "Events, reunions, and North America Connect 2026.",
    copy:
      "Browse upcoming event information, regional reunions, and group-event albums from across the OBA community."
  },
  {
    id: "contact",
    label: "Contact",
    kicker: "Stay Involved",
    title: "Reach JAANA and the OBA for donations, sponsorships, and alumni coordination.",
    copy:
      "Use the contact page to start a donation conversation, discuss sponsorship, or reconnect with the alumni network."
  }
];

const impactStats = [
  { value: "6", label: "priority causes open for support" },
  { value: "$12K", label: "minimum USA endowment commitment, payable over 3 years" },
  { value: "Sept 19-20, 2026", label: "North America Connect weekend near Washington, D.C." }
];

const priorityCards: PriorityCard[] = [
  {
    title: "Give",
    body:
      "Support the school through a single giving experience that helps you choose a cause, understand the commitment, and take action with confidence.",
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
      "The U.S. donation process is designed to be straightforward, compliant, and transparent, with clear routes for long-term giving, immediate support, and smaller gifts.",
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
      "North America Connect 2026 is the next major gathering point for alumni and families across North America, with sponsorship opportunities already open.",
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
    summary: "Help students remain at SJBHS and continue their education without financial interruption.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Make sure students who need financial aid can continue at SJBHS with dignity, stability, and continuity.",
    goal: "Goal: INR 1,00,00,000 annually | USD 120,000 annually",
    impact: "Impact: 114 students were supported in Academic Year 2024-25.",
    support: [
      "Loyola Scholarship Scheme: annual commitment of INR 75,000 (approx. USD 900) per scholar for 10 years.",
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "Make a one-time grant to support students immediately.",
      "Create longer-term recurring impact through an endowment commitment.",
      "Smaller gifts can still be directed to scholarships through the standard donation route."
    ]
  },
  {
    title: "Teachers Insurance Program",
    summary: "Protect teaching staff, support staff, retired staff, and eligible families through insurance coverage.",
    minimum: "From INR 500 | approx. USD 6",
    purpose:
      "Provide health and personal accident coverage for teaching staff, support staff, retired staff, and eligible family members.",
    goal: "Goal: INR 30,00,000 annually | USD 35,000 annually",
    impact:
      "Impact: health insurance coverage of INR 3,00,000 for 540 lives, plus personal accident coverage for 180 teaching staff.",
    support: [
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "Fund the current insurance cycle through a one-time grant.",
      "Build recurring support through an endowment contribution.",
      "Smaller gifts can still be routed toward teacher welfare through the standard donation process."
    ]
  },
  {
    title: "Mid-Day Meal Program",
    summary: "Help provide a nourishing meal to children each school day.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Support a dependable mid-day meal programme that helps children learn and grow well.",
    goal: "Goal: INR 21,00,000 annually | USD 25,000 annually",
    impact: "Impact: 3,000 meals were supported in Academic Year 2024-25.",
    support: [
      "General grants from INR 500 (approx. USD 6) and multiples thereof.",
      "Endowment fund minimum of INR 5,00,000 (approx. USD 6,000) for recurring annual support."
    ],
    donationWays: [
      "Make a one-time grant to fund meals now.",
      "Use an endowment route to create recurring annual support.",
      "Smaller gifts can still be applied to the programme through the standard donation route."
    ]
  },
  {
    title: "Student Awards Program",
    summary: "Back prizes and recognition that celebrate excellence in academics, sport, and the arts.",
    minimum: "INR 1,00,000 endowment | approx. USD 1,200",
    purpose: "Strengthen aspiration, confidence, and recognition across school life through well-timed annual awards.",
    goal: "Goal: build an awards system that strengthens recognition, morale, and aspiration.",
    impact:
      "Impact: awards at key stages of school life reinforce confidence, achievement, and continuity across the student journey.",
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
    summary: "Support classrooms, laboratories, sports facilities, and other campus development needs.",
    minimum: "From INR 500 | approx. USD 6",
    purpose: "Help improve the physical spaces where students learn, compete, and build community.",
    goal: "Goal: INR 25,00,00,000 | USD 2,750,000",
    impact:
      "Impact: legacy-led contributions can fund named learning spaces and long-term improvements across the school campus.",
    support: [
      "Name a classroom: INR 25,00,000 (approx. USD 30,000).",
      "Name on a pillar or pavilion plaque: INR 5,00,000 (approx. USD 6,000).",
      "General grants from INR 500 (approx. USD 6) and multiples thereof."
    ],
    donationWays: [
      "Make a one-time grant for immediate capital support.",
      "Use named giving opportunities for classrooms, pillars, and pavilions.",
      "General contributions can still be directed toward broader infrastructure needs."
    ]
  },
  {
    title: "Other Jesuit causes",
    summary: "Direct support to allied BJES and Josephite causes beyond the core OBA priorities.",
    minimum: "From INR 500 | approx. USD 6",
    purpose:
      "Support allied BJES and Josephite causes when donors want to direct their giving beyond the core OBA school-support priorities.",
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
      "A long-term giving route in which the corpus is invested and annual gains are directed to the cause you choose.",
    details: [
      "Designed for recurring support rather than a single campaign cycle.",
      "Annual distributions are donor-directed, subject to a minimum 5% payout of the corpus.",
      "Donors may opt in for visibility into the Fidelity account and invest in consultation with an advisor."
    ]
  },
  {
    title: "One-time Grant",
    minimum: "Minimum $1,000 | approx. INR 83,000",
    summary:
      "The full gift is sent through to the OBA for the specific cause or use named in your donation agreement.",
    details: [
      "Best for immediate support when you want funds deployed now.",
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
      "Sponsors are speaking to a high-trust alumni audience that values relationships, referrals, and services across real estate, finance, tax, wealth planning, senior care, insurance, banking, and legal work."
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
    caption: "Recent Connect gatherings show the warmth, scale, and energy this community already brings together."
  },
  {
    src: "/assets/connect-group-steps.jpg",
    alt: "A multi-generational alumni group standing on steps outside a heritage building.",
    caption: "Past Connect moments reflect the multi-generational character of the SJBHS alumni community."
  },
  {
    src: "/assets/connect-carols.jpg",
    alt: "A group singing together at a festive OBA Christmas gathering.",
    caption: "Family participation and school-centered fellowship remain central to the Connect tradition."
  },
  {
    src: "/assets/connect-uk-table.jpg",
    alt: "Alumni seated together at a long table during an OBA gathering.",
    caption: "Shared meals and conversation remain a defining part of alumni events."
  }
];

const albumCategories = [
  {
    id: "oba" as const,
    title: "OBA Events",
    description: "Association-wide gatherings, formal milestones, and signature OBA evenings."
  },
  {
    id: "christmas" as const,
    title: "Christmas",
    description: "Christmas-season gatherings, festive dinners, and year-end fellowship."
  },
  {
    id: "connect" as const,
    title: "Connect",
    description: "Regional Connects and chapter reunions across India and abroad."
  },
  {
    id: "sports" as const,
    title: "Sports",
    description: "Football, golf, cricket, and other competitive alumni events."
  },
  {
    id: "school" as const,
    title: "School",
    description: "School-facing events and student engagement programmes captured in the Calling."
  }
];

const rawEventAlbums: EventAlbum[] = [
  {
    title: "OBA Day 2025",
    category: "oba",
    label: "August 2025",
    summary: "Commemorative moments from OBA Day, including the house-wise assembly and formal floral tribute.",
    cover: {
      src: "/assets/albums/oba-day-2025-house-assembly.jpg",
      alt: "Old Boys assembled house-wise on the school grounds during OBA Day 2025.",
      caption: "Old Boys assembled house-wise for the commemorative gathering."
    },
    photos: [
      {
        src: "/assets/albums/oba-day-2025-house-assembly.jpg",
        alt: "Old Boys assembled house-wise on the school grounds during OBA Day 2025.",
        caption: "Old Boys assembled house-wise for the commemorative gathering."
      },
      {
        src: "/assets/albums/oba-day-2025-floral-tribute.jpg",
        alt: "Cadets and OBA members participating in a formal floral tribute during OBA Day 2025.",
        caption: "OBA members paying homage through a formal floral tribute."
      }
    ]
  },
  {
    title: "Annual General Meeting 2025",
    category: "oba",
    label: "AGM",
    summary: "A formal look at the Annual General Meeting, from the committee presentation to the meeting in session.",
    cover: {
      src: "/assets/albums/agm-2025-in-session.jpg",
      alt: "Annual General Meeting 2025 in progress with attendees seated in the hall.",
      caption: "Annual General Meeting (AGM) in progress."
    },
    photos: [
      {
        src: "/assets/albums/agm-2025-managing-committee.jpg",
        alt: "The President introducing the newly elected managing committee on stage.",
        caption: "The President introducing the newly elected Managing Committee."
      },
      {
        src: "/assets/albums/agm-2025-in-session.jpg",
        alt: "Annual General Meeting 2025 in progress with attendees seated in the hall.",
        caption: "Annual General Meeting (AGM) in progress."
      }
    ]
  },
  {
    title: "Blue & White Ball 2025",
    category: "oba",
    label: "September 2025",
    summary: "An evening album from the Blue & White Ball, capturing both the crowd energy and the event atmosphere.",
    cover: {
      src: "/assets/albums/blue-white-2025-camaraderie.jpg",
      alt: "Guests gathered together on the dance floor at the Blue and White Ball 2025.",
      caption: "An evening of camaraderie as Josephites came together at the Blue & White Ball."
    },
    photos: [
      {
        src: "/assets/albums/blue-white-2025-camaraderie.jpg",
        alt: "Guests gathered together on the dance floor at the Blue and White Ball 2025.",
        caption: "An evening of camaraderie as Josephites came together at the Blue & White Ball."
      },
      {
        src: "/assets/albums/blue-white-2025-stage-ambience.jpg",
        alt: "Stage and lighting setup prepared for the Blue and White Ball celebrations.",
        caption: "Stage and ambience prepared for the Blue & White Ball celebrations."
      }
    ]
  },
  {
    title: "OBA Christmas Dinner 2025",
    category: "christmas",
    label: "December 2025",
    summary: "A festive album of Christmas Dinner moments, from carols and Santa to dinner and fellowship.",
    cover: {
      src: "/assets/albums/christmas-dinner-2025-santa.jpg",
      alt: "Santa interacting with children and families at the OBA Christmas Dinner 2025.",
      caption: "Santa giving out candies."
    },
    photos: [
      {
        src: "/assets/albums/christmas-dinner-2025-santa.jpg",
        alt: "Santa interacting with children and families at the OBA Christmas Dinner 2025.",
        caption: "Santa giving out candies."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-carol-singing.jpg",
        alt: "Participants singing carols at the OBA Christmas Dinner 2025.",
        caption: "Carol Singing."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-dinner.jpg",
        alt: "Participants enjoying dinner together at the OBA Christmas Dinner 2025.",
        caption: "Delicious dinner enjoyed by the participants."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-office-bearers.jpg",
        alt: "OBA office bearers pictured with the Father Principal at the Christmas Dinner 2025.",
        caption: "Office Bearers of the OBA with Father Principal."
      }
    ]
  },
  {
    title: "Josephite Run 2026",
    category: "sports",
    label: "January 2026",
    summary: "Photos from the Josephite Run, covering turnout, flag-off, the starting line, and younger participants.",
    cover: {
      src: "/assets/albums/josephite-run-2026-crowd.jpg",
      alt: "A large crowd of participants gathered on campus for Josephite Run 2026.",
      caption: "Over 3,000 participants gather at SJBHS grounds."
    },
    photos: [
      {
        src: "/assets/albums/josephite-run-2026-crowd.jpg",
        alt: "A large crowd of participants gathered on campus for Josephite Run 2026.",
        caption: "Over 3,000 participants gather at SJBHS grounds."
      },
      {
        src: "/assets/albums/josephite-run-2026-flag-off.jpg",
        alt: "Ceremonial flag-off at Josephite Run 2026.",
        caption: "Ceremonial flag-off of Josephite Run 2026."
      },
      {
        src: "/assets/albums/josephite-run-2026-start-line.jpg",
        alt: "Participants assembled at the starting line of Josephite Run 2026.",
        caption: "Participants at the starting line of Josephite Run 2026."
      },
      {
        src: "/assets/albums/josephite-run-2026-young-participants.jpg",
        alt: "Young participants in costume at Josephite Run 2026.",
        caption: "Young participants in vibrant costumes at Josephite Run 2026."
      }
    ]
  },
  {
    title: "Inter-Batch Football Tournament 10.0",
    category: "sports",
    label: "October 2025",
    summary: "A compact match-day album from the Century Inter-Batch Football Tournament 10.0.",
    cover: {
      src: "/assets/albums/football-10-kickoff.jpg",
      alt: "Players and officials preparing for kickoff at the Inter-Batch Football Tournament 10.0.",
      caption: "Players and officials preparing for the commencement of the match."
    },
    photos: [
      {
        src: "/assets/albums/football-10-kickoff.jpg",
        alt: "Players and officials preparing for kickoff at the Inter-Batch Football Tournament 10.0.",
        caption: "Players and officials preparing for the commencement of the match."
      },
      {
        src: "/assets/albums/football-10-lineup.jpg",
        alt: "Josephites lined up ahead of the Inter-Batch Football Tournament 10.0 match.",
        caption: "Mr. Shivaprakash H engaging with Josephites ahead of the match."
      }
    ]
  },
  {
    title: "Prestige–SJBHS OBA Golf Tournament 9.0",
    category: "sports",
    label: "Golf Tournament",
    summary: "A golf-day album with both the turnout shot and on-course play at Prestige Golfshire.",
    cover: {
      src: "/assets/albums/golf-9-group-photo.jpg",
      alt: "A large group of Josephites posing together at the Prestige–SJBHS OBA Golf Tournament 9.0.",
      caption: "A strong turnout of Josephites at the Prestige SJBHS OBA Golf Tournament."
    },
    photos: [
      {
        src: "/assets/albums/golf-9-group-photo.jpg",
        alt: "A large group of Josephites posing together at the Prestige–SJBHS OBA Golf Tournament 9.0.",
        caption: "A strong turnout of Josephites at the Prestige SJBHS OBA Golf Tournament."
      },
      {
        src: "/assets/albums/golf-9-putting.jpg",
        alt: "Focused play on the golf course during the OBA Golf Tournament.",
        caption: "Focused play and sportsmanship on display at the OBA Golf Tournament."
      }
    ]
  },
  {
    title: "Jimmy Anklesaria Cricket Tournament 2025",
    category: "sports",
    label: "November 2025",
    summary: "Tournament-day scenes from the Jimmy Anklesaria Cricket Tournament, including the opening prayer and invited-team group photo.",
    cover: {
      src: "/assets/albums/cricket-2025-opening-prayer.jpg",
      alt: "Players and officials gathered in prayer during the opening ceremony of the cricket tournament.",
      caption: "Players and officials observing a moment of prayer during the opening ceremony."
    },
    photos: [
      {
        src: "/assets/albums/cricket-2025-opening-prayer.jpg",
        alt: "Players and officials gathered in prayer during the opening ceremony of the cricket tournament.",
        caption: "Players and officials observing a moment of prayer during the opening ceremony."
      },
      {
        src: "/assets/albums/cricket-2025-pandithahalli-group.jpg",
        alt: "St. Joseph's Pandithahalli pictured with members of the OBA Managing Committee.",
        caption: "St. Joseph's Pandithahalli with the members of the OBA MC."
      }
    ]
  },
  {
    title: "Chennai Connect 2025",
    category: "connect",
    label: "Chapter meet",
    summary: "A Chennai chapter album capturing the full group at the Madras Club gathering.",
    cover: {
      src: "/assets/albums/chennai-connect-2025-group.jpg",
      alt: "Group photo from Chennai Connect 2025 outside the venue.",
      caption: "Chennai Connect 2025."
    },
    photos: [
      {
        src: "/assets/albums/chennai-connect-2025-group.jpg",
        alt: "Group photo from Chennai Connect 2025 outside the venue.",
        caption: "Chennai Connect 2025."
      }
    ]
  },
  {
    title: "UK Connect 2025",
    category: "connect",
    label: "London meet",
    summary: "A London chapter album showing the pre-Christmas UK alumni gathering.",
    cover: {
      src: "/assets/albums/uk-connect-2025-london-meet.jpg",
      alt: "UK alumni gathered together around a table in London during UK Connect 2025.",
      caption: "UK Alumni Meet in London."
    },
    photos: [
      {
        src: "/assets/albums/uk-connect-2025-london-meet.jpg",
        alt: "UK alumni gathered together around a table in London during UK Connect 2025.",
        caption: "UK Alumni Meet in London."
      }
    ]
  },
  {
    title: "Coorg Chapter 2025",
    category: "connect",
    label: "Coorg chapter",
    summary: "Photos from the Coorg chapter annual meet, covering both the formal proceedings and the gathered families.",
    cover: {
      src: "/assets/albums/coorg-chapter-2025-families.jpg",
      alt: "Josephites and their families standing together during the Coorg chapter annual meet.",
      caption: "Josephites and their families in attendance for the connect."
    },
    photos: [
      {
        src: "/assets/albums/coorg-chapter-2025-office-bearers.jpg",
        alt: "Office bearers of the Coorg Connect and the OBA Managing Committee at the event.",
        caption: "Office Bearers of the Coorg Connect and the OBA MC at the event."
      },
      {
        src: "/assets/albums/coorg-chapter-2025-families.jpg",
        alt: "Josephites and their families standing together during the Coorg chapter annual meet.",
        caption: "Josephites and their families in attendance for the connect."
      }
    ]
  },
  {
    title: "Kerala Christmas Meet 2025",
    category: "christmas",
    label: "Kerala chapter",
    summary: "A Kerala chapter group portrait from the Christmas meet in Kochi with the OBA Bikers.",
    cover: {
      src: "/assets/albums/kerala-christmas-meet-2025-group.jpg",
      alt: "Kerala Connect and the OBA Bikers gathered together for the Kerala Christmas Meet 2025.",
      caption: "Christmas cheer in Kochi as Kerala Connect and the OBA Bikers came together in true Josephite spirit."
    },
    photos: [
      {
        src: "/assets/albums/kerala-christmas-meet-2025-group.jpg",
        alt: "Kerala Connect and the OBA Bikers gathered together for the Kerala Christmas Meet 2025.",
        caption: "Christmas cheer in Kochi as Kerala Connect and the OBA Bikers came together in true Josephite spirit."
      }
    ]
  },
  {
    title: "Delhi Connect 2026",
    category: "connect",
    label: "February 2026",
    summary: "A fuller chapter album from Delhi Connect, including the group photo, Metro Museum visit, and candid fellowship moment.",
    cover: {
      src: "/assets/albums/delhi-connect-2026-group-photo.jpg",
      alt: "Group photo from Delhi Connect 2026 with Josephites and families together outdoors.",
      caption: "Josephites united in fellowship at Delhi Connect 2026."
    },
    photos: [
      {
        src: "/assets/albums/delhi-connect-2026-group-photo.jpg",
        alt: "Group photo from Delhi Connect 2026 with Josephites and families together outdoors.",
        caption: "Josephites united in fellowship at Delhi Connect 2026."
      },
      {
        src: "/assets/albums/delhi-connect-2026-metro-museum.jpg",
        alt: "Participants visiting the Delhi Metro Museum during Delhi Connect 2026.",
        caption: "A visit to the Delhi Metro Museum."
      },
      {
        src: "/assets/albums/delhi-connect-2026-fellowship.jpg",
        alt: "Participants in conversation during Delhi Connect 2026.",
        caption: "Fellowship at the Connect."
      }
    ]
  },
  {
    title: "Welcome to the OBA & Josexcel Awards 2026",
    category: "school",
    label: "Student induction",
    summary: "Group-event moments from the student induction and awards programme, focused on the gathering rather than the individual award portraits.",
    cover: {
      src: "/assets/albums/welcome-to-oba-2026-auditorium.jpg",
      alt: "Students and guests gathered in the auditorium during Welcome to the OBA and Josexcel Awards 2026.",
      caption: "Students of Classes 10 and 12 welcomed into the OBA community."
    },
    photos: [
      {
        src: "/assets/albums/welcome-to-oba-2026-auditorium.jpg",
        alt: "Students and guests gathered in the auditorium during Welcome to the OBA and Josexcel Awards 2026.",
        caption: "Students of Classes 10 and 12 welcomed into the OBA community."
      },
      {
        src: "/assets/albums/welcome-to-oba-2026-student-gathering.jpg",
        alt: "The auditorium filled with students and guests during Welcome to the OBA and Josexcel Awards 2026.",
        caption: "Auditorium gathering during Welcome to the OBA and Josexcel Awards 2026."
      }
    ]
  },
  {
    title: "Women Who Lead - Jayna Kothari Session",
    category: "school",
    label: "Talk initiative",
    summary: "Group-event moments from the first Women Who Lead session, including student interaction, Q&A, and the closing group photograph.",
    cover: {
      src: "/assets/albums/women-who-lead-2026-student-qna.jpg",
      alt: "A student speaking during the Women Who Lead session with Jayna Kothari.",
      caption: "An engaging Women Who Lead session."
    },
    photos: [
      {
        src: "/assets/albums/women-who-lead-2026-corridor-conversation.jpg",
        alt: "Jayna Kothari in conversation with students on campus.",
        caption: "Interaction with students on campus."
      },
      {
        src: "/assets/albums/women-who-lead-2026-student-qna.jpg",
        alt: "A student speaking during the Women Who Lead session with Jayna Kothari.",
        caption: "An engaging Women Who Lead session."
      },
      {
        src: "/assets/albums/women-who-lead-2026-group-photo.jpg",
        alt: "Group photo after the Women Who Lead session with Jayna Kothari.",
        caption: "Group photo following the Women Who Lead session."
      }
    ]
  }
];

const eventAlbums: EventAlbum[] = rawEventAlbums.map((album) => ({
  ...album,
  cover: withAlbumAssetVersion(album.cover),
  photos: album.photos.map(withAlbumAssetVersion)
}));

const groupedEventAlbums: AlbumFolder[] = albumCategories.map((category) => ({
  ...category,
  albums: eventAlbums.filter((album) => album.category === category.id)
}));

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
    body: "Ticketing details will be published here once pricing, registration flow, and batch allocations are finalized."
  },
  {
    title: "Venue and lodging",
    body: "Venue confirmation, hotel block details, and local travel guidance for out-of-town attendees will be added here."
  },
  {
    title: "Weekend schedule",
    body: "The detailed Saturday and Sunday programme will be shared here as the event schedule is finalized."
  }
];

const secondaryPages: SecondaryPage[] = [
  {
    title: "About Us",
    body: "A concise introduction to the OBA, JAANA, and the wider mission can expand here over time."
  },
  {
    title: "Gallery and previous reunions",
    body: "Past reunions and photo archives can continue to support the story of the community without competing with current priorities."
  },
  {
    title: "Mentor, Volunteer, Statements, and External Sites",
    body: "These areas can be developed next as the giving experience and Connect 2026 campaign continue to mature."
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
  const [selectedAlbumFolder, setSelectedAlbumFolder] = useState<AlbumFolder | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxBaseSize, setLightboxBaseSize] = useState<{ width: number; height: number } | null>(null);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [lightboxDragging, setLightboxDragging] = useState(false);
  const [lightboxPinching, setLightboxPinching] = useState(false);
  const [lightboxWheeling, setLightboxWheeling] = useState(false);
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchScaleRef = useRef(1);
  const pinchMovedRef = useRef(false);
  const lightboxScaleRef = useRef(1);
  const pinchFrameRef = useRef<number | null>(null);
  const pinchPendingScaleRef = useRef<number | null>(null);
  const pinchPendingAnchorRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const wheelFrameRef = useRef<number | null>(null);
  const wheelPendingScaleRef = useRef<number | null>(null);
  const wheelPendingAnchorRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const wheelStopTimeoutRef = useRef<number | null>(null);
  const lightboxPanRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const lightboxDragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });
  const lightboxMediaRef = useRef<HTMLDivElement | null>(null);
  const lightboxFrameRef = useRef<HTMLDivElement | null>(null);
  const lightboxImageRef = useRef<HTMLImageElement | null>(null);

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
    if (!lightboxImage && !selectedCause && !selectedAlbumFolder) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
        setLightboxZoomed(false);
        setLightboxScale(1);
        setLightboxBaseSize(null);
        setLightboxPan({ x: 0, y: 0 });
        resetLightboxInteractionState();
        setSelectedCause(null);
        setSelectedAlbumFolder(null);
        setSelectedAlbum(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [lightboxImage, selectedCause, selectedAlbumFolder, selectedAlbum]);

  useEffect(() => {
    return () => {
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
      }

      if (wheelFrameRef.current !== null) {
        window.cancelAnimationFrame(wheelFrameRef.current);
      }

      if (wheelStopTimeoutRef.current !== null) {
        window.clearTimeout(wheelStopTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!lightboxImage || !lightboxMediaRef.current) {
      return;
    }

    const media = lightboxMediaRef.current;
    const preventBrowserZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    media.addEventListener("wheel", preventBrowserZoom, { passive: false });

    return () => {
      media.removeEventListener("wheel", preventBrowserZoom);
    };
  }, [lightboxImage]);

  const clampLightboxScale = (value: number) => Math.min(4, Math.max(1, value));

  const clampLightboxPan = (
    nextPan: { x: number; y: number },
    scale = lightboxScaleRef.current,
    baseSize = lightboxBaseSize
  ) => {
    if (!baseSize) {
      return { x: 0, y: 0 };
    }

    const minX = Math.min(0, baseSize.width - baseSize.width * scale);
    const minY = Math.min(0, baseSize.height - baseSize.height * scale);

    return {
      x: Math.min(0, Math.max(minX, nextPan.x)),
      y: Math.min(0, Math.max(minY, nextPan.y))
    };
  };

  const setLightboxPanState = (
    nextPan: { x: number; y: number },
    scale = lightboxScaleRef.current,
    baseSize = lightboxBaseSize
  ) => {
    const clamped = clampLightboxPan(nextPan, scale, baseSize);
    lightboxPanRef.current = clamped;
    setLightboxPan(clamped);
    return clamped;
  };

  const resetLightboxInteractionState = () => {
    setLightboxDragging(false);
    setLightboxPinching(false);
    setLightboxWheeling(false);
    lightboxScaleRef.current = 1;
    lightboxPanRef.current = { x: 0, y: 0 };
    pinchDistanceRef.current = null;
    pinchScaleRef.current = 1;
    pinchMovedRef.current = false;
    pinchPendingScaleRef.current = null;
    pinchPendingAnchorRef.current = null;

    if (pinchFrameRef.current !== null) {
      window.cancelAnimationFrame(pinchFrameRef.current);
      pinchFrameRef.current = null;
    }

    wheelPendingScaleRef.current = null;
    wheelPendingAnchorRef.current = null;

    if (wheelFrameRef.current !== null) {
      window.cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = null;
    }

    if (wheelStopTimeoutRef.current !== null) {
      window.clearTimeout(wheelStopTimeoutRef.current);
      wheelStopTimeoutRef.current = null;
    }

    dragMovedRef.current = false;
    lightboxDragRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startPanX: 0,
      startPanY: 0
    };
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();
  };

  const openLightboxImage = (image: GalleryImage) => {
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();
    setLightboxImage(image);
  };

  const getLightboxAnchor = (anchor?: { clientX: number; clientY: number }) => {
    if (!lightboxBaseSize) {
      return { x: 0, y: 0 };
    }

    if (!anchor || !lightboxFrameRef.current) {
      return {
        x: lightboxBaseSize.width / 2,
        y: lightboxBaseSize.height / 2
      };
    }

    const frameRect = lightboxFrameRef.current.getBoundingClientRect();

    return {
      x: Math.min(Math.max(anchor.clientX - frameRect.left, 0), frameRect.width),
      y: Math.min(Math.max(anchor.clientY - frameRect.top, 0), frameRect.height)
    };
  };

  const syncLightboxViewport = (
    nextScale: number,
    anchor?: { clientX: number; clientY: number },
    currentScale = lightboxScaleRef.current
  ) => {
    if (!lightboxBaseSize) {
      return;
    }

    if (nextScale <= 1.01) {
      setLightboxPanState({ x: 0, y: 0 }, 1);
      return;
    }

    const currentPan = lightboxPanRef.current;
    const anchorPoint = getLightboxAnchor(anchor);
    const imageX = (anchorPoint.x - currentPan.x) / currentScale;
    const imageY = (anchorPoint.y - currentPan.y) / currentScale;

    setLightboxPanState(
      {
        x: anchorPoint.x - imageX * nextScale,
        y: anchorPoint.y - imageY * nextScale
      },
      nextScale
    );
  };

  const toggleLightboxZoom = (anchor?: { clientX: number; clientY: number }) => {
    if (lightboxZoomed) {
      const previousScale = lightboxScaleRef.current;
      setLightboxZoomed(false);
      setLightboxScale(1);
      lightboxScaleRef.current = 1;
      syncLightboxViewport(1, anchor, previousScale);
      setLightboxDragging(false);
      setLightboxPinching(false);
      setLightboxWheeling(false);
      pinchDistanceRef.current = null;
      pinchScaleRef.current = 1;
      pinchMovedRef.current = false;
      pinchPendingScaleRef.current = null;
      pinchPendingAnchorRef.current = null;
      dragMovedRef.current = false;
      return;
    }

    const previousScale = lightboxScaleRef.current;
    setLightboxZoomed(true);
    setLightboxScale(1.35);
    lightboxScaleRef.current = 1.35;
    syncLightboxViewport(1.35, anchor, previousScale);
    pinchScaleRef.current = 1.35;
    pinchMovedRef.current = false;
    dragMovedRef.current = false;
  };

  const adjustLightboxScale = (nextScale: number, anchor?: { clientX: number; clientY: number }) => {
    const clamped = clampLightboxScale(nextScale);
    const previousScale = lightboxScaleRef.current;
    setLightboxScale(clamped);
    lightboxScaleRef.current = clamped;
    pinchScaleRef.current = clamped;

    if (clamped <= 1.01) {
      setLightboxZoomed(false);
      setLightboxScale(1);
      lightboxScaleRef.current = 1;
      syncLightboxViewport(1, anchor, previousScale);
      setLightboxDragging(false);
      setLightboxPinching(false);
      pinchScaleRef.current = 1;
      pinchMovedRef.current = false;
      dragMovedRef.current = false;
      return;
    }

    setLightboxZoomed(true);
    syncLightboxViewport(clamped, anchor, previousScale);
  };

  const stopLightboxDrag = () => {
    if (!lightboxDragRef.current.active) {
      return;
    }

    lightboxDragRef.current.active = false;
    lightboxDragRef.current.pointerId = null;
    setLightboxDragging(false);

    if (dragMovedRef.current) {
      window.setTimeout(() => {
        dragMovedRef.current = false;
      }, 160);
    }
  };

  const schedulePinchScale = (nextScale: number, anchor: { clientX: number; clientY: number }) => {
    pinchPendingScaleRef.current = nextScale;
    pinchPendingAnchorRef.current = anchor;

    if (pinchFrameRef.current !== null) {
      return;
    }

    pinchFrameRef.current = window.requestAnimationFrame(() => {
      pinchFrameRef.current = null;

      if (pinchPendingScaleRef.current === null) {
        return;
      }

      const pendingScale = pinchPendingScaleRef.current;
      const pendingAnchor = pinchPendingAnchorRef.current ?? undefined;
      pinchPendingScaleRef.current = null;
      pinchPendingAnchorRef.current = null;
      adjustLightboxScale(pendingScale, pendingAnchor);
    });
  };

  const scheduleWheelScale = (nextScale: number, anchor: { clientX: number; clientY: number }) => {
    wheelPendingScaleRef.current = nextScale;
    wheelPendingAnchorRef.current = anchor;

    if (wheelFrameRef.current !== null) {
      return;
    }

    wheelFrameRef.current = window.requestAnimationFrame(() => {
      wheelFrameRef.current = null;

      if (wheelPendingScaleRef.current === null) {
        return;
      }

      const pendingScale = wheelPendingScaleRef.current;
      const pendingAnchor = wheelPendingAnchorRef.current ?? undefined;
      wheelPendingScaleRef.current = null;
      wheelPendingAnchorRef.current = null;
      adjustLightboxScale(pendingScale, pendingAnchor);
    });
  };

  const updateLightboxBaseSize = (image: HTMLImageElement) => {
    const maxWidth = Math.min(window.innerWidth * 0.96, 1800);
    const maxHeight = Math.max(window.innerHeight - 144, 240);
    const widthRatio = maxWidth / image.naturalWidth;
    const heightRatio = maxHeight / image.naturalHeight;
    const fitRatio = Math.min(widthRatio, heightRatio, 1);

    const nextBaseSize = {
      width: Math.round(image.naturalWidth * fitRatio),
      height: Math.round(image.naturalHeight * fitRatio)
    };

    setLightboxBaseSize(nextBaseSize);

    if (lightboxScaleRef.current <= 1.01) {
      setLightboxPanState({ x: 0, y: 0 }, 1, nextBaseSize);
      return;
    }

    setLightboxPanState(lightboxPanRef.current, lightboxScaleRef.current, nextBaseSize);
  };

  useEffect(() => {
    if (!lightboxImage || !lightboxImageRef.current) {
      return;
    }

    const handleResize = () => {
      if (!lightboxImageRef.current?.complete) {
        return;
      }

      updateLightboxBaseSize(lightboxImageRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [lightboxImage]);

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
    setSelectedAlbumFolder(null);
    setSelectedAlbum(null);
    setLightboxImage(null);
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();

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
                  Support students, teachers, and the wider SJBHS community through a clear U.S. giving route, and stay
                  connected through the next major North America alumni gathering.
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
                  onClick={() => openLightboxImage(connectMoments[0])}
                >
                  <img src={connectMoments[0].src} alt="" />
                </button>
                <div className="media-stack">
                  <button
                    className="photo-button media-tile media-tile-small"
                    type="button"
                    onClick={() => openLightboxImage(connectMoments[1])}
                  >
                    <img src={connectMoments[1].src} alt="" />
                  </button>
                  <button
                    className="photo-button media-tile media-tile-small"
                    type="button"
                    onClick={() => openLightboxImage(connectMoments[2])}
                  >
                    <img src={connectMoments[2].src} alt="" />
                  </button>
                </div>
              </div>
            </section>

            <section id="overview-panel" className="overview-shell" role="tabpanel" aria-label="Overview">
              <div className="featured-heading priority-heading">
                <div>
                  <h3>Three clear paths make it easy to act.</h3>
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
                    <h3>Additional pages can keep supporting the story as the core experience grows.</h3>
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
                  <h3>Every path on the site leads back to the school and its people.</h3>
                  <p>
                    Giving channels support where funds go, the U.S. donation routes explain how support is processed,
                    and North America Connect 2026 brings alumni and families together around a shared purpose.
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
                <h3>Choose where your support goes</h3>
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
                <h3>Choose how you want to give</h3>
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
                <h3>Talk to the team</h3>
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
                  <h3>Sponsorship options are already defined and ready to discuss.</h3>
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
                  <h3>The sponsor packet is available here for quick review and sharing.</h3>
                </div>
              </div>

              <div className="featured-photo-strip sponsor-material-grid">
                {sponsorMaterials.map((material) => (
                  <button
                    className="featured-photo sponsor-material"
                    key={material.src}
                    type="button"
                    onClick={() => openLightboxImage(material)}
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
                  <h3>Tickets, venue details, and the weekend schedule will follow here.</h3>
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
                  <h3>Browse past events by theme, then open a set to view the photos.</h3>
                </div>
              </div>

              <div className="folder-grid album-folder-grid" aria-label="Album folders">
                {groupedEventAlbums.map((folder) => (
                  <button
                    className="folder-card"
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedAlbum(null);
                      setSelectedAlbumFolder(folder);
                    }}
                  >
                    <div className="folder-card-thumb">
                      <img src={folder.albums[0]?.cover.src} alt={folder.albums[0]?.cover.alt ?? folder.title} />
                    </div>

                    <div className="folder-card-copy">
                      <span>{folder.title}</span>
                      <h3>{folder.title}</h3>
                      <p>{folder.albums.length} event sets</p>
                    </div>
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
                    ? "The inquiry service is ready to collect questions about causes, donations, sponsorships, and alumni coordination."
                    : "The form is visible for review, but the connected service is not currently responding."}
                </p>
              </aside>
            </div>

            <div className="contact-panel">
              <div className="contact-sidebar">
                <article className="contact-card">
                  <h3>Donation, sponsorship, and alumni contacts</h3>
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
                  <h3>Tell the team how you would like to get involved.</h3>
                  <p>
                    Use this form for cause support, U.S. donations, sponsorship enquiries, chapter coordination, or
                    general alumni questions.
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
                      placeholder="Share context, timing, the cause you want to support, or any sponsorship requirements."
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
          <span>Support the school, stay connected as alumni, and help build North America Connect 2026.</span>
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

      {selectedAlbumFolder ? (
        <div
          className="album-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="album-dialog-title"
          onClick={() => {
            setSelectedAlbum(null);
            setSelectedAlbumFolder(null);
          }}
        >
          <div className="album-dialog-shell" onClick={(event) => event.stopPropagation()}>
            <button
              className="lightbox-close album-dialog-close"
              type="button"
              onClick={() => {
                setSelectedAlbum(null);
                setSelectedAlbumFolder(null);
              }}
            >
              Close
            </button>

            <div className="album-dialog-header">
              <div>
                {selectedAlbum ? (
                  <>
                    <button className="inline-button album-breadcrumb" type="button" onClick={() => setSelectedAlbum(null)}>
                      Back to {selectedAlbumFolder.title}
                    </button>
                    <span className="support-note">{selectedAlbum.label}</span>
                    <h3 id="album-dialog-title">{selectedAlbum.title}</h3>
                    <p>{selectedAlbum.summary}</p>
                  </>
                ) : (
                  <>
                    <span className="support-note">Events</span>
                    <h3 id="album-dialog-title">{selectedAlbumFolder.title}</h3>
                    <p>{selectedAlbumFolder.description}</p>
                  </>
                )}
              </div>
            </div>

            {selectedAlbum ? (
              <div className="folder-photo-grid album-photo-grid">
                {selectedAlbum.photos.map((photo) => (
                      <button
                        className="folder-photo"
                        key={photo.src}
                        type="button"
                        onClick={() => openLightboxImage(photo)}
                      >
                        <img src={photo.src} alt={photo.alt} />
                        <span>{photo.caption}</span>
                      </button>
                ))}
              </div>
            ) : (
              <div className="folder-grid album-subfolder-grid" aria-label={`${selectedAlbumFolder.title} subfolders`}>
                {selectedAlbumFolder.albums.map((album) => (
                  <button className="folder-card" key={album.title} type="button" onClick={() => setSelectedAlbum(album)}>
                    <div className="folder-card-thumb">
                      <img src={album.cover.src} alt={album.cover.alt} />
                    </div>

                    <div className="folder-card-copy">
                      <span>{album.label}</span>
                      <h3>{album.title}</h3>
                      <p>{album.photos.length} photos</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {lightboxImage ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.caption}
          onClick={closeLightbox}
        >
          <div className="lightbox-shell" onClick={closeLightbox}>
            <div className="lightbox-topbar">
              <button
                className={`lightbox-zoom${lightboxZoomed ? " is-active" : ""}`}
                type="button"
                aria-label={lightboxZoomed ? "Return image to fit view" : "Enable image zoom"}
                aria-pressed={lightboxZoomed}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLightboxZoom();
                }}
              >
                <span className="lightbox-zoom-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="10.5" cy="10.5" r="5.5" />
                    <path d="M15 15l5 5" />
                    {lightboxZoomed ? <path d="M8 10.5h5" /> : <path d="M10.5 8v5M8 10.5h5" />}
                  </svg>
                </span>
                <span>{lightboxZoomed ? "Fit" : "Zoom"}</span>
              </button>
              <button
                className="lightbox-close"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
              >
                Close
              </button>
            </div>
            <div
              ref={lightboxMediaRef}
              className={`lightbox-media${lightboxZoomed ? " is-zoomed" : ""}`}
              onWheel={(event) => {
                if (event.ctrlKey) {
                  event.preventDefault();
                  setLightboxWheeling(true);

                  if (wheelStopTimeoutRef.current !== null) {
                    window.clearTimeout(wheelStopTimeoutRef.current);
                  }

                  wheelStopTimeoutRef.current = window.setTimeout(() => {
                    setLightboxWheeling(false);
                    wheelStopTimeoutRef.current = null;
                  }, 80);

                  const deltaMultiplier = event.deltaMode === 1 ? 15 : event.deltaMode === 2 ? window.innerHeight : 1;
                  const rawDelta = event.deltaY * deltaMultiplier;
                  const normalizedDelta = Math.max(-44, Math.min(44, rawDelta));
                  const zoomFactor = Math.exp(-normalizedDelta * 0.00108);
                  const nextScale = lightboxScaleRef.current * zoomFactor;

                  scheduleWheelScale(nextScale, { clientX: event.clientX, clientY: event.clientY });
                  return;
                }

                if (!lightboxZoomed) {
                  return;
                }

                event.preventDefault();
                setLightboxPanState(
                  {
                    x: lightboxPanRef.current.x - event.deltaX * 1.8,
                    y: lightboxPanRef.current.y - event.deltaY * 1.8
                  },
                  lightboxScaleRef.current
                );
              }}
              onTouchStart={(event) => {
                if (!lightboxZoomed || event.touches.length !== 2) {
                  return;
                }

                setLightboxPinching(true);
                pinchMovedRef.current = false;
                const [firstTouch, secondTouch] = Array.from(event.touches);
                pinchDistanceRef.current = Math.hypot(
                  secondTouch.clientX - firstTouch.clientX,
                  secondTouch.clientY - firstTouch.clientY
                );
                pinchScaleRef.current = lightboxScale;
              }}
              onTouchMove={(event) => {
                if (!lightboxZoomed || event.touches.length !== 2 || pinchDistanceRef.current === null) {
                  return;
                }

                event.preventDefault();
                const [firstTouch, secondTouch] = Array.from(event.touches);
                const nextDistance = Math.hypot(
                  secondTouch.clientX - firstTouch.clientX,
                  secondTouch.clientY - firstTouch.clientY
                );

                const distanceRatio = nextDistance / pinchDistanceRef.current;
                const pinchCenterX = (firstTouch.clientX + secondTouch.clientX) / 2;
                const pinchCenterY = (firstTouch.clientY + secondTouch.clientY) / 2;
                const dampedRatio = Math.pow(distanceRatio, 0.82);
                pinchMovedRef.current = true;
                schedulePinchScale(pinchScaleRef.current * dampedRatio, {
                  clientX: pinchCenterX,
                  clientY: pinchCenterY
                });
              }}
              onTouchEnd={() => {
                if (pinchDistanceRef.current === null) {
                  return;
                }

                pinchDistanceRef.current = null;
                pinchScaleRef.current = lightboxScale;
                setLightboxPinching(false);
                window.setTimeout(() => {
                  pinchMovedRef.current = false;
                }, 160);
              }}
              onTouchCancel={() => {
                pinchDistanceRef.current = null;
                setLightboxPinching(false);
                pinchPendingScaleRef.current = null;
                pinchPendingAnchorRef.current = null;

                if (pinchFrameRef.current !== null) {
                  window.cancelAnimationFrame(pinchFrameRef.current);
                  pinchFrameRef.current = null;
                }

                window.setTimeout(() => {
                  pinchMovedRef.current = false;
                }, 160);
              }}
            >
              <div
                ref={lightboxFrameRef}
                className="lightbox-stage"
                style={
                  lightboxBaseSize
                    ? {
                        width: `${lightboxBaseSize.width}px`,
                        height: `${lightboxBaseSize.height}px`
                      }
                    : undefined
                }
              >
                <img
                  ref={lightboxImageRef}
                  className={[
                    lightboxZoomed ? "is-zoomed" : "",
                    lightboxDragging ? "is-dragging" : "",
                    lightboxPinching ? "is-pinching" : "",
                    lightboxWheeling ? "is-wheeling" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  src={lightboxImage.src}
                  alt={lightboxImage.alt}
                  draggable={false}
                  style={
                    lightboxBaseSize
                      ? {
                          width: `${lightboxBaseSize.width}px`,
                          height: `${lightboxBaseSize.height}px`,
                          transform: `translate3d(${lightboxPan.x}px, ${lightboxPan.y}px, 0) scale(${lightboxScale})`
                        }
                      : undefined
                  }
                  onLoad={(event) => updateLightboxBaseSize(event.currentTarget)}
                  onDragStart={(event) => event.preventDefault()}
                  onPointerDown={(event) => {
                    if (!lightboxZoomed || event.pointerType === "touch" || !lightboxMediaRef.current) {
                      return;
                    }

                    if (event.pointerType === "mouse" && event.button !== 0) {
                      return;
                    }

                    event.stopPropagation();
                    dragMovedRef.current = false;
                    lightboxDragRef.current = {
                      active: true,
                      pointerId: event.pointerId,
                      startX: event.clientX,
                      startY: event.clientY,
                      startPanX: lightboxPanRef.current.x,
                      startPanY: lightboxPanRef.current.y
                    };
                    setLightboxDragging(true);
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (
                      !lightboxZoomed ||
                      event.pointerType === "touch" ||
                      !lightboxMediaRef.current ||
                      !lightboxDragRef.current.active ||
                      lightboxDragRef.current.pointerId !== event.pointerId
                    ) {
                      return;
                    }

                    event.stopPropagation();
                    const deltaX = event.clientX - lightboxDragRef.current.startX;
                    const deltaY = event.clientY - lightboxDragRef.current.startY;

                    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                      dragMovedRef.current = true;
                    }

                    setLightboxPanState(
                      {
                        x: lightboxDragRef.current.startPanX + deltaX,
                        y: lightboxDragRef.current.startPanY + deltaY
                      },
                      lightboxScaleRef.current
                    );
                  }}
                  onPointerUp={(event) => {
                    if (lightboxDragRef.current.pointerId !== event.pointerId) {
                      return;
                    }

                    event.stopPropagation();

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }

                    stopLightboxDrag();
                  }}
                  onPointerCancel={(event) => {
                    if (lightboxDragRef.current.pointerId !== event.pointerId) {
                      return;
                    }

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }

                    stopLightboxDrag();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();

                    if (pinchMovedRef.current || dragMovedRef.current) {
                      return;
                    }

                    toggleLightboxZoom({ clientX: event.clientX, clientY: event.clientY });
                  }}
                />
              </div>
            </div>
            <p>{lightboxImage.caption}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
