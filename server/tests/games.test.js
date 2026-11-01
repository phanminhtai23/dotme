import assert from "node:assert/strict";
import { test } from "node:test";
import { GAME_OPTIONS, resolveGameId } from "../../src/games/catalog.js";
import { DIFFICULTY, getDiffConfig } from "../../src/games/difficulty.js";

test("Star Catcher is selectable and has a playable config at every difficulty", () => {
    assert.ok(GAME_OPTIONS.some((game) => game.id === "star-catcher"));
    assert.equal(resolveGameId("star-catcher", "birthday"), "star-catcher");
    assert.deepEqual(Object.keys(DIFFICULTY["star-catcher"]), [
        "easy",
        "medium",
        "hard",
    ]);

    for (const difficulty of ["easy", "medium", "hard"]) {
        const config = getDiffConfig("star-catcher", difficulty);
        assert.ok(config.targetScore > 0);
        assert.ok(config.duration > 0);
        assert.ok(config.fallSpeed > 0);
        assert.ok(config.spawnInterval > 0);
    }

    assert.equal(resolveGameId("unknown-game", "birthday"), "balloon-pop");
});
