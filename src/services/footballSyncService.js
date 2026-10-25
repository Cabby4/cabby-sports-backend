
const { footballApiRequest } = require("./footballApi");
const Team = require("../models/Team");
const Fixture = require("../models/Fixture");
const Result = require("../models/Result");

function mapFixtureStatus(short) {
  if (short === "PST") return "Postponed";

  if (["CANC", "ABD", "AWD", "WO"].includes(short)) {
    return "Cancelled";
  }

  return "Scheduled";
}

// Use the selected season's August-to-May date range.
function getSeasonDates(season) {
  return {
    from: `${season}-08-01`,
    to: `${Number(season) + 1}-05-31`,
  };
}

async function getLeagueFixtures(leagueId, season) {
  const dates = getSeasonDates(season);

  return footballApiRequest("/fixtures", {
    league: Number(leagueId),
    season: Number(season),
    ...dates,
  });
}

async function findMappedTeams(item) {
  const homeApiId = item.teams?.home?.id;
  const awayApiId = item.teams?.away?.id;

  if (!homeApiId || !awayApiId) return null;

  const [homeTeam, awayTeam] = await Promise.all([
    Team.findOne({ apiFootballId: homeApiId, isActive: true }),
    Team.findOne({ apiFootballId: awayApiId, isActive: true }),
  ]);

  if (!homeTeam || !awayTeam) return null;

  return { homeTeam, awayTeam };
}

function getMatchweek(round) {
  if (!round) return undefined;

  return Number(String(round).match(/\d+/)?.[0]) || undefined;
}

async function syncFixtures({ leagueId, season }) {
  if (
    !Number.isInteger(Number(leagueId)) ||
    Number(leagueId) <= 0 ||
    !Number.isInteger(Number(season)) ||
    Number(season) < 2000 ||
    Number(season) > 2100
  ) {
    throw new Error("Valid leagueId and season are required.");
  }

  const response = await getLeagueFixtures(leagueId, season);
  const items = response.response || [];
  let importedOrUpdated = 0;
  const skippedDetails = [];

  for (const item of items) {
    const apiFixtureId = item.fixture?.id;

    if (!apiFixtureId || !item.fixture?.date) {
      skippedDetails.push({
        fixtureId: apiFixtureId || null,
        reason: "Missing fixture ID or date",
      });
      continue;
    }

    const teams = await findMappedTeams(item);

    if (!teams) {
      skippedDetails.push({
        fixtureId: apiFixtureId,
        reason: "Teams are not both mapped to existing Cabby Sports teams",
      });
      continue;
    }

    const { homeTeam, awayTeam } = teams;

    const fixtureData = {
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      competition: item.league?.name || "Football",
      matchDate: new Date(item.fixture.date),
      venue: item.fixture.venue?.name || "",
      status: mapFixtureStatus(item.fixture.status?.short),
      matchweek: getMatchweek(item.league?.round),
      description: "Fixture data synced from API-Football",
    };

    let fixture = await Fixture.findOne({
      apiFootballFixtureId: apiFixtureId,
    });

    if (fixture) {
      Object.assign(fixture, fixtureData);
      await fixture.save();
    } else {
      const manualFixture = await Fixture.findOne({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        competition: fixtureData.competition,
        matchDate: fixtureData.matchDate,
      });

      if (manualFixture) {
        skippedDetails.push({
          fixtureId: apiFixtureId,
          reason: "Equivalent manual fixture left unchanged",
        });
        continue;
      }

      await Fixture.create({
        ...fixtureData,
        apiFootballFixtureId: apiFixtureId,
      });
    }

    importedOrUpdated++;
  }

  return {
    requested: items.length,
    importedOrUpdated,
    skipped: skippedDetails.length,
    skippedDetails,
  };
}

async function syncResults({ leagueId, season }) {
  if (
    !Number.isInteger(Number(leagueId)) ||
    Number(leagueId) <= 0 ||
    !Number.isInteger(Number(season)) ||
    Number(season) < 2000 ||
    Number(season) > 2100
  ) {
    throw new Error("Valid leagueId and season are required.");
  }

  const response = await getLeagueFixtures(leagueId, season);
  const items = response.response || [];
  let importedOrUpdated = 0;
  const skippedDetails = [];

  for (const item of items) {
    const apiFixtureId = item.fixture?.id;
    const status = item.fixture?.status?.short;

    if (!apiFixtureId || !["FT", "AET", "PEN"].includes(status)) {
      continue;
    }

    const homeScore = item.goals?.home;
    const awayScore = item.goals?.away;

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore)
    ) {
      skippedDetails.push({
        fixtureId: apiFixtureId,
        reason: "Missing final scores",
      });
      continue;
    }

    const teams = await findMappedTeams(item);

    if (!teams) {
      skippedDetails.push({
        fixtureId: apiFixtureId,
        reason: "Teams are not both mapped to existing Cabby Sports teams",
      });
      continue;
    }

    const { homeTeam, awayTeam } = teams;

    const resultData = {
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      competition: item.league?.name || "Football",
      matchDate: new Date(item.fixture.date),
      homeScore,
      awayScore,
      venue: item.fixture.venue?.name || "",
      status: "Completed",
      matchweek: getMatchweek(item.league?.round),
      description: "Result data synced from API-Football",
    };

    let result = await Result.findOne({
      apiFootballFixtureId: apiFixtureId,
    });

    if (result) {
      Object.assign(result, resultData);
      await result.save();
    } else {
      const manualResult = await Result.findOne({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        competition: resultData.competition,
        matchDate: resultData.matchDate,
      });

      if (manualResult) {
        skippedDetails.push({
          fixtureId: apiFixtureId,
          reason: "Equivalent manual result left unchanged",
        });
        continue;
      }

      await Result.create({
        ...resultData,
        apiFootballFixtureId: apiFixtureId,
      });
    }

    importedOrUpdated++;
  }

  return {
    requested: items.length,
    importedOrUpdated,
    skipped: skippedDetails.length,
    skippedDetails,
  };
}

module.exports = {
  syncFixtures,
  syncResults,
};
