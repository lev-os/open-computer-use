import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureInputValue } from './act-value.mjs';
test('both renderer formats preserve exact text', () => {
  assert.equal(fixtureInputValue(' 5 text field ID: fixture-input, Value: xparity-0'), 'xparity-0');
  assert.equal(fixtureInputValue(' 4 text field (settable) Value: xparity-0, ID: fixture-input'), 'xparity-0');
  assert.equal(fixtureInputValue(' 4 text field (settable) fixture-input'), '');
});
test('extra whitespace and punctuation cannot pass as the expected token', () => {
  assert.equal(fixtureInputValue(' 5 text field ID: fixture-input, Value:  x '), ' x ');
  assert.equal(fixtureInputValue(' 4 text field Value: x , ID: fixture-input'), 'x ');
  assert.equal(fixtureInputValue(' 5 text field ID: fixture-input, Value: x,'), 'x,');
});
test('missing, focus-only and similarly named fields are not observations', () => {
  assert.equal(fixtureInputValue('The focused UI element is 4 text field ID: fixture-input, Value: x'), undefined);
  assert.equal(fixtureInputValue(' 5 text field ID: fixture-input-other, Value: x'), undefined);
});
