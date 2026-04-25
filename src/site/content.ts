import {
  AlbumFolder,
  CauseCard,
  ContactChannel,
  ConnectPageContent,
  EventAlbum,
  EventHighlight,
  GalleryImage,
  HouseShield,
  InquiryForm,
  PriorityCard,
  SecondaryPage,
  SponsorTier,
  TabConfig
} from "./types";

const albumAssetVersion = "2026-04-15-1";
const defaultConnectSponsorMessage =
  "We are seeking sponsors for our North America Connect reunion, your brand/business will have the opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will fund the OBA Teachers Insurance program. Individual and batch benefactors are also warmly welcome.";

const withAlbumAssetVersion = (image: GalleryImage): GalleryImage =>
  image.src.startsWith("/assets/albums/")
    ? {
        ...image,
        src: `${image.src}?v=${albumAssetVersion}`
      }
    : image;

export const tabs: TabConfig[] = [
  {
    id: "home",
    label: "Home",
    kicker: "JAANA",
    title: "Support the school, strengthen the alumni network, and help shape North America Connect 2026.",
    copy:
      "This site brings together the most important ways to stay involved: give from the United States, support or attend North America Connect 2026, and reach the team directly."
  },
  {
    id: "causes",
    label: "Causes",
    kicker: "Causes",
    title: "Choose the causes JAANA can support for St. Joseph's Boys' High School.",
    copy:
      ""
  },
  {
    id: "donate",
    label: "Donate",
    kicker: "Donate",
    title: "Donate to JAANA, SJBHS-OBA, BJES",
    copy: "Support JAANA, SJBHS-OBA, and BJES through the donation routes on this page."
  },
  {
    id: "connect",
    label: "North America Connect 2026",
    kicker: "North America Connect 2026",
    title: "North America Connect 2026 is the next major alumni gathering across North America.",
    copy:
      "Save the date for the September 2026 reunion weekend, review sponsor information, and browse event albums from across the OBA community."
  },
  {
    id: "contact",
    label: "Contact Us",
    kicker: "Contact Us",
    title: "Contact JAANA",
    copy: "Use this page for donation questions, sponsorship inquiries, alumni coordination, and general outreach."
  }
];

export const impactStats = [
  { value: "6", label: "priority causes open for support" },
  { value: "Live", label: "Zeffy donation form opens in a pop-up" },
  { value: "Sept 19-20, 2026", label: "North America Connect weekend near Washington, D.C." }
];

export const priorityCards: PriorityCard[] = [
  {
    title: "Causes",
    body:
      "Review the school causes currently open for support, compare their scope, and choose the impact area that matters most to you.",
    points: [
      "Student Scholarships",
      "Teachers Insurance Program",
      "Mid-Day Meal Program",
      "Student Awards Program",
      "School Infrastructure Development",
      "Other Jesuit causes"
    ],
    cta: "Open Causes page",
    tab: "causes"
  },
  {
    title: "Donate",
    body: "Open the Donate page to review giving routes and launch the secure Zeffy donation flow.",
    points: [
      "Endowment, grant, matching, and small-gift routes",
      "Cause-based donation support",
      "Secure Zeffy checkout for supported routes",
      "A separate Contact Us page for inquiries"
    ],
    cta: "Open Donate page",
    tab: "donate"
  },
  {
    title: "North America Connect 2026",
    body:
      "North America Connect 2026 is the next major gathering point for alumni and families across North America, with sponsorship opportunities already open.",
    points: [
      "Washington, D.C. metro area",
      "Saturday Dinner and Sunday Picnic Lunch",
      "100+ in-person attendees and 300+ online reach",
      "Call to Sponsors document and contacts"
    ],
    cta: "Open North America Connect 2026",
    tab: "connect"
  }
];

export const causeCards: CauseCard[] = [
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

export const sponsorHighlights: EventHighlight[] = [
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

export const sponsorTiers: SponsorTier[] = [
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

export const connectMoments: GalleryImage[] = [
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

export const groupedEventAlbums: AlbumFolder[] = albumCategories.map((category) => ({
  ...category,
  albums: eventAlbums.filter((album) => album.category === category.id)
}));

export const sponsorMaterials: GalleryImage[] = [
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

export const connectPlaceholders: SecondaryPage[] = [
  {
    title: "Registration",
    body: "Details coming soon."
  },
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

export const defaultConnectPageContent: ConnectPageContent = {
  sponsorMessage: defaultConnectSponsorMessage,
  placeholders: connectPlaceholders
};

export const secondaryPages: SecondaryPage[] = [
  {
    title: "About Us",
    body: "A concise introduction to JAANA, the school, and the wider mission can expand here over time."
  },
  {
    title: "Gallery and previous reunions",
    body: "Past reunions and photo archives can continue to support the story of the community without competing with current priorities."
  },
  {
    title: "Mentor, Volunteer, Statements, and External Sites",
    body: "These areas can be developed next as the giving experience and North America Connect 2026 campaign continue to mature."
  }
];

export const houseShields: HouseShield[] = [
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

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    value: "jaanagroup@gmail.com",
    href: "mailto:jaanagroup@gmail.com"
  },
  {
    label: "Finance Team",
    value: "jaanafinance@gmail.com",
    href: "mailto:jaanafinance@gmail.com"
  },
  {
    label: "WhatsApp",
    value: "WhatsApp Group",
    href: "https://chat.whatsapp.com/C7vOhDVI2sw4HIMC5W2n9P"
  },
  {
    label: "LinkedIn",
    value: "JAANA Group",
    href: "https://www.linkedin.com/groups/8288101/"
  }
];

export const inquiryTopics = [
  "Support a cause",
  "Donate from the USA",
  "Create a named endowment",
  "Corporate matching eligibility",
  "Sponsor North America Connect 2026",
  "General alumni question"
];

export const initialForm: InquiryForm = {
  name: "",
  email: "",
  organization: "",
  interest: "",
  notes: "",
  recipientGroup: "general"
};
