export const getPremiumTier = (premiumPackage, now = Date.now()) => {
    if (!premiumPackage?.active) return null;

    const rawExpiry = premiumPackage.expiresAt;

    if (!rawExpiry) return null;

    const expiry = typeof rawExpiry.toDate === "function"
        ? rawExpiry.toDate()
        : rawExpiry.seconds != null
            ? new Date(rawExpiry.seconds * 1000)
            : new Date(rawExpiry);

    const expiresAt = expiry.getTime();

    if (!Number.isFinite(expiresAt) || now >= expiresAt) {
        return null;
    }

    const title = String(premiumPackage.title || "")
        .trim()
        .toLowerCase();

    const tiers = {
        basic: "basic",
        advanced: "advanced",
        pro: "pro",
        "premium-basic": "basic",
        "premium-advanced": "advanced",
        "premium-pro": "pro",
    };

    return tiers[title] || null;
};

export const canAccessIntelligence = (premiumPackage, now) => {
    const tier = getPremiumTier(premiumPackage, now);

    return tier === "advanced" || tier === "pro";
};
export const canAccessWeightControl = (premiumPackage, now) => {
    const tier = getPremiumTier(premiumPackage, now);

    return tier === "advanced" || tier === "pro";
};
export const canAccessRunningPlans = (premiumPackage, now) => {
    const tier = getPremiumTier(premiumPackage, now);

    return (
        tier === "basic" ||
        tier === "advanced" ||
        tier === "pro"
    );
};
export const canAccessConquer = (premiumPackage, now) => {
    const tier = getPremiumTier(premiumPackage, now);

    return (
        tier === "basic" ||
        tier === "advanced" ||
        tier === "pro"
    );
};