"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    out: './src/drizzle',
    schema: './src/drizzle/schema.ts',
    dbCredentials: {
        url: 'postgresql://neondb_owner:32moOQXzpGNY@ep-lively-cloud-a5hc1x9o.us-east-2.aws.neon.tech/neondb?sslmode=require'
    },
    verbose: true,
    strict: true
});
