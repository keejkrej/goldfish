import { defineHook } from "eve/hooks";

/**
 * Observability hook.
 *
 * Hermes uses observer hooks for telemetry and middleware. In eve, hooks are
 * observe-only stream-event subscribers. This hook logs session lifecycle events
 * to the console for local debugging and can be extended to send traces to an
 * observability backend.
 */
export default defineHook({
  events: {
    "turn.completed"(event, ctx) {
      console.log("[goldfish] turn.completed", {
        sessionId: ctx.session.id,
        turnId: event.data.turnId,
      });
    },
    "session.completed"(_event, ctx) {
      console.log("[goldfish] session.completed", {
        sessionId: ctx.session.id,
      });
    },
  },
});
