import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, ExternalLink, Globe, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "../contexts/I18nContext";
import { useGetAllBooths } from "../hooks/useQueries";

const TIER_COLORS: Record<string, string> = {
  platinum: "text-chart-1 bg-chart-1/10 border-chart-1/20",
  gold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  silver: "text-slate-300 bg-slate-300/10 border-slate-300/20",
  bronze: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export function SponsorsPage() {
  const { t } = useI18n();
  const { data: booths = [] } = useGetAllBooths();

  const grouped = booths.reduce<Record<string, typeof booths>>((acc, booth) => {
    const tier = booth.tier.toLowerCase();
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(booth);
    return acc;
  }, {});

  const tiers = ["platinum", "gold", "silver", "bronze"];

  return (
    <div className="page-bg min-h-screen pt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title text-3xl mb-2">
            {t("section_sponsors")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Our sponsors make VirtX events possible. Explore their virtual
            booths.
          </p>
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border/50 mb-6">
            <TabsTrigger value="all" data-ocid="sponsors.all.tab">
              {t("label_all")}
            </TabsTrigger>
            {tiers
              .filter((t) => grouped[t]?.length)
              .map((tier) => (
                <TabsTrigger
                  key={tier}
                  value={tier}
                  className="capitalize"
                  data-ocid={`sponsors.${tier}.tab`}
                >
                  {tier}
                </TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value="all">
            {booths.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="sponsors.empty_state"
              >
                <p className="text-muted-foreground">No sponsor booths yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {booths.map((booth, i) => (
                  <BoothCard
                    key={booth.id.toString()}
                    booth={booth}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {tiers.map((tier) => (
            <TabsContent key={tier} value={tier}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(grouped[tier] ?? []).map((booth, i) => (
                  <BoothCard
                    key={booth.id.toString()}
                    booth={booth}
                    index={i + 1}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function BoothCard({ booth, index }: { booth: any; index: number }) {
  const tierColor =
    TIER_COLORS[booth.tier.toLowerCase()] ??
    "text-muted-foreground bg-muted/10 border-muted/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-panel rounded-2xl p-5 card-glow flex flex-col gap-4"
      data-ocid={`sponsors.item.${index}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={booth.logoUrl || `https://picsum.photos/seed/${booth.id}/80/80`}
          alt={booth.sponsorName}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold">{booth.sponsorName}</p>
          <Badge
            className={`text-[10px] capitalize rounded-full mt-1 ${tierColor}`}
            variant="outline"
          >
            {booth.tier}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {booth.description}
      </p>

      <div className="space-y-2">
        {booth.contactEmail && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span className="truncate">{booth.contactEmail}</span>
          </div>
        )}
        {booth.websiteUrl && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span className="truncate">{booth.websiteUrl}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <a
          href={booth.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full rounded-full border-border/50 text-xs"
            data-ocid={`sponsors.website_button.${index}`}
          >
            <Building className="w-3 h-3 mr-1" />
            Visit Booth
          </Button>
        </a>
        {booth.demoUrl && (
          <a href={booth.demoUrl} target="_blank" rel="noopener noreferrer">
            <Button
              className="btn-gradient rounded-full text-xs"
              data-ocid={`sponsors.demo_button.${index}`}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Demo
            </Button>
          </a>
        )}
      </div>
    </motion.div>
  );
}
