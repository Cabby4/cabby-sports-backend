const Joi = require("joi");

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