// Muted, professional gradient palette for board covers and accents.
// 12 options → 5 boards get distinct colors, and even 8+ boards mostly avoid collisions.
// Colors chosen to stay legible against white cards and to not look candy-bright.

const GRADIENTS = [
  "from-slate-500 to-slate-700",
  "from-blue-600 to-indigo-700",
  "from-emerald-600 to-teal-700",
  "from-amber-600 to-orange-700",
  "from-rose-500 to-pink-700",
  "from-violet-600 to-purple-700",
  "from-cyan-600 to-blue-700",
  "from-stone-500 to-stone-700",
  "from-teal-600 to-emerald-700",
  "from-sky-600 to-blue-800",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-600 to-rose-700",
];

export function boardGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
