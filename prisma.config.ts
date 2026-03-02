import { defineConfig } from '@prisma/config';
export default {
  datasource: {
    provider: 'cockroachdb',
    url: process.env.DATABASE_URL,
  },
};
