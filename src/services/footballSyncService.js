
const { footballApiRequest } = require("./footballApi");
const Team = require("../models/Team");
const Fixture = require("../models/Fixture");
const Result = require("../models/Result");

// Convert API-Football status codes to the statuses supported by Cabby Sports.
function mapFixtureStatus(short) {
  if (["PST", "CANC", "ABD", "AWD", "WO"].includes(short)) {
    return short === "PST" ? "Postponed" : "Cancelled";
  }

  return "Scheduled";
}

// Import upcoming fixtures for a specific API-Football league and season.
// Example: syncFixtures({ leagueId: 39, season: 2026 })
async function syncFixtures({ leagueId, season }) {
  if (!Number.isInteger(Number(leagueId)) || !Number.isInteger(Number(season))) {
    throw new Error("Valid leagueId and season are required.");
  }

  const response = await footballApiRequest("/fixtures", {
    league: Number(leagueId),
    season: Number(season),
    next: 20,
  });

  const imported = [];
  const skipped = [];

  for (const item of response.response || []) {
    const apiFixtureId = item.fixture?.id;
    const homeApiId = item.teams?.home?.id;
    const awayApiId = item.teams?.away?.id;

    if (!apiFixtureId || !homeApiId || !awayApiId) {
      skipped.push({ fixtureId: apiFixtureId || null, reason: "Missing API IDs" });
      continue;
    }

    // Never create or rename teams automatically.
    const [homeTeam, awayTeam] = await Promise.all([
      Team.findOne({ apiFootballId: homeApiId, isActive: true }),
      Team.findOne({ apiFootballId: awayApiId, isActive: true }),
    ]);

    if (!homeTeam || !awayTeam) {
      skipped.push({
        fixtureId: apiFixtureId,
        reason: "Both teams must be mapped to existing Cabby Sports teams first",
      });
      continue;
    }

    const fixtureData = {
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      competition: item.league?.name || "Football",
      matchDate: new Date(item.fixture.date),
      venue: item.fixture.venue?.name || "",
      status: mapFixtureStatus(item.fixture.status?.short),
      matchweek: item.league?.round
        ? Number(String(item.league.round).match(/\d+/)?.[0]) || undefined
        : undefined,
      description: "Fixture data synced from API-Football",
    };

    // Update by external ID first; otherwise preserve manual records and
    // only create a new record when the exact fixture does not already exist.
    let fixture = await Fixture.findOne({ apiFootballFixtureId: apiFixtureId });

    if (fixture) {
      Object.assign(fixture, fixtureData);
      await fixture.save();
    } else {
      const existingManualFixture = await Fixture.findOne({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        competition: fixtureData.competition,
        matchDate: fixtureData.matchDate,
      });

      if (existingManualFixture) {
        skipped.push({
          fixtureId: apiFixtureId,
          reason: "An equivalent manual fixture already exists; it was left unchanged",
        });
        continue;
      }

      fixture = await Fixture.create({
        ...fixtureData,
        apiFootballFixtureId: apiFixtureId,
      });
    }

    imported.push(fixture._id.toString());
  }

  return {
    requested: (response.response || []).length,
    importedOrUpdated: imported.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  };
}

// Import finished matches as results.
// Only final-score statuses are processed.
async function syncResults({ leagueId, season }) {
  if (!Number.isInteger(Number(leagueId)) || !Number.isInteger(Number(season))) {
    throw new Error("Valid leagueId and season are required.");
  }

  const response = await footballApiRequest("/fixtures", {
    league: Number(leagueId),
    season: Number(season),
    last: 20,
  });

  const imported = [];
  const skipped = [];

  for (const item of response.response || []) {
    const apiFixtureId = item.fixture?.id;
    const status = item.fixture?.status?.short;

    if (!apiFixtureId || !["FT", "AET", "PEN"].includes(status)) {
      skipped.push({
        fixtureId: apiFixtureId || null,
        reason: "Match is not confirmed finished",
      });
      continue;
    }

    const homeApiId = item.teams?.home?.id;
    const awayApiId = item.teams?.away?.id;
    const homeScore = item.goals?.home;
    const awayScore = item.goals?.away;

    if (
      !homeApiId ||
      !awayApiId ||
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore)
    ) {
      skipped.push({ fixtureId: apiFixtureId, reason: "Missing team IDs or final scores" });
      continue;
    }

    const [homeTeam, awayTeam] = await Promise.all([
      Team.findOne({ apiFootballId: homeApiId, isActive: true }),
      Team.findOne({ apiFootballId: awayApiId, isActive: true }),
    ]);

    if (!homeTeam || !awayTeam) {
      skipped.push({
        fixtureId: apiFixtureId,
        reason: "Both teams must be mapped to existing Cabby Sports teams first",
      });
      continue;
    }

    const resultData = {
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      competition: item.league?.name || "Football",
      matchDate: new Date(item.fixture.date),
      homeScore,
      awayScore,
      venue: item.fixture.venue?.name || "",
      status: "Completed",
      matchweek: item.league?.round
        ? Number(String(item.league.round).match(/\d+/)?.[0]) || undefined
        : undefined,
      description: "Result data synced from API-Football",
    };

    let result = await Result.findOne({ apiFootballFixtureId: apiFixtureId });

    if (result) {
      Object.assign(result, resultData);
      await result.save();
    } else {
      const existingManualResult = await Result.findOne({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        competition: resultData.competition,
        matchDate: resultData.matchDate,
      });

      if (existingManualResult) {
        skipped.push({
          fixtureId: apiFixtureId,
          reason: "An equivalent manual result already exists; it was left unchanged",
        });
        continue;
      }

      result = await Result.create({
        ...resultData,
        apiFootballFixtureId: apiFixtureId,
      });
    }

    imported.push(result._id.toString());
  }

  return {
    requested: (response.response || []).length,
    importedOrUpdated: imported.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  };
}

module.exports = {
  syncFixtures,
  syncResults,
};
