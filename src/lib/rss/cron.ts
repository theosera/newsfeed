import cron from "node-cron";

import { fetchAllEnabledSources } from "@/lib/rss/fetcher";

const globalForCron = globalThis as {
  newsfeedCronStarted?: boolean;
};

export function startFeedCron() {
  if (globalForCron.newsfeedCronStarted || process.env.DISABLE_FEED_CRON === "true") {
    return;
  }

  cron.schedule("*/15 * * * *", async () => {
    try {
      await fetchAllEnabledSources();
    } catch (error) {
      console.error("Scheduled feed fetch failed:", error);
    }
  });

  globalForCron.newsfeedCronStarted = true;
}
