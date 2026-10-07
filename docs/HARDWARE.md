# Hardware

Device components and wiring. Firmware: [firmware/esp32](../firmware/esp32/README.md).

## Hardware Components

### Microcontroller & Sensors

| Component       | Model                              | Purpose                                    |
| --------------- | ---------------------------------- | ------------------------------------------ |
| Microcontroller | ESP32-DevKitC V4 (ESP32-WROOM-32U) | Main processing unit, WiFi, BLE            |
| IMU Sensor      | GY-521 MPU6050                     | Fall detection (Accelerometer + Gyroscope) |
| Pulse Sensor    | XD-58C                             | Heart rate monitoring (PPG)                |

### Power System

| Component       | Model                   | Purpose                                |
| --------------- | ----------------------- | -------------------------------------- |
| Battery         | LiPo 3.7V 1200mAh       | Main power source                      |
| Charging Module | TP4056 LiPo             | USB charging with LED status indicator |
| Power Module    | Step-Up Boost 3.7V → 5V | Voltage conversion for 5V components   |

### Peripheral Components

| Component                       | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| Large Push Button Module        | False alarm cancellation (15s window)   |
| Grove - Speaker                 | Audible alert on fall detection         |
| Slide Switch SS12D00 G4 (3-Pin) | Device power on/off                     |
| Easy Earclip Mount              | Stable PPG sensor attachment at earlobe |
| PCB Circuit Board               | Component integration                   |
| Neck Strap                      | Wearable form factor for elderly user   |

### Passive & Protection Components

> This group is critical for **noise reduction** and **component protection**. Bypass capacitors suppress voltage spikes from the switching power module; bulk capacitors stabilize rail voltage under sudden load changes; the pull-down resistor eliminates floating-signal false triggers on the Grove - Speaker SIG line; and insulation / adhesive materials protect the PCB from short circuits caused by the LiPo battery.

| Component               | Value / Spec             | Placement                                          |
| ----------------------- | ------------------------ | -------------------------------------------------- |
| Electrolytic Capacitor  | 1000 µF 16V              | Close to VIN / GND pins of ESP32                   |
| Electrolytic Capacitor  | 470 µF 16V               | Close to VCC of Grove - Speaker Module               |
| Ceramic Capacitor (104) | 0.1 µF (100 nF)          | Bypass — close to IC pins of ESP32, MPU6050        |
| Resistor                | 10 kΩ                    | Pull-down on Grove - Speaker SIG to GND              |
| Kapton Tape             | Heat-resistant insulator | Applied on PCB surface before mounting the battery |
| Double-sided Tape       | Adhesive mount           | Securing the LiPo battery to the board             |

### Development & Testing Hardware

| Hardware    | Spec                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| Dev Machine | Acer Nitro V 15, Intel i5-13420H, 32GB RAM, RTX 2050, Ubuntu 24.04 LTS |
| Test Phone  | OPPO A31 2020, Android 9.0, 4GB RAM                                    |

## Hardware Wiring Overview

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./assets/readme/iot-device-wiring.png" alt="FallHelp IoT device wiring diagram" width="860" />
</p>
<!-- markdownlint-enable MD033 -->

The prototype device wiring combines the ESP32, MPU6050 IMU, XD-58C pulse sensor, Grove speaker module, wearer-only cancel button, LiPo battery, charging module, step-up converter, and stabilization/protection components.
