import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortProviders(list: any[]) {
  return [...list].sort((a, b) => {
    const aPremium = a.is_premium === true || String(a.is_premium) === 'true';
    const bPremium = b.is_premium === true || String(b.is_premium) === 'true';
    if (aPremium && !bPremium) return -1;
    if (!aPremium && bPremium) return 1;
    
    // If both are premium, sort by premiumRank if available
    if (aPremium && bPremium) {
      const rankA = typeof a.premiumRank === 'number' ? a.premiumRank : 999;
      const rankB = typeof b.premiumRank === 'number' ? b.premiumRank : 999;
      if (rankA !== rankB) return rankA - rankB;
    }
    
    // fallback alphabetical
    return a.name.localeCompare(b.name, 'ar');
  });
}
