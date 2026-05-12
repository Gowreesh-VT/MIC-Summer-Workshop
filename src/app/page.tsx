"use client";

import Image from "next/image";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { departments, hackathons, type EventCard } from "@/lib/event-data";
import { installAuthPopupListener } from "@/lib/auth-popup";
import { getDefaultSchoolCollegeName, isVitStudentEmail, needsProfileDetails } from "@/lib/profile";
import { EventTile, HackathonTile, SymbolIcon } from "@/components/event-cards";

type FaqAccent = "blue" | "green" | "red" | "yellow";

type FaqItem = {
  question: string;
  answer: string;
  accent: FaqAccent;
};

const faqs: FaqItem[] = [
  {
    question: "How will the online workshop be conducted?",
    answer:
      "The sessions are hosted live on Google Meet (we may also Microsoft Teams for specific tracks). A join link is emailed to you after you register.",
    accent: "blue",
  },
  {
    question: "Will the sessions be recorded?",
    answer:
      "Yes. All live sessions are recorded and shared with registered participants within 24 hours so you can review the material at your own pace.",
    accent: "green",
  },
  {
    question: "How long is each session?",
    answer:
      "Each session runs for about two hours, including a dedicated Q&A segment at the end.",
    accent: "red",
  },
  {
    question: "Do I need any prior coding experience?",
    answer:
      "No—this track is beginner-friendly. We start from the fundamentals and build up step by step.",
    accent: "yellow",
  },
  {
    question: "What software or tools do I need to install beforehand?",
    answer:
      "Please use a stable internet connection, a modern web browser, and VS Code. We recommend installing Node.js if you want to code along with the exercises.",
    accent: "blue",
  },
  {
    question: "Do I need a powerful laptop to participate?",
    answer:
      "Not at all. Web development mainly needs a text editor and a browser, so any standard laptop works well.",
    accent: "green",
  },
  {
    question: "What will we be building during the workshop?",
    answer:
      "We take a hands-on approach. By the end of the workshop you will have built and deployed a real project—such as a personal portfolio or a Next.js web app—from scratch.",
    accent: "red",
  },
  {
    question: "How can I ask questions if I get stuck on a coding error?",
    answer:
      "We run a dedicated Discord (and WhatsApp) group for participants. Mentors monitor the chat during live sessions so you can get unstuck quickly.",
    accent: "yellow",
  },
  {
    question: "Will I receive a certificate of completion?",
    answer:
      "Yes. Participants who complete the final project submission receive a verified certificate from the web development department.",
    accent: "blue",
  },
  {
    question: "Can I participate in hackathons alone or do I need a team?",
    answer: 
        "You can join with a pre-formed team or register solo. We host team-building sessions before hackathons to help you find teammates.",
    accent: "green",
  },
];

type InterestAlert = {
  id: string;
  title: string;
  description: string;
};

type ProfilePayload = {
  mobileNumber: string;
  registrationNumber: string;
  schoolCollegeName: string;
};

const pendingWorkshopStorageKey = "mic-pending-workshop-name";

export default function Home() {
  const { data: session, update } = useSession();
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [schoolCollegeName, setSchoolCollegeName] = useState("");
  const [interestStatus, setInterestStatus] = useState<"idle" | "loading" | "success">("idle");
  const [interestError, setInterestError] = useState("");
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [savedWorkshopNames, setSavedWorkshopNames] = useState<string[]>([]);
  const [interestAlert, setInterestAlert] = useState<InterestAlert | null>(null);
  const [interestConfirmOpen, setInterestConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const interestSubmitInFlightRef = useRef(false);
  const isVitStudent = isVitStudentEmail(session?.user?.email);
  const modalAccent = selectedEvent?.accent ?? "blue";
  const currentWorkshopIsSaved = Boolean(
    selectedEvent && savedWorkshopNames.includes(selectedEvent.title),
  );

  function handleSelectEvent(event: EventCard) {
    setInterestStatus("idle");
    setInterestError("");
    setProfileModalOpen(false);
    window.sessionStorage.removeItem(pendingWorkshopStorageKey);
    setMobileNumber("");
    setRegistrationNumber("");
    setSchoolCollegeName("");
    setInterestAlert(null);
    setInterestConfirmOpen(false);
    setSelectedEvent(event);
  }

  useEffect(() => {
    if (!interestAlert) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setInterestAlert(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [interestAlert]);

  useEffect(() => {
    async function loadSavedWorkshops() {
      if (!session?.user?.email) {
        setSavedWorkshopNames([]);
        setProfileModalOpen(false);
        return;
      }

      const response = await fetch("/api/interested", { method: "GET" });
      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || !contentType.includes("application/json")) {
        setSavedWorkshopNames([]);
        return;
      }

      const data = (await response.json()) as {
        workshopNames?: string[];
        user?: {
          mobileNumber?: string;
          registrationNumber?: string;
          schoolCollegeName?: string;
        } | null;
      };
      setSavedWorkshopNames(data.workshopNames ?? []);
      setMobileNumber(data.user?.mobileNumber ?? "");
      setRegistrationNumber(data.user?.registrationNumber ?? "");
      setSchoolCollegeName(
        data.user?.schoolCollegeName ?? getDefaultSchoolCollegeName(session.user.email),
      );

      const email = session.user.email;
      if (needsProfileDetails(email, data.user)) {
        setProfileModalOpen(true);
      }
    }

    void loadSavedWorkshops();
  }, [session?.user?.email]);

  useEffect(() => {
    if (!navOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  const submitInterest = useCallback(async (workshopName?: string, profile?: ProfilePayload) => {
    if (interestSubmitInFlightRef.current) {
      return;
    }
    interestSubmitInFlightRef.current = true;
    setInterestError("");
    setInterestStatus("loading");

    try {
      const response = await fetch("/api/interested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber: profile?.mobileNumber ?? mobileNumber,
          registrationNumber: profile?.registrationNumber ?? registrationNumber,
          schoolCollegeName: profile?.schoolCollegeName ?? schoolCollegeName,
          workshopName,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? ((await response.json()) as {
            error?: string;
            requiresProfileDetails?: boolean;
          })
        : { error: "Could not save your interest. Please try again." };

      if (!response.ok) {
        setInterestStatus("idle");

        if (data.requiresProfileDetails) {
          setInterestConfirmOpen(false);
          setProfileModalOpen(true);
          return;
        }

        setInterestConfirmOpen(false);
        setInterestError(data.error ?? "Could not save your interest. Please try again.");
        return;
      }

      setInterestStatus("success");
      setMobileNumber("");
      setRegistrationNumber("");
      setSchoolCollegeName("");
      setProfileModalOpen(false);
      setInterestConfirmOpen(false);
      setSavedWorkshopNames((currentNames) =>
        workshopName && currentNames.includes(workshopName)
          ? currentNames
          : workshopName
            ? [...currentNames, workshopName]
            : currentNames,
      );
      setInterestAlert({
        id: `${workshopName ?? "profile"}-${Date.now()}`,
        title: workshopName ? "Interest saved" : "Profile saved",
        description: workshopName
          ? `Interest saved for ${workshopName}.`
          : "Your profile details have been saved.",
      });
      if (workshopName) {
        setSelectedEvent(null);
        window.sessionStorage.removeItem(pendingWorkshopStorageKey);
      }
    } finally {
      interestSubmitInFlightRef.current = false;
    }
  }, [mobileNumber, registrationNumber, schoolCollegeName]);

  useEffect(() => {
    return installAuthPopupListener(() => {
        window.location.reload();
    });
  }, []);

  async function handleInterestedClick() {
    setInterestError("");
    setInterestStatus("idle");

    const currentSession = session?.user?.email ? session : await getSession();
    if (!session?.user?.email && currentSession?.user?.email) {
      await update();
    }

    if (currentSession?.user?.email) {
      if (selectedEvent) {
        setInterestConfirmOpen(true);
      }
      return;
    }

    if (selectedEvent) {
      window.sessionStorage.setItem(pendingWorkshopStorageKey, selectedEvent.title);
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

  async function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInterestError("");

    const workshopName =
      selectedEvent?.title || window.sessionStorage.getItem(pendingWorkshopStorageKey) || "";

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setInterestError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!registrationNumber.trim()) {
      setInterestError("Enter your registration number.");
      return;
    }

    if (!isVitStudent && !schoolCollegeName.trim()) {
      setInterestError("Enter your school or college name.");
      return;
    }

    await submitInterest(workshopName, {
      mobileNumber,
      registrationNumber,
      schoolCollegeName: isVitStudent
        ? getDefaultSchoolCollegeName(session?.user?.email)
        : schoolCollegeName,
    });
  }

  useEffect(() => {
    if (!session?.user?.email) {
      return;
    }

    const storedWorkshopName = window.sessionStorage.getItem(pendingWorkshopStorageKey);
    if (!storedWorkshopName) {
      return;
    }

    void submitInterest(storedWorkshopName);
  }, [session?.user?.email, submitInterest]);

  function handleInterestConfirmProceed() {
    if (!selectedEvent) {
      return;
    }
    void submitInterest(selectedEvent.title);
  }

  return (
    <div className="arcade-page">
      {interestAlert ? (
        <div className="alert-stack" aria-atomic="true" aria-live="polite">
          <Alert className="alert-toast" variant="success">
            <button
              aria-label="Dismiss alert"
              className="alert-toast__close"
              onClick={() => setInterestAlert(null)}
              type="button"
            >
              <SymbolIcon className="icon" name="close" />
            </button>
            <AlertTitle>{interestAlert.title}</AlertTitle>
            <AlertDescription>{interestAlert.description}</AlertDescription>
          </Alert>
        </div>
      ) : null}
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
        <div
          aria-hidden={!navOpen}
          className={`nav-backdrop${navOpen ? " nav-backdrop--open" : ""}`}
          onClick={() => setNavOpen(false)}
        />
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="brand" href="#top">
            <Image
              src="/mic-logo-removedbg.png"
              alt="MIC Hexagon Logo"
              width={120}
              height={120}
              style={{ width: "auto", height: "auto" }}
            />
            <span>Microsoft Innovations Club</span>
          </a>
          <button
            aria-controls="site-nav-links"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="nav-menu-toggle"
            onClick={() => setNavOpen((open) => !open)}
            type="button"
          >
            <SymbolIcon className="icon" name={navOpen ? "close" : "menu"} />
          </button>
          <div
            className={`nav-links${navOpen ? " nav-links--open" : ""}`}
            id="site-nav-links"
          >
            <a className="active" href="#workshops" onClick={() => setNavOpen(false)}>
              Workshops
            </a>
            {session?.user?.email ? (
              <a href="/events" onClick={() => setNavOpen(false)}>
                Interested Events
              </a>
            ) : null}
            <a href="#hackathons" onClick={() => setNavOpen(false)}>
              Hackathons
            </a>
            <a href="#faq" onClick={() => setNavOpen(false)}>
              FAQ
            </a>
          </div>
          <div className="nav-actions">
            <Button
              className="arcade-btn header-auth-button"
              onClick={() =>
                session?.user?.email
                  ? signOut({ callbackUrl: "/" })
                  : signIn("google", { callbackUrl: window.location.href })
              }
              type="button"
            >
              {session?.user?.email ? "Logout" : "Login"}
            </Button>
            <Popover open={memberMenuOpen} onOpenChange={setMemberMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  aria-label="Member account information"
                  className="member-menu__button"
                  size="icon"
                  type="button"
                  variant="icon"
                >
                  <SymbolIcon className="account-icon text-primary" name="account_circle" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="member-popover" role="status">
                <span className="member-popover__label">
                  {session?.user?.name ? "Logged in with Google" : "Welcome"}
                </span>
                <strong className="member-popover__name">
                  Name: {session?.user?.name ?? "Welcome"}
                </strong>
                {session?.user?.email ? (
                  <div className="member-popover__details">
                    <span className="member-popover__detail">
                      Email: {session?.user?.email}
                    </span>
                    <span className="member-popover__detail">
                      School/College: {schoolCollegeName || "Not provided"}
                    </span>
                    <span className="member-popover__detail">
                      Reg No: {registrationNumber || "Not provided"}
                    </span>
                    <span className="member-popover__detail">
                      Mobile: {mobileNumber || "Not provided"}
                    </span>
                  </div>
                ) : null}
                <Button
                  className="member-popover__auth-mobile"
                  onClick={() =>
                    session?.user?.email
                      ? signOut({ callbackUrl: "/" })
                      : signIn("google", { callbackUrl: window.location.href })
                  }
                  type="button"
                  variant={session?.user?.email ? "destructive" : "default"}
                >
                  {session?.user?.email ? "Logout" : "Login"}
                </Button>
                <span className="member-popover__hint" style={{ marginTop: session?.user?.email ? "0.5rem" : "0" }}>
                  {session?.user?.name
                    ? "Your workshop interest will save automatically."
                    : "Sign in with Google to save workshop interest automatically."}
                </span>
              </PopoverContent>
            </Popover>
          </div>
        </nav>
      </header>

      <main className="main-shell" id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-logo">
            <Image
              src="/mic-logo.png"
              alt="MIC Logo"
              width={108}
              height={108}
              priority
              style={{ width: "auto", height: "auto" }}
            />
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
          <Accordion className="faq-list" collapsible type="single">
            {faqs.map((faq, index) => (
              <AccordionItem className="faq-item" key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className={`faq-question glow-${faq.accent}`}>
                  <span className={`text-${faq.accent}`}>{faq.question}</span>
                  <SymbolIcon className={`faq-icon text-${faq.accent}`} name="expand_more" />
                </AccordionTrigger>
                <AccordionContent className="faq-answer">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <Image
              className="footer-logo"
              src="/mic-logo-removedbg.png"
              alt="MIC Logo"
              width={60}
              height={60}
              style={{ width: "auto", height: "auto" }}
            />
            <span>Microsoft Innovations Club</span>
          </div>
          <div className="footer-links">
            <a href="https://policies.google.com/terms?hl=en-US">Terms of Service</a>
            <a href="https://policies.google.com/privacy?hl=en-US">Privacy Policy</a>
            <a href="https://microsoftinnovations.club">Support</a>
          </div>
          <p>© 2026 MIC - Level Up Your Skills.</p>
        </div>
      </footer>

      <Dialog
        open={Boolean(selectedEvent) && !profileModalOpen && !interestConfirmOpen}
        onOpenChange={(open) => {
          if (open || profileModalOpen || interestConfirmOpen) {
            return;
          }
          setSelectedEvent(null);
        }}
      >
        {selectedEvent ? (
          <DialogContent className={`modal-panel modal-panel--${modalAccent}`}>
            <DialogClose asChild>
              <Button
                aria-label="Close event details"
                className="modal-close"
                type="button"
                variant="ghost"
              >
                <SymbolIcon name="close" />
              </Button>
            </DialogClose>
            <span className={`tag tag-${modalAccent}`}>Event Details</span>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                {selectedEvent.description} Join us for this high-intensity
                arcade-style session designed to propel your skills to the next
                level.
              </DialogDescription>
            </DialogHeader>
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
            <DialogFooter className="modal-actions">
              <Button
                disabled={currentWorkshopIsSaved}
                onClick={handleInterestedClick}
                type="button"
                variant="outline"
              >
                {currentWorkshopIsSaved ? "Shown Interest" : "Interested"}
              </Button>
              {/* TODO: Redirect users to specific external URLs based on the unique workshop they are viewing. */}
              <Button disabled title="Registration links are coming soon." type="button">
                Register Now
              </Button>
            </DialogFooter>
            {interestError ? <p className="modal-error">{interestError}</p> : null}
            {interestStatus === "success" ? (
              <p className="modal-success">Interest saved successfully.</p>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={interestConfirmOpen} onOpenChange={setInterestConfirmOpen}>
        <DialogContent
          className={`modal-panel interest-confirm-panel modal-panel--${modalAccent}`}
          onEscapeKeyDown={(event) => {
            if (interestSubmitInFlightRef.current) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (interestSubmitInFlightRef.current) {
              event.preventDefault();
            }
          }}
        >
          <DialogClose asChild>
            <Button
              aria-label="Close confirmation"
              className="modal-close"
              disabled={interestStatus === "loading"}
              type="button"
              variant="ghost"
            >
              <SymbolIcon name="close" />
            </Button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Confirm interest</DialogTitle>
            <DialogDescription>
              Save your interest for{" "}
              <strong className="text-foreground">{selectedEvent?.title}</strong>? You can remove
              it later from Interested Events Section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="modal-actions interest-confirm-actions">
            <Button
              disabled={interestStatus === "loading"}
              onClick={() => setInterestConfirmOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={interestStatus === "loading"}
              onClick={handleInterestConfirmProceed}
              type="button"
            >
              {interestStatus === "loading" ? "Saving..." : "Yes, save interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className={`modal-panel mobile-panel modal-panel--${modalAccent}`}>
          <form onSubmit={handleMobileSubmit}>
            <DialogClose asChild>
              <Button
                aria-label="Close profile form"
                className="modal-close"
                type="button"
                variant="ghost"
              >
                <SymbolIcon name="close" />
              </Button>
            </DialogClose>
            <span className={`tag tag-${modalAccent}`}>One More Step</span>
            <DialogHeader>
              <DialogTitle>Complete your profile</DialogTitle>
              <DialogDescription>
                Signed in as {session?.user?.name ?? "Google user"}. Enter the
                details needed to save your profile.
              </DialogDescription>
            </DialogHeader>
            <div className="mobile-field">
              <Label htmlFor="registration-number">Registration Number</Label>
              <Input
                id="registration-number"
                onChange={(event) => setRegistrationNumber(event.target.value)}
                placeholder="Your registration number"
                required
                type="text"
                value={registrationNumber}
              />
            </div>
            {isVitStudent ? null : (
              <div className="mobile-field">
                <Label htmlFor="school-college-name">School / College Name</Label>
                <Input
                  id="school-college-name"
                  onChange={(event) => setSchoolCollegeName(event.target.value)}
                  placeholder="Your school or college name"
                  required
                  type="text"
                  value={schoolCollegeName}
                />
              </div>
            )}
            <div className="mobile-field">
              <Label htmlFor="mobile-number">Mobile Number</Label>
              <Input
                id="mobile-number"
                inputMode="numeric"
                maxLength={10}
                onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                required
                type="tel"
                value={mobileNumber}
              />
            </div>
            {interestError ? <p className="modal-error">{interestError}</p> : null}
            <DialogFooter className="modal-actions">
              <Button
                onClick={() => setProfileModalOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={interestStatus === "loading"} type="submit">
                {interestStatus === "loading" ? "Saving..." : "Save Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
