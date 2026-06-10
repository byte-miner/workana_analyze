"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Briefcase,
  Car,
  Cloud,
  Code2,
  Cpu,
  Dumbbell,
  Gamepad2,
  Globe,
  GraduationCap,
  Headphones,
  HeartPulse,
  Home,
  Landmark,
  Layers,
  LayoutTemplate,
  Megaphone,
  Monitor,
  Palette,
  Plane,
  Scale,
  Share2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Stethoscope,
  Truck,
  Users,
  UtensilsCrossed,
  Workflow,
  Zap,
} from "lucide-react";

type BrandLogo = { kind: "brand"; slug: string; color: string };
type IconLogo = { kind: "icon"; Icon: LucideIcon; color: string };

type LogoDef = BrandLogo | IconLogo;

const LABEL_LOGOS: Array<{ match: RegExp; def: LogoDef }> = [
  { match: /wordpress/i, def: { kind: "brand", slug: "wordpress", color: "21759B" } },
  { match: /shopify/i, def: { kind: "brand", slug: "shopify", color: "7AB55C" } },
  { match: /woocommerce/i, def: { kind: "brand", slug: "woocommerce", color: "96588A" } },
  { match: /webflow/i, def: { kind: "brand", slug: "webflow", color: "146EF5" } },
  { match: /\bwix\b/i, def: { kind: "brand", slug: "wix", color: "0C6EFC" } },
  { match: /framer/i, def: { kind: "brand", slug: "framer", color: "0055FF" } },
  { match: /whatsapp/i, def: { kind: "brand", slug: "whatsapp", color: "25D366" } },
  { match: /elementor/i, def: { kind: "brand", slug: "elementor", color: "92003B" } },
  { match: /openai|artificial intelligence|ai agent/i, def: { kind: "brand", slug: "openai", color: "412991" } },
  { match: /zapier|automation/i, def: { kind: "brand", slug: "zapier", color: "FF4A00" } },
  { match: /hubspot|\bcrm\b/i, def: { kind: "brand", slug: "hubspot", color: "FF7A59" } },
  { match: /\berp\b/i, def: { kind: "brand", slug: "sap", color: "0FAAFF" } },
  { match: /blockchain|web3/i, def: { kind: "brand", slug: "ethereum", color: "3C3C3D" } },
  { match: /figma|web design/i, def: { kind: "brand", slug: "figma", color: "F24E1E" } },
  { match: /data science|python/i, def: { kind: "brand", slug: "python", color: "3776AB" } },
  { match: /android|ios|apps programming|mobile/i, def: { kind: "brand", slug: "android", color: "3DDC84" } },
  { match: /react|node/i, def: { kind: "brand", slug: "react", color: "61DAFB" } },

  { match: /divi/i, def: { kind: "icon", Icon: Layers, color: "#7C3AED" } },
  { match: /\bsaas\b/i, def: { kind: "icon", Icon: Cloud, color: "#CA8A04" } },
  { match: /chatbot/i, def: { kind: "icon", Icon: Bot, color: "#9333EA" } },
  { match: /\biot\b/i, def: { kind: "icon", Icon: Cpu, color: "#0E7490" } },
  { match: /landing page/i, def: { kind: "icon", Icon: LayoutTemplate, color: "#4F46E5" } },
  { match: /desktop apps/i, def: { kind: "icon", Icon: Monitor, color: "#78716C" } },
  { match: /general/i, def: { kind: "icon", Icon: Code2, color: "#4B5563" } },
  { match: /e-?commerce/i, def: { kind: "icon", Icon: ShoppingBag, color: "#EA580C" } },

  { match: /virtual assistance/i, def: { kind: "icon", Icon: Headphones, color: "#7C3AED" } },
  { match: /gaming/i, def: { kind: "icon", Icon: Gamepad2, color: "#9333EA" } },
  { match: /beauty/i, def: { kind: "icon", Icon: Sparkles, color: "#EC4899" } },
  { match: /real estate/i, def: { kind: "icon", Icon: Home, color: "#65A30D" } },
  { match: /health clinic|healthcare/i, def: { kind: "icon", Icon: HeartPulse, color: "#0891B2" } },
  { match: /logistics/i, def: { kind: "icon", Icon: Truck, color: "#0369A1" } },
  { match: /social media/i, def: { kind: "icon", Icon: Share2, color: "#E11D48" } },
  { match: /automotive/i, def: { kind: "icon", Icon: Car, color: "#525252" } },
  { match: /finance/i, def: { kind: "icon", Icon: Landmark, color: "#15803D" } },
  { match: /marketing/i, def: { kind: "icon", Icon: Megaphone, color: "#A855F7" } },
  { match: /travel/i, def: { kind: "icon", Icon: Plane, color: "#06B6D4" } },
  { match: /food|restaurant/i, def: { kind: "icon", Icon: UtensilsCrossed, color: "#C2410C" } },
  { match: /education/i, def: { kind: "icon", Icon: GraduationCap, color: "#CA8A04" } },
  { match: /legal/i, def: { kind: "icon", Icon: Scale, color: "#57534E" } },
  { match: /fitness/i, def: { kind: "icon", Icon: Dumbbell, color: "#84CC16" } },
  { match: /hr|recruitment/i, def: { kind: "icon", Icon: Briefcase, color: "#BE185D" } },
  { match: /agency website/i, def: { kind: "icon", Icon: Globe, color: "#4F46E5" } },
  { match: /data science/i, def: { kind: "icon", Icon: BarChart3, color: "#0891B2" } },
  { match: /web design/i, def: { kind: "icon", Icon: Palette, color: "#F59E0B" } },
  { match: /workflow/i, def: { kind: "icon", Icon: Workflow, color: "#0284C7" } },
];

const DEFAULT_LOGO: IconLogo = { kind: "icon", Icon: Zap, color: "#7246E5" };

function resolveLogo(label: string): LogoDef {
  for (const { match, def } of LABEL_LOGOS) {
    if (match.test(label)) return def;
  }
  return DEFAULT_LOGO;
}

interface AnalyticsLabelLogoProps {
  label: string;
  size?: number;
  className?: string;
}

export function AnalyticsLabelLogo({
  label,
  size = 18,
  className = "",
}: AnalyticsLabelLogoProps) {
  const def = resolveLogo(label);

  if (def.kind === "brand") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${def.slug}/${def.color}`}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-contain ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const { Icon, color } = def;
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={`shrink-0 ${className}`}
      style={{ color }}
      aria-hidden
    />
  );
}
