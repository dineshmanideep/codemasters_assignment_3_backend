import {defineConfig} from 'drizzle-kit'

export default defineConfig({
    dialect:'postgresql',
    out:'./src/drizzle',
    schema:'./src/drizzle/schema.ts',
    dbCredentials: {
        url: 'postgresql://neondb_owner:32moOQXzpGNY@ep-lively-cloud-a5hc1x9o.us-east-2.aws.neon.tech/neondb?sslmode=require'
    },
    verbose: true,
    strict: true
})