"use client";

import Image from "next/image";
import { getSession, signOut, useSession } from "next-auth/react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Accent = "blue" | "green" | "red" | "yellow";

type EventCard = {
  title: string;
  description: string;
  department: string;
  level: string;
  accent: Accent;
  icon: string;
  metaIcon: string;
  type?: "Workshop" | "Hackathon";
  prize?: string;
};

const departments: { name: string; accent: Accent; events: EventCard[] }[] = [
  {
    name: "UI/UX",
    accent: "blue",
    events: [
      {
        title: "Design, Break, Fix",
        description:
          "A deep dive into UI/UX Design methodologies for modern digital interfaces.",
        department: "UI/UX",
        level: "Beginner",
        accent: "blue",
        icon: "brush",
        metaIcon: "architecture",
      },
      {
        title: "The AI UI Sprint",
        description:
          "Rapid prototyping and designing innovative user interfaces using AI/Stitch.",
        department: "UI/UX",
        level: "Beginner",
        accent: "green",
        icon: "neurology",
        metaIcon: "bolt",
      },
    ],
  },
  {
    name: "Cybersecurity",
    accent: "red",
    events: [
      {
        title: "CyberForge",
        description:
          "Hands-on Security Lab environment exploring vulnerabilities and defenses.",
        department: "Cybersecurity",
        level: "Beginner",
        accent: "red",
        icon: "shield",
        metaIcon: "terminal",
      },
      {
        title: "CTF Challenge",
        description:
          "The ultimate race to hack and win. Capture the flag in a high-stakes environment.",
        department: "Cybersecurity",
        level: "Beginner",
        accent: "red",
        icon: "lock",
        metaIcon: "military_tech",
      },
    ],
  },
  {
    name: "Development",
    accent: "blue",
    events: [
      {
        title: "Build a Full-Stack Web App",
        description:
          "Build a robust end-to-end web application using React and Supabase.",
        department: "Development",
        level: "Beginner",
        accent: "blue",
        icon: "layers",
        metaIcon: "database",
      },
      {
        title: "Build Your Own Cryptocurrency",
        description:
          "Exploring Web3 foundations and creating a custom token with Solidity.",
        department: "Development",
        level: "Beginner",
        accent: "green",
        icon: "code",
        metaIcon: "link",
      },
    ],
  },
  {
    name: "Competitive Programming",
    accent: "yellow",
    events: [
      {
        title: "CP Challenge",
        description:
          "Master algorithms and data structures in this elite competitive programming arena.",
        department: "Competitive Programming",
        level: "Beginner",
        accent: "yellow",
        icon: "terminal",
        metaIcon: "psychology",
      },
      {
        title: "Debug & Code Challenge",
        description:
          "Race against the clock to find bugs and refactor code under intense pressure.",
        department: "Competitive Programming",
        level: "Beginner",
        accent: "yellow",
        icon: "data_object",
        metaIcon: "history_edu",
      },
    ],
  },
  {
    name: "AI/ML",
    accent: "green",
    events: [
      {
        title: "No-Code AI Automation",
        description:
          "Build a functional G-Mail priority classifier without writing a single line of code.",
        department: "AI/ML",
        level: "Beginner",
        accent: "yellow",
        icon: "smart_toy",
        metaIcon: "settings_input_component",
      },
      {
        title: "Wikirace.AI",
        description:
          "Mastering word embeddings and semantic search through a gamified Wiki race.",
        department: "AI/ML",
        level: "Beginner",
        accent: "red",
        icon: "language",
        metaIcon: "speed",
      },
    ],
  },
];

const hackathons: EventCard[] = [
  {
    title: "Hackathon Event TBD",
    description:
      "Coming Soon: A high-stakes innovation challenge. Stay tuned for more details on the upcoming grand competition.",
    department: "Hackathons",
    level: "Open",
    accent: "yellow",
    icon: "military_tech",
    metaIcon: "emoji_events",
    type: "Hackathon",
    prize: "Grand Prize: TBD",
  },
  {
    title: "Hackathon Event TBD",
    description:
      "Coming Soon: A high-stakes innovation challenge. Stay tuned for more details on the upcoming grand competition.",
    department: "Hackathons",
    level: "Open",
    accent: "yellow",
    icon: "bolt",
    metaIcon: "bolt",
    type: "Hackathon",
    prize: "Prize: Tech Rewards",
  },
];

const faqs = [
  {
    question: "Who can participate?",
    answer:
      "Anyone with a passion for learning and technology! Our events are open to all skill levels, from complete beginners to advanced developers.",
    accent: "blue" as const,
  },
  {
    question: "Is there a registration fee?",
    answer:
      "No, all our workshops and hackathons are completely free to attend. Just register and show up ready to learn!",
    accent: "green" as const,
  },
  {
    question: "Do I need a team for hackathons?",
    answer:
      "You can join with a pre-formed team or register solo. We host team-building sessions before hackathons to help you find teammates.",
    accent: "red" as const,
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and a collaborative mindset. We'll provide the rest, including food, drinks, and mentorship.",
    accent: "yellow" as const,
  },
];

function SymbolIcon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const paths: Record<string, ReactNode> = {
    account_circle: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" />
        <circle cx="12" cy="12" r="10" />
      </>
    ),
    architecture: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20 17 4" />
        <path d="M11 10h6v6" />
      </>
    ),
    bolt: <path d="M13 2 4 14h7l-1 8 10-13h-7V2z" />,
    brush: (
      <>
        <path d="M16 3 21 8 9 20H4v-5L16 3z" />
        <path d="M14 5 19 10" />
      </>
    ),
    close: (
      <>
        <path d="M6 6 18 18" />
        <path d="M18 6 6 18" />
      </>
    ),
    code: (
      <>
        <path d="m9 18-6-6 6-6" />
        <path d="m15 6 6 6-6 6" />
      </>
    ),
    data_object: (
      <>
        <path d="m8 7-4 5 4 5" />
        <path d="m16 7 4 5-4 5" />
        <path d="M12 5 10 19" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v12c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    ),
    emoji_events: (
      <>
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
        <path d="M8 6H5a3 3 0 0 0 3 4" />
        <path d="M16 6h3a3 3 0 0 1-3 4" />
        <path d="M12 12v5" />
        <path d="M8 21h8" />
      </>
    ),
    expand_more: <path d="m6 9 6 6 6-6" />,
    favorite: <path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2 4 4 0 0 1 9 2z" />,
    history_edu: (
      <>
        <path d="M5 4h11l3 3v13H5z" />
        <path d="M15 4v4h4" />
        <path d="M8 14h8" />
      </>
    ),
    joystick: (
      <>
        <rect x="5" y="12" width="14" height="8" />
        <path d="M12 12V4" />
        <circle cx="12" cy="4" r="2" />
        <path d="M8 16h2" />
        <path d="M15 16h1" />
      </>
    ),
    language: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3 3 15 0 18" />
        <path d="M12 3c-3 3-3 15 0 18" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    military_tech: (
      <>
        <path d="M8 3h8l-2 7h-4L8 3z" />
        <circle cx="12" cy="15" r="4" />
        <path d="m12 13 1 2 2 .5-1.5 1.5.4 2-1.9-1-1.9 1 .4-2L9 15.5l2-.5 1-2z" />
      </>
    ),
    neurology: (
      <>
        <path d="M8 6a4 4 0 0 1 8 0" />
        <path d="M6 10a5 5 0 0 1 12 0" />
        <path d="M8 18h8" />
        <path d="M9 10v8" />
        <path d="M15 10v8" />
      </>
    ),
    psychology: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4z" />
      </>
    ),
    settings_input_component: (
      <>
        <path d="M4 7h16" />
        <path d="M4 17h16" />
        <rect x="7" y="4" width="4" height="6" />
        <rect x="13" y="14" width="4" height="6" />
      </>
    ),
    shield: <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
    skull: (
      <>
        <path d="M6 14v-4a6 6 0 0 1 12 0v4l-3 4H9l-3-4z" />
        <circle cx="9" cy="11" r="1" />
        <circle cx="15" cy="11" r="1" />
      </>
    ),
    smart_toy: (
      <>
        <rect x="5" y="8" width="14" height="11" />
        <path d="M12 8V4" />
        <path d="M9 13h.01" />
        <path d="M15 13h.01" />
        <path d="M9 17h6" />
      </>
    ),
    speed: (
      <>
        <path d="M4 14a8 8 0 1 1 16 0" />
        <path d="M12 14 17 9" />
        <path d="M8 18h8" />
      </>
    ),
    terminal: (
      <>
        <path d="m5 7 5 5-5 5" />
        <path d="M12 17h7" />
      </>
    ),
    toll: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    videogame_asset: (
      <>
        <rect x="3" y="9" width="18" height="10" />
        <path d="M8 12v4" />
        <path d="M6 14h4" />
        <path d="M15 13h.01" />
        <path d="M18 15h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={`symbol-icon ${className}`}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeWidth="2"
      style={style}
      viewBox="0 0 24 24"
    >
      {paths[name] ?? paths.terminal}
    </svg>
  );
}

function EventTile({
  event,
  onSelect,
}: {
  event: EventCard;
  onSelect: (event: EventCard) => void;
}) {
  return (
    <button
      className={`event-card glow-${event.accent}`}
      onClick={() => onSelect(event)}
      type="button"
    >
      <span className="event-card__content">
        <span className="event-card__topline">
          <span className={`tag tag-${event.accent}`}>{event.type ?? "Workshop"}</span>
          <SymbolIcon className={`icon text-${event.accent}`} name={event.icon} />
        </span>
        <span className={`event-card__title text-${event.accent}`}>{event.title}</span>
        <span className="event-card__description">{event.description}</span>
      </span>
      <span className="event-card__footer">
        <span>Level: {event.level}</span>
        <SymbolIcon className={`icon text-${event.accent}`} name={event.metaIcon} />
      </span>
    </button>
  );
}

function HackathonTile({
  event,
  onSelect,
}: {
  event: EventCard;
  onSelect: (event: EventCard) => void;
}) {
  return (
    <button className="hack-card" onClick={() => onSelect(event)} type="button">
      <span className="ribbon">Special Event</span>
      <span className="hack-card__body">
        <span className="event-card__topline">
          <span className="tag tag-yellow">Hackathon</span>
          <SymbolIcon className="icon hack-icon text-yellow" name={event.icon} />
        </span>
        <span className="hack-card__title">{event.title}</span>
        <span className="hack-card__description">{event.description}</span>
      </span>
      <span className="hack-card__footer">
        <span>{event.prize}</span>
        <SymbolIcon className="icon hack-icon text-yellow" name={event.metaIcon} />
      </span>
    </button>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [interestStatus, setInterestStatus] = useState<"idle" | "loading" | "success">("idle");
  const [interestError, setInterestError] = useState("");
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [savedWorkshopNames, setSavedWorkshopNames] = useState<string[]>([]);
  const memberMenuRef = useRef<HTMLDivElement | null>(null);
  const modalAccent = selectedEvent?.accent ?? "blue";
  const currentWorkshopIsSaved = Boolean(
    selectedEvent && savedWorkshopNames.includes(selectedEvent.title),
  );

  function handleSelectEvent(event: EventCard) {
    setInterestStatus("idle");
    setInterestError("");
    setMobileModalOpen(false);
    setMobileNumber("");
    setSelectedEvent(event);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!memberMenuRef.current?.contains(event.target as Node)) {
        setMemberMenuOpen(false);
      }
    }

    if (memberMenuOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [memberMenuOpen]);

  useEffect(() => {
    async function loadSavedWorkshops() {
      if (!session?.user?.email) {
        setSavedWorkshopNames([]);
        return;
      }

      const response = await fetch("/api/interested", { method: "GET" });
      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || !contentType.includes("application/json")) {
        setSavedWorkshopNames([]);
        return;
      }

      const data = (await response.json()) as { workshopNames?: string[] };
      setSavedWorkshopNames(data.workshopNames ?? []);
    }

    void loadSavedWorkshops();
  }, [session?.user?.email]);

  useEffect(() => {
    async function handleAuthMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type !== "MIC_AUTH_COMPLETE") {
        return;
      }

      const updatedSession = await getSession();
      if (updatedSession?.user?.email) {
        if (selectedEvent) {
          void submitInterest(selectedEvent.title);
        }
      } else {
        setInterestError("Google sign-in did not complete. Please try again.");
      }
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [selectedEvent]);

  function handleInterestedClick() {
    setInterestError("");
    setInterestStatus("idle");

    if (session?.user?.email) {
      if (selectedEvent) {
        void submitInterest(selectedEvent.title);
      }
      return;
    }

    const callbackUrl = `${window.location.origin}/auth/popup-close`;
    const authUrl = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const popup = window.open(
      authUrl,
      "google-login",
      "width=520,height=680,menubar=no,toolbar=no,location=no,status=no",
    );

    if (!popup) {
      setInterestError("Please allow popups for this site to continue with Google login.");
    }
  }

  async function submitInterest(workshopName: string, mobileNumber?: string) {
    setInterestError("");
    setInterestStatus("loading");

    const response = await fetch("/api/interested", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobileNumber,
        workshopName,
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as {
          error?: string;
          requiresMobileNumber?: boolean;
        })
      : { error: "Could not save your interest. Please try again." };

    if (!response.ok) {
      setInterestStatus("idle");

      if (data.requiresMobileNumber) {
        setMobileModalOpen(true);
        return;
      }

      setInterestError(data.error ?? "Could not save your interest. Please try again.");
      return;
    }

    setInterestStatus("success");
    setMobileNumber("");
    setMobileModalOpen(false);
    setSavedWorkshopNames((currentNames) =>
      currentNames.includes(workshopName) ? currentNames : [...currentNames, workshopName],
    );
    setSelectedEvent(null);
  }

  async function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInterestError("");

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setInterestError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!selectedEvent) {
      setInterestError("Please choose a workshop first.");
      return;
    }

    await submitInterest(selectedEvent.title, mobileNumber);
  }

  return (
    <div className="arcade-page">
      <div className="stars-container" />
      <div className="neon-grid" />
      <div className="synth-sun" />
      <div className="floating-icons" aria-hidden="true">
        {[
          ["videogame_asset", "10%", "20%"],
          ["toll", "80%", "40%"],
          ["skull", "30%", "10%"],
          ["favorite", "70%", "70%"],
          ["joystick", "15%", "85%"],
        ].map(([icon, left, bottom]) => (
          <SymbolIcon
            className="retro-icon"
            key={icon}
            name={icon}
            style={{ left, bottom }}
          />
        ))}
      </div>
      <div className="scanline-overlay" />

      <header className="site-header">
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="brand" href="#top">
            <Image src="/stitch/mic-logo.png" alt="MIC Hexagon Logo" width={40} height={40} />
            <span>Microsoft Innovations Club</span>
          </a>
          <div className="nav-links">
            <a className="active" href="#workshops">
              Workshops
            </a>
            <a href="#hackathons">Hackathons</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <button
              className="arcade-btn"
              disabled
              title="Registration links are coming soon."
              type="button"
            >
              Register
            </button>
            <div
              className={`member-menu ${memberMenuOpen ? "open" : ""}`}
              ref={memberMenuRef}
            >
              <button
                aria-expanded={memberMenuOpen}
                aria-label="Member account information"
                className="member-menu__button"
                onClick={() => setMemberMenuOpen((open) => !open)}
                onFocus={() => setMemberMenuOpen(true)}
                type="button"
              >
                <SymbolIcon className="account-icon text-primary" name="account_circle" />
              </button>
              <div className="member-popover" role="status">
                <span className="member-popover__label">
                  {session?.user?.name ? "Logged in with Google" : "Welcome"}
                </span>
                <strong className="member-popover__name">
                  {session?.user?.name ?? "Welcome"}
                </strong>
                <span className="member-popover__hint">
                  {session?.user?.name
                    ? "Your workshop interest will save automatically."
                    : "Sign in with Google to save workshop interest automatically."}
                </span>
                {session?.user?.email ? (
                  <button
                    className="member-popover__logout"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    type="button"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="main-shell" id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-logo">
            <Image src="/stitch/mic-logo.png" alt="MIC Logo" width={96} height={96} priority />
          </div>
          <h1 id="hero-title">Level Up Your Skills</h1>
          <div className="hero-rule" />
          <p>Microsoft Innovations Club</p>
        </section>

        <div id="workshops">
          {departments.map((department) => (
            <section className="event-section" key={department.name}>
              <h2 className={`section-title text-${department.accent}`}>{department.name}</h2>
              <div className="event-grid">
                {department.events.map((event) => (
                  <EventTile event={event} key={event.title} onSelect={handleSelectEvent} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="event-section" id="hackathons">
          <h2 className="section-title text-blue">Hackathons</h2>
          <div className="hack-grid">
            {hackathons.map((event, index) => (
              <HackathonTile
                event={event}
                key={`${event.title}-${index}`}
                onSelect={handleSelectEvent}
              />
            ))}
          </div>
        </section>

        <section className="event-section faq-section" id="faq">
          <h2 className="section-title text-primary glow-title">FAQ</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div className="faq-item" key={faq.question}>
                  <button
                    aria-expanded={isOpen}
                    className={`faq-question glow-${faq.accent}`}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    <span className={`text-${faq.accent}`}>{faq.question}</span>
                    <SymbolIcon
                      className={`faq-icon text-${faq.accent} ${isOpen ? "open" : ""}`}
                      name="expand_more"
                    />
                  </button>
                  <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <Image
              className="footer-logo"
              src="/stitch/mic-logo.png"
              alt="MIC Logo"
              width={32}
              height={32}
            />
            <span>Microsoft Innovations Club</span>
          </div>
          <div className="footer-links">
            <a href="#top">Terms of Service</a>
            <a href="#top">Privacy Policy</a>
            <a href="#faq">Support</a>
          </div>
          <p>© 2026 MIC - Level Up Your Skills.</p>
        </div>
      </footer>

      {selectedEvent ? (
        <div
          aria-modal="true"
          className="modal-backdrop"
          onClick={() => setSelectedEvent(null)}
          role="dialog"
        >
          <div
            className={`modal-panel modal-panel--${modalAccent}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close event details"
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              type="button"
            >
              <SymbolIcon name="close" />
            </button>
            <span className={`tag tag-${modalAccent}`}>Event Details</span>
            <h2>{selectedEvent.title}</h2>
            <p>
              {selectedEvent.description} Join us for this high-intensity
              arcade-style session designed to propel your skills to the next
              level.
            </p>
            <div className="modal-stats">
              <div>
                <span>Status</span>
                <strong>Open</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{selectedEvent.type ?? "Workshop"}</strong>
              </div>
            </div>
            <div className="modal-actions">
                <button disabled={currentWorkshopIsSaved} onClick={handleInterestedClick} type="button">
                  {currentWorkshopIsSaved ? "Shown Interest" : "Interested"}
                </button>
              {/* TODO: Redirect users to specific external URLs based on the unique workshop they are viewing. */}
              <button disabled title="Registration links are coming soon." type="button">
                Register Now
              </button>
            </div>
            {interestError ? <p className="modal-error">{interestError}</p> : null}
            {interestStatus === "success" ? (
              <p className="modal-success">Interest saved successfully.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {mobileModalOpen ? (
        <div
          aria-modal="true"
          className="modal-backdrop"
          onClick={() => setMobileModalOpen(false)}
          role="dialog"
        >
          <form
            className={`modal-panel mobile-panel modal-panel--${modalAccent}`}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleMobileSubmit}
          >
            <button
              aria-label="Close mobile number form"
              className="modal-close"
              onClick={() => setMobileModalOpen(false)}
              type="button"
            >
              <SymbolIcon name="close" />
            </button>
            <span className={`tag tag-${modalAccent}`}>One More Step</span>
            <h2>Confirm Interest</h2>
            <p>
              Signed in as {session?.user?.name ?? "Google user"}. Enter your
              mobile number to save your interest for {selectedEvent?.title}.
            </p>
            <label className="mobile-field">
              <span>Mobile Number</span>
              <input
                inputMode="numeric"
                maxLength={10}
                onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                required
                type="tel"
                value={mobileNumber}
              />
            </label>
            {interestError ? <p className="modal-error">{interestError}</p> : null}
            <div className="modal-actions">
              <button
                onClick={() => setMobileModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button disabled={interestStatus === "loading"} type="submit">
                {interestStatus === "loading" ? "Saving..." : "Save Interest"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
