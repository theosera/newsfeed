import { startFeedCron } from "@/lib/rss/cron";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    startFeedCron();
  }
}
