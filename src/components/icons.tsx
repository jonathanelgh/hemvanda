import type { Service } from "@/lib/services";

type IconProps = {
  name: Service["icon"] | "shield" | "heart" | "leaf" | "users";
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
  }
}
