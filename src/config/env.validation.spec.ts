import { validateEnv } from './env.validation.js';

const DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/business_card?schema=public';

describe('validateEnv', () => {
  it('applies defaults and drops unrelated variables', () => {
    expect(validateEnv({ DATABASE_URL, HOME: '/home/app' })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL,
    });
  });

  it('coerces PORT to a number', () => {
    expect(validateEnv({ DATABASE_URL, PORT: '8080' }).PORT).toBe(8080);
  });

  it('accepts the short postgres:// scheme', () => {
    const url = 'postgres://user:secret@db:5432/business_card';
    expect(validateEnv({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
  });

  it('requires DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({})).toThrow(/is required/);
  });

  it('rejects a non-PostgreSQL DATABASE_URL', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'mysql://root@localhost/db' }),
    ).toThrow(/must be a PostgreSQL connection URL/);
  });

  it('reports every invalid variable at once', () => {
    expect(() =>
      validateEnv({ DATABASE_URL, NODE_ENV: 'staging', PORT: 'abc' }),
    ).toThrow(/NODE_ENV[\s\S]*PORT/);
  });
});
