// import { defineConfig } from '@prisma/internals';

export default defineConfig({
  datasource: {
    provider: 'cockroachdb',
    url: process.env.DATABASE_URL,
  },
});
