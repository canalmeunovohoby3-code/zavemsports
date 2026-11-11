export function isStoreDemoMode() {
  if (process.env.STORE_DEMO_DISABLE === "true") return false;
  if (process.env.STORE_DEMO_MODE === "false") return false;
  if (process.env.STORE_DEMO_MODE === "true") return true;
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}
