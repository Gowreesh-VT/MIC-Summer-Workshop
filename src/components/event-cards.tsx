"use client";

import type { CSSProperties, ReactNode } from "react";
import type { EventCard } from "@/lib/event-data";

export function SymbolIcon({
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

export function EventTile({
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

export function HackathonTile({
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