import test from "node:test";
import assert from "node:assert/strict";

import { databaseConfigured, buildFallbackProfile, buildFallbackSeries } from "./fallback";

test("databaseConfigured is false without env and fallback profile still loads", () => {
  assert.equal(databaseConfigured(), false);

  const profile = buildFallbackProfile("demo-user");
  assert.equal(profile.clientId, "demo-user");
  assert.equal(profile.settings.uiLang, "tr");
  assert.ok(profile.inventory.length >= 3);

  const series = buildFallbackSeries("en");
  assert.ok(series.list.length > 0);
  assert.equal(series.language, "en");
});
