import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFileName } from './upload';

test('sanitizeFileName strips unsafe characters and keeps the extension', () => {
  assert.equal(sanitizeFileName('My Image (1).png'), 'my-image-1.png');
  assert.equal(sanitizeFileName('../secret/hero.jpg'), 'hero.jpg');
});
