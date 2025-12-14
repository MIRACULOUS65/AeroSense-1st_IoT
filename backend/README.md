# Environmental Analysis Project - Backend Server

Real-time Arduino sensor data streaming service.

## Overview

This backend service reads sensor data from an Arduino connected via USB serial port and streams it to web clients using WebSocket.

## Features

- **Serial Port Communication**: Reads data from Arduino (DHT11 + MQ135 sensors)
- **WebSocket Streaming**: Real-time data broadcasting to connected clients
- **REST API**: HTTP endpoints for sensor data and health checks
- **Auto-Reconnection**: Automatically reconnects if Arduino disconnects
- **Error Handling**: Robust error handling and logging

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Serial Port

Edit `.env` file and set your Arduino's COM port:

```env
SERIAL_PORT=COM3  # Change to your Arduino's port
BAUD_RATE=9600
WS_PORT=8080
HTTP_PORT=3001
```

**Finding your COM port:**
- **Windows**: Open Device Manager → Ports (COM & LPT) → Look for "Arduino" or "USB Serial"
- **Mac/Linux**: Run `ls /dev/tty.*` in terminal

### 3. Start the Server

```bash
npm start
```

**Expected output:**
```
HTTP API server running on http://localhost:3001
WebSocket server running on port 8080
Attempting to connect to Arduino on COM3...
✓ Connected to Arduino on COM3 at 9600 baud
```

## API Endpoints

### GET /api/sensor-data
Returns the latest sensor readings.

**Response:**
```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "mq135_raw": 120,
  "air_quality": "Good",
  "timestamp": "2025-12-12T06:15:00.000Z",
  "connected": true
}
```

### GET /api/health
Server health check.

**Response:**
```json
{
  "status": "ok",
  "arduino_connected": true,
  "serial_port": "COM3",
  "websocket_port": 8080
}
```

## WebSocket Connection

Connect to `ws://localhost:8080` to receive real-time sensor updates.

**Message format:**
```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "mq135_raw": 120,
  "air_quality": "Good",
  "timestamp": "2025-12-12T06:15:00.000Z",
  "connected": true
}
```

## Troubleshooting

### "Cannot find module 'serialport'"
Run `npm install` in the backend directory.

### "Error: Port is not open"
- Check if Arduino is connected via USB
- Verify the correct COM port in `.env`
- Close Arduino Serial Monitor (it locks the port)
- Check if another program is using the serial port

### "Connection refused" on WebSocket
Make sure the backend server is running on port 8080.

### No data appearing
- Upload the Arduino sketch first
- Open Arduino Serial Monitor to verify data output
- Check the data format matches JSON: `{ "temperature": ..., ... }`

## Dependencies

- `express` - Web server framework
- `ws` - WebSocket server
- `serialport` - Arduino USB serial communication
- `dotenv` - Environment configuration
- `cors` - Cross-origin resource sharing

## Arduino Requirements

The Arduino must send data in JSON format via Serial at 9600 baud:

```
{ "temperature": 25.5, "humidity": 60, "mq135_raw": 120, "air_quality": "Good" }
```

See `/iot/sketch_dec11a.ino` for the Arduino code.
