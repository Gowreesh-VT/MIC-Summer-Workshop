"use client";

import Image from "next/image";
import { getSession, signOut, useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
import { EventTile, HackathonTile, SymbolIcon } from "@/components/event-cards";

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

type InterestAlert = {
  id: string;
  title: string;
  description: string;
};

export default function Home() {
  const { data: session, update } = useSession();
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [interestStatus, setInterestStatus] = useState<"idle" | "loading" | "success">("idle");
  const [interestError, setInterestError] = useState("");
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [savedWorkshopNames, setSavedWorkshopNames] = useState<string[]>([]);
  const [interestAlert, setInterestAlert] = useState<InterestAlert | null>(null);
  const [interestConfirmOpen, setInterestConfirmOpen] = useState(false);
  const interestSubmitInFlightRef = useRef(false);
  const modalAccent = selectedEvent?.accent ?? "blue";
  const currentWorkshopIsSaved = Boolean(
    selectedEvent && savedWorkshopNames.includes(selectedEvent.title),
  );

  function handleSelectEvent(event: EventCard) {
    setInterestStatus("idle");
    setInterestError("");
    setMobileModalOpen(false);
    setMobileNumber("");
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
    if (!selectedEvent) {
      setInterestConfirmOpen(false);
    }
  }, [selectedEvent]);

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
        await update();
        if (selectedEvent) {
          void submitInterest(selectedEvent.title);
        }
      } else {
        setInterestError("Google sign-in did not complete. Please try again.");
      }
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [selectedEvent, update]);

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
          setInterestConfirmOpen(false);
          setMobileModalOpen(true);
          return;
        }

        setInterestConfirmOpen(false);
        setInterestError(data.error ?? "Could not save your interest. Please try again.");
        return;
      }

      setInterestStatus("success");
      setMobileNumber("");
      setMobileModalOpen(false);
      setInterestConfirmOpen(false);
      setSavedWorkshopNames((currentNames) =>
        currentNames.includes(workshopName) ? currentNames : [...currentNames, workshopName],
      );
      setInterestAlert({
        id: `${workshopName}-${Date.now()}`,
        title: "Interest saved",
        description: `Interest saved for ${workshopName}.`,
      });
      setSelectedEvent(null);
    } finally {
      interestSubmitInFlightRef.current = false;
    }
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
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="brand" href="#top">
            <Image src="/mic-logo.png" alt="MIC Hexagon Logo" width={40} height={40} />
            <span>Microsoft Innovations Club</span>
          </a>
          <div className="nav-links">
            <a className="active" href="#workshops">
              Workshops
            </a>
            {session?.user?.email ? <a href="/events">Interested Events</a> : null}
            <a href="#hackathons">Hackathons</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            {/* <Button
              className="arcade-btn"
              disabled
              title="Registration links are coming soon."
              type="button"
            >
              Register
            </Button> */}
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
                  {session?.user?.name ?? "Welcome"}
                </strong>
                <span className="member-popover__hint">
                  {session?.user?.name
                    ? "Your workshop interest will save automatically."
                    : "Sign in with Google to save workshop interest automatically."}
                </span>
                {session?.user?.email ? (
                  <Button
                    className="member-popover__logout"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Logout
                  </Button>
                ) : null}
              </PopoverContent>
            </Popover>
          </div>
        </nav>
      </header>

      <main className="main-shell" id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-logo">
            <Image src="/mic-logo.png" alt="MIC Logo" width={108} height={108} priority />
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
              src="/mic-logo.png"
              alt="MIC Logo"
              width={32}
              height={32}
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
        open={Boolean(selectedEvent) && !mobileModalOpen && !interestConfirmOpen}
        onOpenChange={(open) => {
          if (open || mobileModalOpen || interestConfirmOpen) {
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

      <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
        <DialogContent className={`modal-panel mobile-panel modal-panel--${modalAccent}`}>
          <form onSubmit={handleMobileSubmit}>
            <DialogClose asChild>
              <Button
                aria-label="Close mobile number form"
                className="modal-close"
                type="button"
                variant="ghost"
              >
                <SymbolIcon name="close" />
              </Button>
            </DialogClose>
            <span className={`tag tag-${modalAccent}`}>One More Step</span>
            <DialogHeader>
              <DialogTitle>Confirm Interest</DialogTitle>
              <DialogDescription>
                Signed in as {session?.user?.name ?? "Google user"}. Enter your
                mobile number to save your interest for {selectedEvent?.title}.
              </DialogDescription>
            </DialogHeader>
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
                onClick={() => setMobileModalOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={interestStatus === "loading"} type="submit">
                {interestStatus === "loading" ? "Saving..." : "Save Interest"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
