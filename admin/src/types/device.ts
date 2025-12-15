export type DeviceStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "PAIRED" | "UNPAIRED";

export interface Device {
  id: string;
  serialNumber: string;
  deviceCode: string;
  status: DeviceStatus;
  firmwareVersion: string;
  lastOnline: string | null;
  elder?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateDevicePayload {
  serialNumber: string;
  firmwareVersion: string;
}

