import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiFacebook, SiLinkedin, SiX, SiYoutube } from "react-icons/si";
import { useI18n } from "../contexts/I18nContext";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border/30 mt-16 py-10 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.18 205), oklch(0.55 0.28 290))",
                }}
              >
                <span className="font-display font-black text-white text-xs">
                  V
                </span>
              </div>
              <span className="font-display font-bold gradient-text">
                VirtX
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("footer_tagline")}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiX className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Platform
            </p>
            <ul className="space-y-1.5">
              {[
                ["Events", "/events"],
                ["Networking", "/networking"],
                ["Leaderboard", "/leaderboard"],
                ["Sponsors", "/sponsors"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Features
            </p>
            <ul className="space-y-1.5">
              {[
                "Virtual Rooms",
                "Live Streaming",
                "VR Integration",
                "AI Assistant",
              ].map((item) => (
                <li key={item}>
                  <span className="text-xs text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Support
            </p>
            <ul className="space-y-1.5">
              {[
                "Documentation",
                "Help Center",
                "Contact Us",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year}. Built with{" "}
            <Heart className="w-3 h-3 inline text-red-400" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Attend Anywhere, Experience Everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
