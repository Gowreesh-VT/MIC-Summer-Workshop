"use client";

import Image from "next/image";
import Link from "next/link";
import { getSession, signOut, useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventTile, SymbolIcon } from "@/components/event-cards";
import { departments, hackathons, type EventCard } from "@/lib/event-data";

function EventPageSymbolIcon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <SymbolIcon className={className} name={name} style={style} />;
}

export default function EventsPage() {
  const { data: session, update } = useSession();
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [savedWorkshopNames, setSavedWorkshopNames] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [loading, setLoading] = useState(false);

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
        await update();
        setMemberMenuOpen(false);
      }
    }

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [update]);

  const savedEvents = [...departments.flatMap((department) => department.events), ...hackathons].filter(
    (event) => savedWorkshopNames.includes(event.title),
  );

  async function removeInterest(workshopName: string) {
    setLoading(true);

    const response = await fetch("/api/interested", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workshopName }),
    });

    setLoading(false);

    if (!response.ok) {
      return;
    }

    setSavedWorkshopNames((currentNames) => currentNames.filter((name) => name !== workshopName));
    setSelectedEvent(null);
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
          <EventPageSymbolIcon
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
          <Link className="brand" href="/">
            <Image src="/mic-logo.png" alt="MIC Hexagon Logo" width={40} height={40} />
            <span>Microsoft Innovations Club</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Workshops</Link>
            <Link className="active" href="/events">
              Events
            </Link>
            <Link href="/#hackathons">Hackathons</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div className="nav-actions">
            <Button className="arcade-btn" disabled title="Registration links are coming soon." type="button">
              Register
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
        <section className="hero" aria-labelledby="events-hero-title">
          <div className="hero-logo">
            <Image src="/mic-logo.png" alt="MIC Logo" width={96} height={96} priority />
          </div>
          <h1 id="events-hero-title">Your Interested Events</h1>
          <div className="hero-rule" />
          <p>Review saved workshops and remove anything you no longer want.</p>
        </section>

        {!session?.user?.email ? (
          <section className="event-section">
            <div className="saved-events-empty">
              <p>Sign in with Google to see the events you have saved.</p>
              <p>Use the member icon to log in, then come back here.</p>
            </div>
          </section>
        ) : savedEvents.length > 0 ? (
          <section className="event-section" id="events">
            <h2 className="section-title text-primary glow-title">Events</h2>
            <div className="event-grid event-grid--saved">
              {savedEvents.map((event) => (
                <EventTile event={event} key={event.title} onSelect={setSelectedEvent} />
              ))}
            </div>
          </section>
        ) : (
          <section className="event-section">
            <div className="saved-events-empty">
              <p>You have not shown interest in any events yet.</p>
              <p>Open a workshop on the home page and tap Interested to add it here.</p>
            </div>
          </section>
        )}
      </main>

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent ? (
          <DialogContent className={`modal-panel modal-panel--${selectedEvent.accent}`}>
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
            <span className={`tag tag-${selectedEvent.accent}`}>Saved Event</span>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>{selectedEvent.description}</DialogDescription>
            </DialogHeader>
            <div className="modal-stats">
              <div>
                <span>Department</span>
                <strong>{selectedEvent.department}</strong>
              </div>
              <div>
                <span>Level</span>
                <strong>{selectedEvent.level}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{selectedEvent.type ?? "Workshop"}</strong>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="modal-secondary"
                onClick={() => setSelectedEvent(null)}
                type="button"
                variant="outline"
              >
                Keep Interest
              </Button>
              <Button
                className="modal-destructive"
                disabled={loading}
                onClick={() => void removeInterest(selectedEvent.title)}
                type="button"
                variant="destructive"
              >
                Not-interested
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}