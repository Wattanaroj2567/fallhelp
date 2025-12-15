/**
 * @fileoverview Device Service
 * @description Handles device pairing, configuration, and WiFi setup
 */

import { apiClient, toApiError } from './api';
import type { ApiResponse, Device, DeviceConfig } from './types';

export type CreateDevicePayload = {
  deviceCode: string;
  serialNumber: string;
  firmwareVersion?: string;
};

export type PairDevicePayload = {
  deviceCode: string;
  elderId: string;
};

export type UnpairDevicePayload = {
  deviceId: string;
};

export type WifiConfigPayload = {
  ssid: string;
  wifiPassword: string;
};

export type UpdateDeviceConfigPayload = Partial<
  Pick<
    DeviceConfig,
    | 'fallThreshold'
    | 'hrLowThreshold'
    | 'hrHighThreshold'
    | 'fallCancelTime'
    | 'ssid'
    | 'wifiPassword'
  >
>;

export async function createDevice(payload: CreateDevicePayload): Promise<Device> {
  try {
    const { data } = await apiClient.post<ApiResponse<Device>>('/api/devices', payload);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getPairingQr(deviceCode: string): Promise<{ qr: string }> {
  try {
    const { data } = await apiClient.get<ApiResponse<{ qr: string }>>(
      `/api/devices/qr/${deviceCode}`,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function pairDevice(payload: PairDevicePayload): Promise<Device> {
  try {
    const { data } = await apiClient.post<ApiResponse<Device>>('/api/devices/pair', payload);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function unpairDevice(payload: UnpairDevicePayload): Promise<Device> {
  try {
    const { data } = await apiClient.delete<ApiResponse<Device>>(
      `/api/devices/${payload.deviceId}/unpair`,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getDeviceConfig(deviceId: string): Promise<DeviceConfig> {
  try {
    const { data } = await apiClient.get<ApiResponse<DeviceConfig>>(
      `/api/devices/${deviceId}/config`,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateDeviceConfig(
  deviceId: string,
  payload: UpdateDeviceConfigPayload,
): Promise<DeviceConfig> {
  try {
    const { data } = await apiClient.put<ApiResponse<DeviceConfig>>(
      `/api/devices/${deviceId}/config`,
      payload,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function configureWifi(deviceId: string, payload: WifiConfigPayload) {
  try {
    const { data } = await apiClient.put<ApiResponse<{ success: boolean }>>(
      `/api/devices/${deviceId}/wifi`,
      payload,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}
