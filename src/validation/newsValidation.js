
const Joi = require("joi");

const sectionField = Joi.string().valid(
  "football",
  "africa",
  "grassroots"
);

const competitionField = Joi.string().valid(
  "caf-champions-league",
  "caf-confederation-cup",
  "domestic-league",
  "other"
);

const countryField = Joi.string()
  .trim()
  .lowercase()
  .max(100);

const grassrootsTypeField = Joi.string().valid(
  "news",
  "academy",
  "tournament",
  "player-profile"
);

const createNewsSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),

  slug: Joi.string().trim().lowercase().required(),

  summary: Joi.string().trim().min(10).max(500).required(),

  content: Joi.string().trim().min(20).required(),

  image: Joi.string().allow("").optional(),

  category: Joi.string()
    .valid(
      "Football",
      "Transfers",
      "Champions League",
      "Premier League",
      "La Liga",
      "Serie A",
      "International",
      "Other"
    )
    .required(),

  // New fields
  section: sectionField.optional(),

  competition: competitionField.optional(),

  country: countryField.optional(),

  grassrootsType: grassrootsTypeField.optional(),

  author: Joi.string().trim().optional(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  featured: Joi.boolean().optional(),

  published: Joi.boolean().optional(),
});

const updateNewsSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).optional(),

  slug: Joi.string().trim().lowercase().optional(),

  summary: Joi.string().trim().min(10).max(500).optional(),

  content: Joi.string().trim().min(20).optional(),

  image: Joi.string().allow("").optional(),

  category: Joi.string()
    .valid(
      "Football",
      "Transfers",
      "Champions League",
      "Premier League",
      "La Liga",
      "Serie A",
      "International",
      "Other"
    )
    .optional(),

  // New fields
  section: sectionField.optional(),

  competition: competitionField.optional(),

  country: countryField.optional(),

  grassrootsType: grassrootsTypeField.optional(),

  author: Joi.string().trim().optional(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  featured: Joi.boolean().optional(),

  published: Joi.boolean().optional(),
}).min(1);

module.exports = {
  createNewsSchema,
  updateNewsSchema,
};
