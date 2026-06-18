import { defineChannel, GET } from "eve/channels";

/**
 * Custom HTTP channel for Goldfish.
 *
 * Eve already exposes the standard `/eve/v1/session` endpoint automatically.
 * This channel adds a simple `/goldfish/health` route for load balancers and
 * probes, plus a `/goldfish/info` route that returns the agent name and version.
 */
export default defineChannel({
  routes: [
    GET("/goldfish/health", async () => {
      return Response.json({ status: "ok", agent: "goldfish", version: "0.1.0" });
    }),
    GET("/goldfish/info", async () => {
      return Response.json({
        name: "goldfish",
        description: "Hermes-inspired self-improving agent on Vercel eve",
        version: "0.1.0",
      });
    }),
  ],
});
