import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";
import { type Language, languageNames } from "../i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5"
          data-ocid="language.open_modal_button"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-panel border-border/50 w-40"
        data-ocid="language.dropdown_menu"
      >
        {(Object.entries(languageNames) as [Language, string][]).map(
          ([code, name]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className={`text-sm cursor-pointer ${language === code ? "text-primary" : "text-muted-foreground"}`}
              data-ocid={`language.${code}.button`}
            >
              {language === code && (
                <span className="mr-2 text-primary">✓</span>
              )}
              {name}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
