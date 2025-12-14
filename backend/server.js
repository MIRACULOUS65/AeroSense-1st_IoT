const express = require('express');
const { WebSocketServer } = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM3';
const BAUD_RATE = parseInt(process.env.BAUD_RATE) || 9600;
const WS_PORT = parseInt(process.env.WS_PORT) || 8080;
const HTTP_PORT = parseInt(process.env.HTTP_PORT) || 3001;

// Store latest sensor data
let latestSensorData = {
    temperature: null,
    humidity: null,
    mq135_raw: null,
    air_quality: null,
    timestamp: null,
    connected: false
};

// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on port ${WS_PORT}`);

// Broadcast to all connected WebSocket clients
function broadcastData(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN state
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    // Send latest data immediately on connection
    ws.send(JSON.stringify(latestSensorData));

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Serial Port Setup
let serialPort;
let parser;

function connectToArduino() {
    try {
        serialPort = new SerialPort({
            path: SERIAL_PORT,
            baudRate: BAUD_RATE,
        });

        parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

        serialPort.on('open', () => {
            console.log(`✓ Connected to Arduino on ${SERIAL_PORT} at ${BAUD_RATE} baud`);
            latestSensorData.connected = true;
            broadcastData({ ...latestSensorData, status: 'connected' });
        });

        serialPort.on('error', (err) => {
            console.error('Serial Port Error:', err.message);
            latestSensorData.connected = false;

            // Retry connection after 5 seconds
            setTimeout(() => {
                console.log('Retrying Arduino connection...');
                connectToArduino();
            }, 5000);
        });

        serialPort.on('close', () => {
            console.log('Serial port closed');
            latestSensorData.connected = false;
            broadcastData({ ...latestSensorData, status: 'disconnected' });
        });

        // Parse incoming data from Arduino
        parser.on('data', (line) => {
            try {
                // Arduino sends JSON format: { "temperature": 25.5, "humidity": 60, ... }
                const trimmedLine = line.trim();

                if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
                    const data = JSON.parse(trimmedLine);

                    // Update latest sensor data
                    latestSensorData = {
                        temperature: data.temperature,
                        humidity: data.humidity,
                        mq135_raw: data.mq135_raw,
                        air_quality: data.air_quality,
                        timestamp: new Date().toISOString(),
                        connected: true
                    };

                    console.log('Sensor Data:', latestSensorData);

                    // Broadcast to all WebSocket clients
                    broadcastData(latestSensorData);
                }
            } catch (err) {
                console.error('Error parsing Arduino data:', err.message);
            }
        });

    } catch (err) {
        console.error('Failed to connect to Arduino:', err.message);
        latestSensorData.connected = false;

        // Retry connection after 5 seconds
        setTimeout(() => {
            console.log('Retrying Arduino connection...');
            connectToArduino();
        }, 5000);
    }
}

// REST API Endpoints
app.get('/api/sensor-data', (req, res) => {
    res.json(latestSensorData);
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        arduino_connected: latestSensorData.connected,
        serial_port: SERIAL_PORT,
        websocket_port: WS_PORT
    });
});

// Start HTTP Server
app.listen(HTTP_PORT, () => {
    console.log(`HTTP API server running on http://localhost:${HTTP_PORT}`);
    console.log(`Endpoints:`);
    console.log(`  - GET /api/sensor-data`);
    console.log(`  - GET /api/health`);
});

// Start Arduino connection
console.log(`\nAttempting to connect to Arduino on ${SERIAL_PORT}...`);
connectToArduino();
