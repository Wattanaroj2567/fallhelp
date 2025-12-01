import mqtt, { MqttClient } from 'mqtt';
import createDebug from 'debug';
import { fallHandler } from './handlers/fallHandler';
import { heartRateHandler } from './handlers/heartRateHandler';
import { statusHandler } from './handlers/statusHandler';
import { MQTT_TOPICS } from './topics';

// ==========================================
// 📡 LAYER: Interface (IoT)
// Purpose: Manage MQTT connection and route incoming device messages
// ==========================================

class MQTTClientManager {
  private client: MqttClient | null = null;
  private isConnected: boolean = false;
  private log = createDebug('fallhelp:mqtt');
  private logMsg = createDebug('fallhelp:mqtt:msg');

  /**
   * Connect to MQTT broker
   */
  async connect(): Promise<void> {
    // Check if MQTT is disabled (for simulator mode)
    if (process.env.MQTT_DISABLED === 'true') {
      this.log('MQTT is disabled by configuration (Simulator Mode)');
      return;
    }

    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const clientId = `fallhelp-backend-${Math.random().toString(16).slice(2, 10)}`;

    const options: mqtt.IClientOptions = {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: process.env.MQTT_USERNAME || undefined,
      password: process.env.MQTT_PASSWORD || undefined,
      reconnectPeriod: 1000,
    };

    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        this.log('MQTT Client connected to broker');
        this.isConnected = true;
        this.subscribeToTopics();
        resolve();
      });

      this.client.on('error', (error) => {
        this.log('MQTT Connection error: %O', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('offline', () => {
        this.log('MQTT Client offline');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        this.log('MQTT Client reconnecting...');
      });

      this.client.on('message', this.handleMessage.bind(this));
    });
  }

  /**
   * Subscribe to all device topics
   */
  private subscribeToTopics(): void {
    if (!this.client) return;

    const topics = [
      MQTT_TOPICS.FALL_DETECTION_WILDCARD,
      MQTT_TOPICS.HEART_RATE_WILDCARD,
      MQTT_TOPICS.DEVICE_STATUS_WILDCARD,
    ];

    topics.forEach((topic) => {
      this.client!.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          this.log('Failed to subscribe to %s: %O', topic, error);
        } else {
          this.log('Subscribed to %s', topic);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    try {
      const message = payload.toString();
      this.logMsg('Message received on %s: %s', topic, message);

      // Parse JSON payload
      let data: any;
      try {
        data = JSON.parse(message);
      } catch (e) {
        this.logMsg('Invalid JSON payload: %s', message);
        return;
      }

      // Extract deviceId from topic (e.g., "device/DEV12345/fall")
      const deviceId = this.extractDeviceId(topic);
      if (!deviceId) {
        this.log('Could not extract deviceId from topic: %s', topic);
        return;
      }

      // Route to appropriate handler based on topic
      if (topic.includes('/fall')) {
        await fallHandler(deviceId, data);
      } else if (topic.includes('/heartrate')) {
        await heartRateHandler(deviceId, data);
      } else if (topic.includes('/status')) {
        await statusHandler(deviceId, data);
      } else {
        this.log('Unknown topic: %s', topic);
      }
    } catch (error) {
      this.log('Error handling MQTT message: %O', error);
    }
  }

  /**
   * Extract deviceId from topic
   */
  private extractDeviceId(topic: string): string | null {
    const parts = topic.split('/');
    if (parts.length >= 2 && parts[0] === 'device') {
      return parts[1];
    }
    return null;
  }

  /**
   * Publish message to a topic
   */
  publish(topic: string, message: string | object): void {
    if (!this.client || !this.isConnected) {
      this.log('MQTT Client not connected');
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    this.client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        this.log('Failed to publish to %s: %O', topic, error);
      } else {
        this.log('Published to %s: %s', topic, payload);
      }
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client) {
        resolve();
        return;
      }

      this.client.end(false, {}, () => {
        this.log('MQTT Client disconnected');
        this.isConnected = false;
        resolve();
      });
    });
  }

  /**
   * Check if client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const mqttClient = new MQTTClientManager();
