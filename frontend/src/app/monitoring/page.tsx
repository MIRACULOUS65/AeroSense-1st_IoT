'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SensorData {
    temperature: number | null;
    humidity: number | null;
    mq135_raw: number | null;
    air_quality: string | null;
    timestamp: string | null;
    connected: boolean;
}

export default function MonitoringPage() {
    const [sensorData, setSensorData] = useState<SensorData>({
        temperature: null,
        humidity: null,
        mq135_raw: null,
        air_quality: null,
        timestamp: null,
        connected: false,
    });
    const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        function connect() {
            try {
                ws = new WebSocket('ws://localhost:8080');

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setWsStatus('connected');
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        setSensorData(data);
                    } catch (err) {
                        console.error('Error parsing WebSocket data:', err);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setWsStatus('disconnected');
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setWsStatus('disconnected');

                    // Attempt to reconnect after 3 seconds
                    reconnectTimeout = setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000);
                };
            } catch (err) {
                console.error('Failed to create WebSocket:', err);
                setWsStatus('disconnected');
            }
        }

        connect();

        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, []);

    const getTimeAgo = (timestamp: string | null) => {
        if (!timestamp) return 'Never';
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 5) return 'Just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        return `${Math.floor(seconds / 60)} minutes ago`;
    };

    const getAirQualityColor = (quality: string | null) => {
        switch (quality) {
            case 'Excellent': return 'text-black';
            case 'Good': return 'text-black';
            case 'Moderate': return 'text-black';
            case 'Poor': return 'text-black';
            case 'Hazardous': return 'text-black';
            default: return 'text-black';
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white">
                <nav className="container mx-auto flex items-center justify-between px-6 py-4">
                    <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
                        AeroSense
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/#about" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            About
                        </Link>
                        <Link href="/features" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Features
                        </Link>
                        <Link href="/#contact" className="text-sm font-medium hover:opacity-70 transition-opacity">
                            Contact
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-16 border-b border-black">
                    <div className="max-w-4xl">
                        <h1 className="font-playfair text-5xl md:text-6xl font-bold leading-tight mb-4">
                            Real-time Environmental Monitoring
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed font-light mb-6">
                            Live sensor data from DHT11 and MQ135 sensors
                        </p>

                        {/* Connection Status */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${wsStatus === 'connected' ? 'bg-black' :
                                    wsStatus === 'connecting' ? 'bg-black opacity-50' :
                                        'bg-white border-2 border-black'
                                    }`} />
                                <span className="text-sm font-medium">
                                    WebSocket: {wsStatus === 'connected' ? 'Connected' :
                                        wsStatus === 'connecting' ? 'Connecting...' :
                                            'Disconnected'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${sensorData.connected ? 'bg-black' : 'bg-white border-2 border-black'
                                    }`} />
                                <span className="text-sm font-medium">
                                    Arduino: {sensorData.connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sensor Data Grid */}
                <section className="container mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Temperature Card */}
                        <div className="border border-black p-8 hover:bg-black hover:text-white transition-all">
                            <div className="text-sm font-medium mb-2 opacity-70">TEMPERATURE</div>
                            <div className="font-playfair text-5xl font-bold mb-2">
                                {sensorData.temperature !== null ? sensorData.temperature.toFixed(1) : '--'}
                            </div>
                            <div className="text-lg font-light">°C</div>
                        </div>

                        {/* Humidity Card */}
                        <div className="border border-black p-8 hover:bg-black hover:text-white transition-all">
                            <div className="text-sm font-medium mb-2 opacity-70">HUMIDITY</div>
                            <div className="font-playfair text-5xl font-bold mb-2">
                                {sensorData.humidity !== null ? sensorData.humidity.toFixed(1) : '--'}
                            </div>
                            <div className="text-lg font-light">%</div>
                        </div>

                        {/* AQI Card */}
                        <div className="border border-black p-8 hover:bg-black hover:text-white transition-all">
                            <div className="text-sm font-medium mb-2 opacity-70">AIR QUALITY</div>
                            <div className="font-playfair text-5xl font-bold mb-2">
                                {sensorData.mq135_raw !== null ? sensorData.mq135_raw : '--'}
                            </div>
                            <div className="text-lg font-light">RAW VALUE</div>
                        </div>
                    </div>

                    {/* Air Quality Status */}
                    <div className="border border-black p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm font-medium mb-2 opacity-70">AIR QUALITY STATUS</div>
                                <div className={`font-playfair text-3xl font-bold ${getAirQualityColor(sensorData.air_quality)}`}>
                                    {sensorData.air_quality || 'Unknown'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium mb-1 opacity-70">LAST UPDATE</div>
                                <div className="text-lg font-light">
                                    {getTimeAgo(sensorData.timestamp)}
                                </div>
                            </div>
                        </div>

                        {/* Quality Scale */}
                        <div className="border-t border-black pt-4 mt-4">
                            <div className="text-xs font-medium mb-2">QUALITY SCALE</div>
                            <div className="flex gap-2 text-xs">
                                <div className="flex-1 border border-black p-2 text-center">Excellent<br />&lt;150</div>
                                <div className="flex-1 border border-black p-2 text-center">Good<br />150-250</div>
                                <div className="flex-1 border border-black p-2 text-center">Moderate<br />250-350</div>
                                <div className="flex-1 border border-black p-2 text-center">Poor<br />350-450</div>
                                <div className="flex-1 border border-black p-2 text-center">Hazardous<br />&gt;450</div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {!sensorData.connected && (
                        <div className="mt-8 border border-black p-8 bg-black text-white">
                            <h3 className="font-playfair text-2xl font-bold mb-4">Arduino Not Connected</h3>
                            <div className="space-y-2 font-light">
                                <p>To see live sensor data:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-4">
                                    <li>Connect your Arduino to your PC via USB</li>
                                    <li>Upload the sensor sketch to Arduino</li>
                                    <li>Start the backend server: <code className="bg-white text-black px-2 py-1 font-mono text-sm">cd backend && npm install && npm start</code></li>
                                    <li>Configure the correct COM port in backend/.env file</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-black bg-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm font-light">
                        © 2025 Environmental Analysis Project. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
