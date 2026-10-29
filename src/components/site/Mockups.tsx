import type { HeroCardData } from "@/lib/site-content";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content";
import { AdaptiveMedia } from "@/components/ui/adaptive-media";
import tplBeauty from "@/assets/templates/tpl-ecom-beauty.jpg";

export function getMockups(cards?: HeroCardData[]) {
  const cardList = cards && cards.length > 0 ? cards : DEFAULT_SITE_CONTENT.hero.cards;

  return cardList.map((card, idx) => {
    const fallbackImage = DEFAULT_SITE_CONTENT.hero.cards[idx]?.image || tplBeauty;
    const mediaSrc = card.image || fallbackImage;

    return {
      name: card.id || card.name || `showcase-card-${idx}`,
      el: (
        <div className="relative flex h-full w-full overflow-hidden bg-neutral-950 select-none">
          <AdaptiveMedia
            src={mediaSrc}
            alt={card.title || card.name || `Showcase Card ${idx + 1}`}
            loading={idx === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    };
  });
}

export const mockups = getMockups();
