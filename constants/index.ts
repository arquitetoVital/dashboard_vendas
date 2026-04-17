export const ASSETS = {
  LOGO: "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png",
  NOTIFICATION_SOUND: "https://onajedvcxwzouqoltyop.supabase.co/storage/v1/object/public/public-assets/WhatsApp-Audio-2026-03-19-at-15.45.08.mp3",
};

export const REFRESH_INTERVAL_MS = 60_000;
export const TICKER_EXPIRY_MS = 10_000;
export const QUOTE_ROTATION_MS = 30_000;

export const GOAL_COLORS = {
  getBySalesperson: (percent: number) => {
    if (percent < 100) return { text: 'text-white/50', bg: 'bg-white/5', border: 'border-white/5', shadow: 'shadow-[0_0_10px_rgba(255,255,255,0.15)]', bar: 'bg-white/20' };
    if (percent < 200) return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', shadow: 'shadow-[0_0_10px_#10b981]', bar: 'bg-emerald-500/40' };
    if (percent < 300) return { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', shadow: 'shadow-[0_0_10px_#3b82f6]', bar: 'bg-blue-500/40' };
    if (percent < 400) return { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', shadow: 'shadow-[0_0_10px_#a855f7]', bar: 'bg-purple-500/40' };
    if (percent < 500) return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', shadow: 'shadow-[0_0_10px_#f59e0b]', bar: 'bg-amber-500/40' };
    return { text: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', shadow: 'shadow-[0_0_10px_#06b6d4]', bar: 'bg-cyan-500/40' };
  },
};
