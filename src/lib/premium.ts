export function isPremiumActive(provider: any): boolean {
  const isPremiumFlag = provider.is_premium === true || String(provider.is_premium) === 'true';
  if (!isPremiumFlag) {
    return false;
  }
  
  if (provider.premium_expiry_date) {
    const expiry = new Date(provider.premium_expiry_date);
    const now = new Date();
    if (expiry < now) {
      return false;
    }
  }
  
  return true;
}

export function sortProvidersByPremium(list: any[]) {
  return [...list].sort((a, b) => {
    const aPremium = isPremiumActive(a);
    const bPremium = isPremiumActive(b);
    
    if (aPremium && !bPremium) return -1;
    if (!aPremium && bPremium) return 1;
    
    // If both are premium, sort by premiumRank if available
    if (aPremium && bPremium) {
      const rankA = typeof a.premium_rank === 'number' ? a.premium_rank : 999;
      const rankB = typeof b.premium_rank === 'number' ? b.premium_rank : 999;
      if (rankA !== rankB) return rankA - rankB;
    }
    
    // fallback alphabetical
    return (a.name || "").localeCompare(b.name || "", 'ar');
  });
}

// Check if premium expires in less than or equal to 3 days
export function isPremiumExpiringSoon(provider: any): boolean {
  if (!isPremiumActive(provider) || !provider.premium_expiry_date) {
    return false;
  }
  
  const expiry = new Date(provider.premium_expiry_date);
  const now = new Date();
  
  // If it's already expired, isPremiumActive would return false, but just in case
  if (expiry < now) return false;
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays <= 3;
}
