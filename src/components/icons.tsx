export type IconName =
  | "hammer"
  | "sparkles"
  | "truck"
  | "chair"
  | "wrench"
  | "more"
  | "shield"
  | "heart"
  | "leaf"
  | "users"
  | "calendar"
  | "home"
  | "clipboard"
  | "layers"
  | "box"
  | "bolt"
  | "droplet"
  | "search";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className = "h-6 w-6" }: IconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "hammer":
      return (
        <svg {...common}>
          <path d="m14 6 4 4" />
          <path d="m17 3 4 4-3 3-4-4z" />
          <path d="m3 21 8.5-8.5" />
          <path d="m9 9 6 6" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5a2.1 2.1 0 0 0 3 3l6.2-6.2a4 4 0 0 0 5-5l-2.8 2.8-3-3z" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
          <path d="M7 7v10" />
          <path d="M17 7v10" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 3 10.5 8.5 5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5z" />
          <path d="M5 3v4" />
          <path d="M3 5h4" />
          <path d="M19 17v4" />
          <path d="M17 19h4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7z" />
          <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path d="M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      );
    case "chair":
      return (
        <svg {...common}>
          <path d="M7 13V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v6" />
          <path d="M5 13h14v4H5z" />
          <path d="M7 17v4" />
          <path d="M17 17v4" />
          <path d="M20 8c1.5 1 2 2.5 2 5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.6c0 5.3-8.8 10.4-8.8 10.4S3.2 13.9 3.2 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M20 4c-8 0-13 5-13 13" />
          <path d="M20 4c0 8-5 13-13 13" />
          <path d="M7 17c-2 1-3 2.5-4 4" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 19c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4" />
          <path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M20 19c0-1.8-1.2-3.3-3-3.8" />
          <path d="M16 4.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M7 3v2" />
          <path d="M17 3v2" />
          <path d="M4 7h16" />
          <path d="M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          <path d="M8 11h4" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6 9.5V20h12V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <path d="M9 5h6a2 2 0 0 1 2 2v13H7V7a2 2 0 0 1 2-2z" />
          <path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="M12 4 3 9l9 5 9-5-9-5z" />
          <path d="m3 14 9 5 9-5" />
          <path d="m3 19 9 5 9-5" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M12 3 20 7v10l-8 4-8-4V7z" />
          <path d="M12 3v18" />
          <path d="M4 7l8 4 8-4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
    case "droplet":
      return (
        <svg {...common}>
          <path d="M12 3c4 5 7 8.5 7 12a7 7 0 1 1-14 0c0-3.5 3-7 7-12z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
  }
}
