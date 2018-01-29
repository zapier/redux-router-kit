import test from 'ava';
import 'babel-core/register';

import isOnlyHrefHashChange from 'redux-router-kit/src/utils/isOnlyHrefHashChange';

test('will return `false` if the first or second location do not exist', t => {
  const locationA = undefined;
  const locationB = undefined;

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = false;

  t.is(result, expected);
});

test('will return `false` if the first or second location does not contain a hash', t => {
  const locationA = 'http://www.localhost:8000/app/explore';
  const locationB = 'http://www.localhost:8000/app/explore';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = false;

  t.is(result, expected);
});

test('will return `true` if both strings contain a hash and the base values are the same', t => {
  const locationA = 'http://www.localhost:8000/app/explore/#/hello-world';
  const locationB =
    'http://www.localhost:8000/app/explore/#/hello-world-part-2';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = true;

  t.is(result, expected);
});

test('will return `false` if both strings contain a hash and the base values are different', t => {
  const locationA = 'http://www.localhost:8000/app/contact-us/#/hello-world';
  const locationB = 'http://www.localhost:8000/app/explore/#/hello-world';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = false;

  t.is(result, expected);
});

test('will return `true` if the base values are identical and only the first string contains a hash', t => {
  const locationA = 'http://www.localhost:8000/app/explore/#/hello-world';
  const locationB = 'http://www.localhost:8000/app/explore/';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = true;

  t.is(result, expected);
});

test('will return `true` if the base values are identical and only the second string contains a hash', t => {
  const locationA = 'http://www.localhost:8000/app/explore/';
  const locationB = 'http://www.localhost:8000/app/explore/#/hello-world';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = true;

  t.is(result, expected);
});

test('will return `false` if the base values are different and only the first string contains a hash', t => {
  const locationA = 'http://www.localhost:8000/app/explore/#/hello-world';
  const locationB = 'http://www.localhost:8000/app/contact-us/';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = false;

  t.is(result, expected);
});

test('will return `false` if the base values are different and only the second string contains a hash', t => {
  const locationA = 'http://www.localhost:8000/app/contact-us/';
  const locationB = 'http://www.localhost:8000/app/explore/#/hello-world';

  const result = isOnlyHrefHashChange(locationA, locationB);
  const expected = false;

  t.is(result, expected);
});
