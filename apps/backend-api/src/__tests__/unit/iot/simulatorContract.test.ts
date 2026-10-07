/**
 * Contract test: payload ของ apps/device-simulator ต้องผ่าน normalizer/validator ของ backend
 * - อ่าน fixture ร่วมจาก apps/device-simulator/src/contract/fixtures.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { normalizeUnifiedEvent } from '../../../iot/eventNormalizer';
import {
  validateFallPayload,
  validateHeartRatePayload,
  validateStatusPayload,
} from '../../../iot/payloadValidator';

const fixturesPath = path.resolve(
  __dirname,
  '../../../../../device-simulator/src/contract/fixtures.json',
);
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8')) as Record<string, unknown>;

const fixture = (name: string): Record<string, unknown> => {
  const value = fixtures[name];
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Missing contract fixture: ${name}`);
  }
  return value as Record<string, unknown>;
};

describe('device-simulator MQTT contract', () => {
  it('suspectedFall fixture normalizes to a suspected fall that passes validation', () => {
    const result = normalizeUnifiedEvent(fixture('suspectedFall'));
    expect(result.kind).toBe('fall');
    if (result.kind !== 'fall') return;
    expect(result.mode).toBe('suspected');
    expect(result.payload.bpm).toBe(88);
    expect(validateFallPayload(result.payload)).not.toBeNull();
  });

  it('fallConfirmed fixture normalizes to a confirmed fall that passes validation', () => {
    const result = normalizeUnifiedEvent(fixture('fallConfirmed'));
    expect(result.kind).toBe('fall');
    if (result.kind !== 'fall') return;
    expect(result.mode).toBe('confirmed');
    expect(result.payload.bpm).toBe(88);
    expect(validateFallPayload(result.payload)).not.toBeNull();
  });

  it('fallCancelled fixture normalizes to fallCancelled', () => {
    expect(normalizeUnifiedEvent(fixture('fallCancelled')).kind).toBe('fallCancelled');
  });

  it('heartRate fixture passes validation unchanged', () => {
    const payload = validateHeartRatePayload(fixture('heartRate'));
    expect(payload?.heartRate).toBe(88);
    expect(payload?.confidence).toBe('high');
  });

  it.each(['statusOnline', 'statusOffline'])('%s passes validation and keeps metadata', (name) => {
    const payload = validateStatusPayload(fixture(name));
    expect(payload).not.toBeNull();
    expect(payload?.online).toBe(name === 'statusOnline');
    expect(payload?.signalStrength).toBe(-55);
    expect(payload?.wifiSSID).toBe('FallHelp-Demo');
  });
});
