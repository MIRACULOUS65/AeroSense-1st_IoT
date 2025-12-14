'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WeatherData {
    location: {
        name: string;
        country: string;
        coordinates: {
            lat: number;
            lon: number;
        };
    };
    current: {
        timestamp: number;
        sunrise: number;
        sunset: number;
        timezone: number;
    };
    weather: {
        main: string;
        description: string;
        icon: string;
    };
    temperature: {
        current: number;
        feels_like: number;
        min: number;
        max: number;
    };
    atmosphere: {
        pressure: number;
        humidity: number;
        sea_level?: number;
        ground_level?: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust?: number;
    };
    clouds: {
        coverage: number;
    };
    visibility: number;
    rain?: any;
    snow?: any;
    airQuality?: {
        aqi: number;
        components: any;
    };
}

const AQI_CATEGORIES = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

export default function ComprehensiveReporting() {
    const [location, setLocation] = useState('');
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWeatherData = async () => {
        if (!location.trim()) {
            setError('Please enter a location');
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const response = await fetch(`/api/reporting?location=${encodeURIComponent(location)}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            fetchWeatherData();
        }
    };

    const formatTime = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toUTCString().split(' ')[4];
    };

    const getWindDirection = (deg: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(deg / 45) % 8];
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
                            Comprehensive Weather Report
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed font-light">
                            Get detailed current weather data for any location worldwide
                        </p>
                    </div>
                </section>

                {/* Search Section */}
                <section className="container mx-auto px-6 py-8 border-b border-black">
                    <div className="max-w-2xl">
                        <label className="block text-sm font-medium mb-2">Search Location</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter city name (e.g., Kolkata, London, Tokyo)"
                                disabled={loading}
                                className="flex-1 px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                            />
                            <button
                                onClick={fetchWeatherData}
                                disabled={loading || !location.trim()}
                                className="px-8 py-3 bg-black text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Search'}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 p-4 border border-black bg-black text-white">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                    </div>
                </section>

                {/* Data Display */}
                {data && (
                    <section className="container mx-auto px-6 py-12">
                        <div className="max-w-6xl mx-auto">
                            {/* Location Header */}
                            <div className="border border-black p-6 mb-6 bg-black text-white">
                                <h2 className="font-playfair text-3xl font-bold mb-2">
                                    {data.location.name}, {data.location.country}
                                </h2>
                                <p className="text-sm font-light">
                                    Coordinates: {data.location.coordinates.lat.toFixed(4)}°, {data.location.coordinates.lon.toFixed(4)}°
                                </p>
                                <p className="text-sm font-light mt-1">
                                    Last Updated: {new Date(data.current.timestamp * 1000).toLocaleString()}
                                </p>
                            </div>

                            {/* Main Weather */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                {/* Current Weather */}
                                <div className="border border-black p-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Current Weather
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Condition:</span>
                                            <span className="font-light">{data.weather.description}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-3xl font-bold">
                                            <span className="text-base font-medium">Temperature:</span>
                                            <span>{data.temperature.current.toFixed(1)}°C</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Feels Like:</span>
                                            <span className="font-light">{data.temperature.feels_like.toFixed(1)}°C</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Min / Max:</span>
                                            <span className="font-light">
                                                {data.temperature.min.toFixed(1)}°C / {data.temperature.max.toFixed(1)}°C
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Atmosphere */}
                                <div className="border border-black p-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Atmosphere
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Humidity:</span>
                                            <span className="font-light">{data.atmosphere.humidity}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Pressure:</span>
                                            <span className="font-light">{data.atmosphere.pressure} hPa</span>
                                        </div>
                                        {data.atmosphere.sea_level && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Sea Level Pressure:</span>
                                                <span className="font-light">{data.atmosphere.sea_level} hPa</span>
                                            </div>
                                        )}
                                        {data.atmosphere.ground_level && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Ground Level Pressure:</span>
                                                <span className="font-light">{data.atmosphere.ground_level} hPa</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Visibility:</span>
                                            <span className="font-light">{(data.visibility / 1000).toFixed(1)} km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wind & Clouds */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                {/* Wind */}
                                <div className="border border-black p-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Wind
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Speed:</span>
                                            <span className="font-light">{data.wind.speed} m/s ({(data.wind.speed * 3.6).toFixed(1)} km/h)</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Direction:</span>
                                            <span className="font-light">{data.wind.deg}° ({getWindDirection(data.wind.deg)})</span>
                                        </div>
                                        {data.wind.gust && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Gust:</span>
                                                <span className="font-light">{data.wind.gust} m/s</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Clouds & Sun */}
                                <div className="border border-black p-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Clouds & Sun
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Cloud Coverage:</span>
                                            <span className="font-light">{data.clouds.coverage}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Sunrise:</span>
                                            <span className="font-light">{formatTime(data.current.sunrise, data.current.timezone)} UTC</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Sunset:</span>
                                            <span className="font-light">{formatTime(data.current.sunset, data.current.timezone)} UTC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Air Quality */}
                            {data.airQuality && (
                                <div className="border border-black p-6 mb-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Air Quality
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-medium text-lg">AQI Level:</span>
                                                <span className="font-bold text-2xl">{data.airQuality.aqi} - {AQI_CATEGORIES[data.airQuality.aqi - 1]}</span>
                                            </div>
                                            <div className="text-xs font-light opacity-70">
                                                1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium">PM2.5:</span>
                                                <span className="font-light">{data.airQuality.components.pm2_5?.toFixed(1)} μg/m³</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">PM10:</span>
                                                <span className="font-light">{data.airQuality.components.pm10?.toFixed(1)} μg/m³</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">CO:</span>
                                                <span className="font-light">{data.airQuality.components.co?.toFixed(1)} μg/m³</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">NO₂:</span>
                                                <span className="font-light">{data.airQuality.components.no2?.toFixed(1)} μg/m³</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">O₃:</span>
                                                <span className="font-light">{data.airQuality.components.o3?.toFixed(1)} μg/m³</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Precipitation */}
                            {(data.rain || data.snow) && (
                                <div className="border border-black p-6">
                                    <h3 className="font-playfair text-2xl font-bold mb-4 border-b border-black pb-2">
                                        Precipitation
                                    </h3>
                                    <div className="space-y-3">
                                        {data.rain && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Rain (last hour):</span>
                                                <span className="font-light">{data.rain['1h']} mm</span>
                                            </div>
                                        )}
                                        {data.snow && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Snow (last hour):</span>
                                                <span className="font-light">{data.snow['1h']} mm</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Instructions */}
                {!data && !loading && (
                    <section className="container mx-auto px-6 py-12">
                        <div className="max-w-2xl border border-black p-8">
                            <h3 className="font-playfair text-2xl font-bold mb-4">How to Use</h3>
                            <ol className="list-decimal list-inside space-y-2 font-light">
                                <li>Enter any city name in the search box above</li>
                                <li>Click "Search" or press Enter</li>
                                <li>View comprehensive current weather data</li>
                                <li>Explore temperature, humidity, wind, visibility, air quality, and more</li>
                            </ol>
                            <div className="mt-6 text-sm font-light">
                                <strong>Example searches:</strong> Kolkata, New York, Tokyo, London, Paris
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-black bg-white py-12 mt-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm font-light">
                        © 2025 Environmental Analysis Project. All rights reserved.
                    </p>
                    <p className="text-xs font-light mt-2 opacity-70">
                        Data provided by OpenWeather API
                    </p>
                </div>
            </footer>
        </div>
    );
}
