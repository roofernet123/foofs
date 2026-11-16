
import type { Config, Context } from "@netlify/edge-functions";

export default async (
  _request: Request,
  context: Context
) => {
  return context.next();
};

export const config: Config = {
  path: "/api/*",

  rateLimit: {
    windowLimit: 120,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
