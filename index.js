'use strict';
const en = require('./cards/en');
const { createDatabase } = require('./lib/database');
module.exports = { en, database: createDatabase() };
