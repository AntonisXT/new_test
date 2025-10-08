const request = require('supertest');

// We require the server after setting NODE_ENV=test so it doesn't listen.
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Smoke tests', () => {
  it('serves API docs JSON', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    // Should be JSON and have openapi property at least
    expect(res.status).toBeLessThan(500);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('openapi');
  });

  it('handles not found with 404 or similar', async () => {
    const res = await request(app).get('/__definitely_not_a_route__');
    // Could be 404 or handled by error middleware—accept 4xx
    expect(String(res.status)).toMatch(/^4/);
  });
});
