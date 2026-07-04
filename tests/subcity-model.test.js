const test = require('node:test');
const assert = require('node:assert/strict');
const models = require('../models');

test('models index exports Subcity model', () => {
  assert.ok(models.Subcity, 'Expected models.Subcity to be defined');
});
