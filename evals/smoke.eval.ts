import { defineEval } from "eve/evals";

/**
 * Smoke eval: the agent should answer a simple greeting without failing.
 *
 * This proves the agent boots, the tools compile, and the basic conversation
 * pipeline works end-to-end.
 */
export default defineEval({
  description: "Smoke test: agent responds to a greeting without errors.",

  async test(t) {
    const turn = await t.send({
      message: "Hello, what is your name and what can you do?",
    });
    turn.expectOk();

    t.didNotFail();
    t.completed();
  },
});
