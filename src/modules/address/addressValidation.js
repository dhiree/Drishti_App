const Joi = require("joi");

const addressCreateV = {
  body: Joi.object().keys({
    title: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    pin: Joi.string(),
    lat: Joi.number(),
    long: Joi.number(),
    address: Joi.string(),
  }),
};

const addressUpdateV = {
  body: Joi.object().keys({
    title: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    pin: Joi.string(),
    lat: Joi.number(),
    long: Joi.number(),
    address: Joi.string(),
  }),
};

module.exports = {
  addressCreateV,
  addressUpdateV,
};
