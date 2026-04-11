import { FormEvent, startTransition, useEffect, useState } from "react";

type InquiryForm = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
};

type ReunionEvent = {
  city: string;
  date: string;
  time: string;
  location: string;
  livestream?: string;
  rsvp: string;
};

type TierRow = {
  benefit: string;
  bronze: string;
  silver: string;
  gold: string;
};

const reunionEvents: ReunionEvent[] = [
  {
    city: "Washington, D.C.",
    date: "May 7th, 2024",
    time: "18:00",
    location: "Alpha Omega Integration, Floor 2, 8150 Leesburg Pike #1010, Vienna, VA 22182",
    livestream: "https://bit.ly/JAANA-DC-reunion-livestream",
    rsvp: "https://bit.ly/RSVP-JAANA-reunion-WashingtonDC"
  },
  {
    city: "Bay Area",
    date: "May 11th, 2024",
    time: "12:00",
    location: "Sukoon Restaurant, 3701 E El Camino Real, Santa Clara, CA 95051",
    rsvp: "https://bit.ly/RSVP-JAANA-reunion-BayArea"
  },
  {
    city: "New York",
    date: "May 17th, 2024",
    time: "18:00",
    location: "Carla, 331 W 51st St, Ground Fl, New York 10019",
    rsvp: "https://bit.ly/RSVP-JAANA-reunion-NewYork"
  }
];

const partnershipBenefits = [
  "Direct access to 100+ in-person Josephite alumni and 300+ online members across the U.S. social network.",
  "Multi-day visibility across the Saturday dinner and Sunday picnic lunch.",
  "Extended brand life through post-event digital photo albums and social media recaps.",
  "Charitable impact through support of the SJBHS OBA Teachers Insurance Fund covering 540 lives.",
  "Potential tax deduction pathways through LearnForLife Foundation in the U.S. and SJBHS-OBA-BJES in India.",
  "Opportunities for sustained exposure through long-term listings, advertising, and partnership placements."
];

const tierRows: TierRow[] = [
  {
    benefit: "Brochure Listing",
    bronze: "Text only",
    silver: "1/2 page ad",
    gold: "Full page ad with QR code option"
  },
  {
    benefit: "Digital Brochure",
    bronze: "Text only",
    silver: "1/2 page ad",
    gold: "Full page ad with hyperlinks to business"
  },
  {
    benefit: "Social Media / Whatsapp / LinkedIn",
    bronze: "Group post",
    silver: "Individual post",
    gold: "Feature story or video"
  },
  {
    benefit: "Venue Signage",
    bronze: "Listed in rolling presentation",
    silver: "Logo in rolling presentation + banner",
    gold: "Silver + individual table or sponsor zone"
  },
  {
    benefit: "Event Shoutout",
    bronze: "-",
    silver: "-",
    gold: "Podium recognition + 2 minute elevator pitch"
  },
  {
    benefit: "Post Event",
    bronze: "Tagged in thank you / recap / album",
    silver: "Tagged in thank you / recap / album",
    gold: "Tagged in thank you / recap / album"
  },
  {
    benefit: "Tickets Included",
    bronze: "-",
    silver: "1 ticket",
    gold: "2 tickets"
  }
];

const addOnOptions = [
  "Non-compete option for industry exclusivity.",
  "Photobooth sponsor with logo on physical and digital photos.",
  "Music or DJ sponsor with branding near the station and DJ/MC mentions.",
  "Swag bag sponsor with logo placement on participant bags.",
  "Cocktail bar sponsor with logo on napkins or a signature named cocktail.",
  "Dinner sponsor with logo placement and dinner callout.",
  "Games and picnic sponsor for prizes and activity branding."
];

const sponsorSignals = [
  "Bronze, Silver, and Gold sponsorship tiers",
  "Visibility across dinner, picnic, and digital recaps",
  "Meaningful reach into the Josephite alumni network"
];

const contacts = [
  { name: "Nikhil", email: "nikhil.mascarenhas@gmail.com" },
  { name: "Anagha", email: "anagha.todalbagi@gmail.com" },
  { name: "Vishal", email: "vcurrie@gmail.com" }
];

const heritageHighlights = [
  {
    title: "Brotherhood across generations",
    description:
      "JAANA exists to keep Josephites connected across cities, industries, and age groups while preserving the character of the school community."
  },
  {
    title: "A gathering with purpose",
    description:
      "North America Connect is not only a reunion. It is a school-centered gathering that supports teachers, staff, families, and long-term alumni engagement."
  },
  {
    title: "A more dignified presentation",
    description:
      "This version keeps the official JAANA materials visible, but frames them with clearer hierarchy, calmer spacing, and a more classic alumni aesthetic."
  }
];

const connectMoments = [
  {
    label: "Saturday evening",
    title: "Dinner and fellowship",
    description:
      "A setting for alumni, sponsors, and families to reconnect in person with room for conversation, recognition, and community visibility."
  },
  {
    label: "Sunday gathering",
    title: "Picnic and families",
    description:
      "A more relaxed intergenerational format that brings families into the celebration and widens the circle beyond a formal event night."
  },
  {
    label: "School impact",
    title: "Support beyond the weekend",
    description:
      "Proceeds support the SJBHS OBA Teachers Insurance Fund and reinforce a culture of giving back through alumni action."
  }
];

const initialForm: InquiryForm = {
  name: "",
  email: "",
  organization: "",
  interest: "",
  notes: ""
};

function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [inquiryCount, setInquiryCount] = useState<number | null>(null);
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [healthResponse, statsResponse] = await Promise.all([
          fetch("/api/health"),
          fetch("/api/inquiries/stats")
        ]);

        if (!healthResponse.ok || !statsResponse.ok) {
          throw new Error("Unable to load site data.");
        }

        const [{ status }, { total }] = await Promise.all([
          healthResponse.json() as Promise<{ status: string }>,
          statsResponse.json() as Promise<{ total: number }>
        ]);

        startTransition(() => {
          setBackendOnline(status === "ok");
          setInquiryCount(total);
        });
      } catch {
        startTransition(() => {
          setBackendOnline(false);
          setInquiryCount(null);
        });
      }
    };

    void loadSiteData();
  }, []);

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

      const payload = (await response.json()) as { message?: string; total?: number; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setForm(initialForm);
      setStatusTone("success");
      setStatusMessage(payload.message ?? "Thanks for reaching out.");
      setInquiryCount(payload.total ?? inquiryCount);
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="site-brand" href="#top" aria-label="JAANA Home">
            <img className="brand-logo" src="/assets/jaana-logo-blue.png" alt="JAANA logo" />
          </a>

          <nav className="site-nav" aria-label="Primary">
            <a href="#connect">Connect 2026</a>
            <a href="#reunions">Reunions 2024</a>
            <a href="#school">School</a>
            <a href="#sponsors">Sponsors</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section id="connect" className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow">Save the Date</span>
              <span className={`status-pill ${backendOnline ? "online" : "offline"}`}>
                {backendOnline ? "Server live" : "Server offline"}
              </span>
            </div>

            <p className="hero-overline">Josephite Alumni Association of North America</p>
            <h1>North America Connect</h1>
            <p className="hero-date">September 19-20, 2026</p>
            <p className="hero-location">Washington DC | Northern Virginia</p>

            <p className="hero-lead">
              The Josephite Alumni Association of North America invites sponsors and alumni families to a two-day
              gathering in the Washington D.C. metro area. The event is designed for in-person connection, school
              support, and long-term community building across North America.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="/docs/call-for-sponsors.pdf" target="_blank" rel="noreferrer">
                Open sponsor deck
              </a>
              <a className="secondary-button" href="#contact">
                Sponsor inquiry
              </a>
            </div>

            <div className="stat-grid">
              <article>
                <strong>100+</strong>
                <span>Expected in-person alumni and families</span>
              </article>
              <article>
                <strong>300+</strong>
                <span>Additional online reach across U.S. channels</span>
              </article>
              <article>
                <strong>540</strong>
                <span>Lives supported through the Teachers Insurance Fund</span>
              </article>
            </div>

            <div className="heritage-note">
              <img src="/assets/jaana-crest.png" alt="JAANA crest" />
              <div>
                <span>Josephite Alumni Association of North America</span>
                <strong>A school alumni body rooted in fraternity, service, and memory.</strong>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="poster-spotlight-card">
              <div className="card-label">
                <img src="/assets/jaana-crest.png" alt="" />
                <span>Official reunion poster</span>
              </div>
              <img src="/assets/reunion-2024-poster.jpeg" alt="North American Reunions 2024 poster" />
            </div>

            <div className="hero-side-panel">
              <div className="sponsor-summary-card">
                <span className="mini-eyebrow">Sponsor partnership</span>
                <h3>Support the weekend without crowding the message.</h3>
                <p>
                  The sponsor story belongs here, but it should read as measured and credible. The full deck stays
                  accessible while the first screen stays calm and readable.
                </p>

                <ul className="signal-list">
                  {sponsorSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>

                <a className="inline-link" href="/docs/call-for-sponsors.pdf" target="_blank" rel="noreferrer">
                  View the complete sponsor deck
                </a>
              </div>

              <div className="crest-story-card">
                <img src="/assets/jaana-crest.png" alt="" />
                <div>
                  <span className="mini-eyebrow">School identity</span>
                  <h3>Simple, formal, and rooted in alumni tradition.</h3>
                  <p>
                    The page now gives the crest, poster, and school references space to stand on their own instead of
                    compressing everything into one crowded hero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section heritage-section">
          <div className="section-heading narrow">
            <span className="section-kicker">An alumni institution</span>
            <h2>Classier, but still recognizably a school community website.</h2>
            <p>
              The tone here is intentionally more polished without losing the warmth of a school reunion page. The
              focus stays on community, school ties, and the dignity of official alumni communication.
            </p>
          </div>

          <div className="heritage-grid">
            {heritageHighlights.map((item) => (
              <article className="heritage-card" key={item.title}>
                <img src="/assets/jaana-crest.png" alt="" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reunions" className="content-section light-section">
          <div className="section-heading">
            <span className="section-kicker">Official reunion graphic</span>
            <h2>North American Reunions 2024</h2>
            <p>
              The archived JAANA site centered this poster and the related reunion schedule. The updated build keeps
              the official visual intact and re-presents the information with cleaner spacing and better readability.
            </p>
          </div>

          <div className="poster-layout">
            <div className="poster-frame">
              <img src="/assets/reunion-2024-poster.jpeg" alt="North American Reunions 2024 official poster" />
            </div>

            <div className="poster-copy">
              <div className="copy-card">
                <h3>Invitation</h3>
                <p>
                  St. Joseph&apos;s OBA and JAANA invited Josephites across North America to join one or more of the
                  2024 reunions hosting Fr Sunil Fernandes, Fr Manoj D&apos;Souza, and Fr Brian Pereira.
                </p>
                <p>Looking forward to celebrating the Jesuits and our school.</p>
              </div>

              <div className="copy-card">
                <h3>Why these reunions mattered</h3>
                <p>
                  The reunion schedule was built around hospitality, school identity, and the joy of seeing Josephites
                  gather in person. The page now presents that spirit with better pacing and a stronger sense of
                  institutional character.
                </p>
              </div>
            </div>
          </div>

          <div className="event-grid">
            {reunionEvents.map((event) => (
              <article className="event-card" key={event.city}>
                <p className="event-city">{event.city}</p>
                <h3>
                  {event.date} at {event.time}
                </h3>
                <p>{event.location}</p>

                <div className="event-links">
                  {event.livestream ? (
                    <a href={event.livestream} target="_blank" rel="noreferrer">
                      Livestream
                    </a>
                  ) : null}
                  <a href={event.rsvp} target="_blank" rel="noreferrer">
                    RSVP
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section connect-section">
          <div className="connect-shell">
            <div className="connect-copy">
              <span className="section-kicker">What the weekend represents</span>
              <h2>North America Connect is part reunion, part fundraiser, part alumni homecoming.</h2>
              <p>
                A stronger alumni website should feel anchored in school memory while still serving real event needs.
                These moments reflect the shape of the weekend and the reason sponsors matter.
              </p>
            </div>

            <div className="connect-grid">
              {connectMoments.map((moment) => (
                <article className="connect-card" key={moment.title}>
                  <span>{moment.label}</span>
                  <h3>{moment.title}</h3>
                  <p>{moment.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="school" className="school-section">
          <div className="school-image-frame">
            <img src="/assets/sjbhs-main-banner.jpg" alt="St. Joseph's Boys High School banner" />
          </div>

          <div className="school-quote">
            <p>Go forth and set the world on fire.</p>
            <p>He who goes about to reform the world must begin with himself,</p>
            <p>
              or he loses his labor. <strong>- St. Ignatius of Loyola</strong>
            </p>
          </div>
        </section>

        <section id="sponsors" className="content-section sponsor-section">
          <div className="section-heading narrow">
            <span className="section-kicker">Sponsorship opportunity</span>
            <h2>Call For Sponsors - North America Connect</h2>
            <p>
              Sponsorship offers direct access to a high-trust alumni audience in North America and India, spanning
              business leaders, families, and professionals who actively support SJBHS and associated charitable
              efforts.
            </p>
          </div>

          <div className="benefit-panel">
            <div className="benefit-copy">
              <h3>Key benefits of partnership</h3>
              <ul className="benefit-list">
                {partnershipBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="deck-preview-grid">
              <img src="/assets/call-for-sponsors-1.png" alt="Call for Sponsors overview page" />
              <img src="/assets/call-for-sponsors-2.png" alt="Detailed sponsorship tier benefits" />
            </div>
          </div>

          <div className="tier-banner">
            <article>
              <span>Bronze</span>
              <strong>Starting at $500</strong>
            </article>
            <article>
              <span>Silver</span>
              <strong>Starting at $1,000</strong>
            </article>
            <article>
              <span>Gold</span>
              <strong>Starting at $1,500</strong>
            </article>
          </div>

          <div className="table-card">
            <table className="benefit-table">
              <thead>
                <tr>
                  <th>Benefit</th>
                  <th>Bronze</th>
                  <th>Silver</th>
                  <th>Gold</th>
                </tr>
              </thead>
              <tbody>
                {tierRows.map((row) => (
                  <tr key={row.benefit}>
                    <td>{row.benefit}</td>
                    <td>{row.bronze}</td>
                    <td>{row.silver}</td>
                    <td>{row.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="addon-panel">
            <div>
              <h3>Premium add-on options</h3>
              <p>First come basis. Contact JAANA for pricing and availability.</p>
            </div>

            <ul className="addon-list">
              {addOnOptions.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="content-section contact-section">
          <div className="contact-copy">
            <span className="section-kicker">Contact JAANA</span>
            <h2>Sponsor or alumni inquiry</h2>
            <p>
              Use the live Node form below to register sponsor interest, request more details, or ask for follow-up on
              North America Connect. This replaces the placeholder generic form with something aligned to the actual
              site.
            </p>

            <div className="association-card">
              <img src="/assets/jaana-crest.png" alt="JAANA crest" />
              <div>
                <span>Heritage and administration</span>
                <strong>Built for alumni, families, and supporters of St. Joseph&apos;s Boys High School.</strong>
              </div>
            </div>

            <div className="contact-list">
              {contacts.map((contact) => (
                <a key={contact.email} href={`mailto:${contact.email}`}>
                  {contact.name}: {contact.email}
                </a>
              ))}
            </div>

            <div className="contact-metrics">
              <div>
                <span>Association</span>
                <strong>St. Joseph&apos;s Alumni Association of North America</strong>
              </div>
              <div>
                <span>VA State ID</span>
                <strong>11134048</strong>
              </div>
              <div>
                <span>Inquiries received</span>
                <strong>{inquiryCount ?? "Live when API is running"}</strong>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                name="name"
                placeholder="Your full name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>

            <label>
              Organization
              <input
                name="organization"
                placeholder="Business, alumni group, or family name"
                required
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
              />
            </label>

            <label>
              Interest
              <input
                name="interest"
                placeholder="Gold sponsor, brochure ad, general event question"
                required
                value={form.interest}
                onChange={(event) => setForm({ ...form, interest: event.target.value })}
              />
            </label>

            <label className="field-span-2">
              Notes
              <textarea
                name="notes"
                rows={4}
                placeholder="Tell JAANA what you are interested in."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </label>

            <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Send inquiry"}
            </button>

            {statusMessage ? (
              <p className={`form-status ${statusTone === "success" ? "success" : "error"}`}>{statusMessage}</p>
            ) : null}
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <p>St. Joseph&apos;s Alumni Association of North America (JAANA) | VA State ID: 11134048</p>
        <p>8150 Leesburg Pike #1010, Vienna VA 22182</p>
      </footer>
    </div>
  );
}

export default App;
