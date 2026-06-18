import { defineSchedule } from "eve/schedules";

/**
 * Background self-improvement schedule.
 *
 * This schedule starts a new session with a review prompt, letting the agent use
 * `session_search`, `memory`, and `skill_manage` to consolidate recent learning.
 *
 * It mirrors Hermes' background memory/skill review thread.
 */
export default defineSchedule({
  cron: "0 2 * * *",
  markdown:
    "Review the last 24 hours of sessions. Summarize useful facts into memory " +
    "and turn repeatable workflows into skills using the skill_manage tool.",
});
