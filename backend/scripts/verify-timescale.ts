import prisma from '../src/prisma.js';
import createDebug from 'debug';

const log = createDebug('fallhelp:verify');

// Fix BigInt serialization for console.table/JSON
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

async function main() {
    log('🔍 Verifying TimescaleDB Setup...');

    try {
        // 1. Check Extension
        console.log('\n--- 1. Checking Extension ---');
        const extensions = await prisma.$queryRaw`
            SELECT extname, extversion FROM pg_extension WHERE extname = 'timescaledb';
        `;
        console.table(extensions);

        // 2. Check Hypertable
        console.log('\n--- 2. Checking Hypertable (events) ---');
        const hypertables = await prisma.$queryRaw`
            SELECT hypertable_schema, hypertable_name 
            FROM timescaledb_information.hypertables 
            WHERE hypertable_name = 'events';
        `;
        console.table(hypertables);

        // 3. Check Continuous Aggregates
        console.log('\n--- 3. Checking Continuous Aggregates (events_daily_summary) ---');
        const aggregates = await prisma.$queryRaw`
            SELECT view_schema, view_name 
            FROM timescaledb_information.continuous_aggregates 
            WHERE view_name = 'events_daily_summary';
        `;
        console.table(aggregates);

        // 4. Check Jobs (Policies)
        console.log('\n--- 4. Checking Jobs (Policies) ---');
        const jobs = await prisma.$queryRaw`
            SELECT hypertable_name, schedule_interval::text 
            FROM timescaledb_information.jobs 
            WHERE hypertable_name = 'events' OR hypertable_name = 'events_daily_summary';
        `;
        console.table(jobs);

        console.log('\n✅ Verification Complete!');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
