'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DayData {
    date: string;
    temp_max: number | null;
    temp_min: number | null;
    precipitation: number | null;
    wind_speed: number | null;
    pm10: number | null;
    pm2_5: number | null;
    co: number | null;
    ozone: number | null;
}

interface WeatherData {
    start: string;
    end: string;
    lat: string;
    lon: string;
    days: DayData[];
    totalDays: number;
    fromCache?: boolean;
}

export default function WeatherViewer() {
    const [start, setStart] = useState('2024-01-01');
    const [end, setEnd] = useState('2024-01-31');
    const [lat, setLat] = useState('22.57');
    const [lon, setLon] = useState('88.36');
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function fetchData() {
        setError('');
        if (!start || !end) {
            setError('Please choose start and end dates.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/weather?start=${start}&end=${end}&lat=${lat}&lon=${lon}`
            );

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || res.statusText);
            }

            const json = await res.json();
            setData(json);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Chart data for temperature
    const tempChartData = data
        ? {
            labels: data.days.map((d) => d.date),
            datasets: [
                {
                    label: 'Max Temp (°C)',
                    data: data.days.map((d) => d.temp_max),
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                },
                {
                    label: 'Min Temp (°C)',
                    data: data.days.map((d) => d.temp_min),
                    borderColor: '#666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                },
            ],
        }
        : null;

    // Chart data for air quality
    const aqiChartData = data
        ? {
            labels: data.days.map((d) => d.date),
            datasets: [
                {
                    label: 'PM2.5 (μg/m³)',
                    data: data.days.map((d) => d.pm2_5),
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                },
                {
                    label: 'PM10 (μg/m³)',
                    data: data.days.map((d) => d.pm10),
                    borderColor: '#444',
                    backgroundColor: 'rgba(68, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                },
            ],
        }
        : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#000',
                    font: {
                        family: 'Inter, sans-serif',
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#000',
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    color: '#e0e0e0',
                },
            },
            y: {
                ticks: {
                    color: '#000',
                },
                grid: {
                    color: '#e0e0e0',
                },
            },
        },
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

            {/* Main Content */}
            <main className="pt-16">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-16 border-b border-black">
                    <div className="max-w-4xl">
                        <h1 className="font-playfair text-5xl md:text-6xl font-bold leading-tight mb-4">
                            Historical Weather Data
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed font-light">
                            View historical weather and air quality data for any location and date range
                        </p>
                    </div>
                </section>

                {/* Controls Section */}
                <section className="container mx-auto px-6 py-8 border-b border-black">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Latitude</label>
                            <input
                                type="text"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="22.57"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Longitude</label>
                            <input
                                type="text"
                                value={lon}
                                onChange={(e) => setLon(e.target.value)}
                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="88.36"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-8 py-3 bg-black text-white font-medium hover:opacity-90 transition-opacity border border-black disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Fetch Weather Data'}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 border border-black bg-black text-white">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {data && (
                        <div className="mt-4 text-sm font-light">
                            <strong>{data.totalDays} days</strong> of data loaded
                            {data.fromCache && <span className="ml-2">(from cache ⚡)</span>}
                        </div>
                    )}
                </section>

                {/* Charts Section */}
                {data && tempChartData && (
                    <section className="container mx-auto px-6 py-12">
                        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-8">
                            Temperature Trends
                        </h2>
                        <div className="bg-white border border-black p-6 mb-12">
                            <Line data={tempChartData} options={chartOptions} />
                        </div>


                        {/* Check if we have any AQI data */}
                        {(() => {
                            const hasAQI = data.days.some(d => d.pm2_5 !== null || d.pm10 !== null || d.co !== null || d.ozone !== null);

                            if (hasAQI && aqiChartData) {
                                return (
                                    <>
                                        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-8">
                                            Air Quality Metrics
                                        </h2>
                                        <div className="bg-white border border-black p-6 mb-12">
                                            <Line data={aqiChartData} options={chartOptions} />
                                        </div>
                                    </>
                                );
                            } else {
                                return (
                                    <div className="border border-black p-6 mb-12 text-center">
                                        <p className="text-lg font-light">
                                            ⚠️ Air quality data is not available for this location/date range.
                                            <br />
                                            <span className="text-sm">Try a more recent date or different location.</span>
                                        </p>
                                    </div>
                                );
                            }
                        })()}
                    </section>
                )}

                {/* Data Table */}
                {data && (
                    <section className="container mx-auto px-6 py-12 border-t border-black">
                        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
                            Daily Data Table
                        </h2>
                        <p className="text-sm font-light mb-4">
                            Showing {Math.min(200, data.days.length)} of {data.days.length} days
                        </p>
                        <div className="border border-black overflow-auto" style={{ maxHeight: '500px' }}>
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-black text-white">
                                    <tr>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">Max (°C)</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">Min (°C)</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">Precip (mm)</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">Wind (km/h)</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">PM2.5</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">PM10</th>
                                        <th className="border-r border-white px-4 py-3 text-left text-sm font-medium">CO</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Ozone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.days.slice(0, 200).map((day, idx) => (
                                        <tr
                                            key={day.date}
                                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        >
                                            <td className="border-r border-t border-black px-4 py-2 text-sm font-mono">
                                                {day.date}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.temp_max?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.temp_min?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.precipitation?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.wind_speed?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.pm2_5?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.pm10?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="border-r border-t border-black px-4 py-2 text-sm">
                                                {day.co?.toFixed(0) ?? '-'}
                                            </td>
                                            <td className="border-t border-black px-4 py-2 text-sm">
                                                {day.ozone?.toFixed(1) ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Instructions */}
                {!data && !loading && (
                    <section className="container mx-auto px-6 py-12">
                        <div className="border border-black p-8">
                            <h3 className="font-playfair text-2xl font-bold mb-4">How to Use</h3>
                            <ol className="list-decimal list-inside space-y-2 font-light">
                                <li>Enter latitude and longitude (default: Kolkata, India)</li>
                                <li>Select start and end dates (YYYY-MM-DD)</li>
                                <li>Click "Fetch Weather Data"</li>
                                <li>View temperature and air quality charts</li>
                                <li>Scroll through the daily data table</li>
                            </ol>
                            <div className="mt-6 text-sm font-light">
                                <strong>Popular Locations:</strong>
                                <ul className="mt-2 space-y-1">
                                    <li>• Kolkata: 22.57, 88.36</li>
                                    <li>• Delhi: 28.61, 77.20</li>
                                    <li>• Mumbai: 19.07, 72.87</li>
                                    <li>• Bangalore: 12.97, 77.59</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-black bg-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm font-light">
                        © 2025 Environmental Analysis Project. All rights reserved.
                    </p>
                    <p className="text-xs font-light mt-2 opacity-70">
                        Data provided by Open-Meteo API
                    </p>
                </div>
            </footer>
        </div>
    );
}
