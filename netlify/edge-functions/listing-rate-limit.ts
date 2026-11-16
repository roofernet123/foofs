
import type { Config, Context } from "@netlify/edge-functions";

export default async (
  _request: Request,
  context: Context
): Promise<Response> => {
  return context.next();
};

export const config: Config = {
  path: [
    "/alabama/:slug",
    "/alaska/:slug",
    "/arizona/:slug",
    "/arkansas/:slug",
    "/california/:slug",
    "/colorado/:slug",
    "/connecticut/:slug",
    "/delaware/:slug",
    "/florida/:slug",
    "/georgia/:slug",
    "/hawaii/:slug",
    "/idaho/:slug",
    "/illinois/:slug",
    "/indiana/:slug",
    "/iowa/:slug",
    "/kansas/:slug",
    "/kentucky/:slug",
    "/louisiana/:slug",
    "/maine/:slug",
    "/maryland/:slug",
    "/massachusetts/:slug",
    "/michigan/:slug",
    "/minnesota/:slug",
    "/mississippi/:slug",
    "/missouri/:slug",
    "/montana/:slug",
    "/nebraska/:slug",
    "/nevada/:slug",
    "/new-hampshire/:slug",
    "/new-jersey/:slug",
    "/new-mexico/:slug",
    "/new-york/:slug",
    "/north-carolina/:slug",
    "/north-dakota/:slug",
    "/ohio/:slug",
    "/oklahoma/:slug",
    "/oregon/:slug",
    "/pennsylvania/:slug",
    "/rhode-island/:slug",
    "/south-carolina/:slug",
    "/south-dakota/:slug",
    "/tennessee/:slug",
    "/texas/:slug",
    "/utah/:slug",
    "/vermont/:slug",
    "/virginia/:slug",
    "/washington/:slug",
    "/west-virginia/:slug",
    "/wisconsin/:slug",
    "/wyoming/:slug",
    "/district-of-columbia/:slug",
  ],

  method: ["GET"],

  rateLimit: {
    action: "rate_limit",
    windowLimit: 2,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
