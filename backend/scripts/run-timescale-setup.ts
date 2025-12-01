/// <reference types="node" />
import prisma from '../src/prisma.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import createDebug from 'debug';

const log = createDebug('fallhelp:timescale');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    log('🚀 Starting TimescaleDB setup...');

    try {
        // 1. Try to enable extension first
        try {
            await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
            log('✅ TimescaleDB extension enabled.');
        } catch (error) {
            log('⚠️  Could not enable TimescaleDB extension.');
            log('   If you are using standard PostgreSQL, this is normal.');
            log('   The app will work fine without TimescaleDB optimizations.');
            log('   Skipping the rest of the setup.');
            return;
        }

        const sqlPath = path.join(__dirname, '..', 'prisma', 'timescale-setup.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        // Split commands by semicolon, but handle comments and empty lines
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        log('📝 Found %d commands to execute.', commands.length);

        for (const command of commands) {
            if (command.startsWith('--') || command.includes('CREATE EXTENSION')) continue;

            try {
                await prisma.$executeRawUnsafe(command);
                log('✅ Executed: %s...', command.substring(0, 50));
            } catch (error) {
                if (String(error).includes('already exists') || String(error).includes('if_not_exists')) {
                    log('⚠️  Skipped (Already exists): %s...', command.substring(0, 50));
                } else {
                    log('❌ Error executing: %s...', command.substring(0, 50));
                    // Don't throw, continue with other commands
                }
            }
        }

        log('🎉 TimescaleDB setup completed!');
    } catch (error) {
        log('❌ Fatal error: %O', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
