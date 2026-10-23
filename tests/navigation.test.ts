import { strict as assert } from "node:assert";
import { test } from "node:test";
import { activeSection, sectionStops } from "../src/navigation.ts";

test("short Result is active before Conclusions even when neither can reach the top", () => {
  const stops = sectionStops(
    [
      { id: "hypothesis-3", top: 8000, height: 1200 },
      { id: "result", top: 9200, height: 150 },
      { id: "conclusions", top: 9350, height: 300 },
    ],
    8850,
    100,
  );
  assert.equal(activeSection(stops, 8600), "hypothesis-3");
  assert.equal(activeSection(stops, 8750), "result");
  assert.equal(activeSection(stops, 8850), "conclusions");
  for (const stop of stops)
    assert.equal(activeSection(stops, stop.top), stop.id);
});

test("normal sections keep their heading offset; scrolling upwards restores the active section", () => {
  const stops = sectionStops(
    [
      { id: "process", top: 400, height: 1500 },
      { id: "result", top: 1900, height: 600 },
      { id: "conclusions", top: 2500, height: 1000 },
    ],
    3000,
    100,
  );
  assert.deepEqual(
    stops.map((s) => s.top),
    [300, 1800, 2400],
  );
  assert.equal(activeSection(stops, 2000), "result");
  assert.equal(activeSection(stops, 1600), "process");
});
