import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
    console.error('NEXT_PUBLIC_OPENWEATHER_API_KEY is not configured');
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const location = searchParams.get('location');

        if (!location) {
            return NextResponse.json(
                { error: 'Location parameter is required' },
                { status: 400 }
            );
        }

        // Fetch current weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                return NextResponse.json(
                    { error: 'Location not found. Please check the spelling and try again.' },
                    { status: 404 }
                );
            }
            throw new Error(`Weather API error: ${weatherResponse.statusText}`);
        }

        const weatherData = await weatherResponse.json();

        // Extract coordinates for air quality data
        const { lat, lon } = weatherData.coord;

        // Fetch air quality data
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
        const aqiResponse = await fetch(aqiUrl);

        let aqiData = null;
        if (aqiResponse.ok) {
            aqiData = await aqiResponse.json();
        }

        // Combine all data
        const comprehensiveData = {
            location: {
                name: weatherData.name,
                country: weatherData.sys.country,
                coordinates: {
                    lat: weatherData.coord.lat,
                    lon: weatherData.coord.lon,
                },
            },
            current: {
                timestamp: weatherData.dt,
                sunrise: weatherData.sys.sunrise,
                sunset: weatherData.sys.sunset,
                timezone: weatherData.timezone,
            },
            weather: {
                main: weatherData.weather[0].main,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
            },
            temperature: {
                current: weatherData.main.temp,
                feels_like: weatherData.main.feels_like,
                min: weatherData.main.temp_min,
                max: weatherData.main.temp_max,
            },
            atmosphere: {
                pressure: weatherData.main.pressure,
                humidity: weatherData.main.humidity,
                sea_level: weatherData.main.sea_level,
                ground_level: weatherData.main.grnd_level,
            },
            wind: {
                speed: weatherData.wind.speed,
                deg: weatherData.wind.deg,
                gust: weatherData.wind.gust,
            },
            clouds: {
                coverage: weatherData.clouds.all,
            },
            visibility: weatherData.visibility,
            rain: weatherData.rain || null,
            snow: weatherData.snow || null,
            airQuality: aqiData ? {
                aqi: aqiData.list[0].main.aqi,
                components: aqiData.list[0].components,
            } : null,
        };

        return NextResponse.json(comprehensiveData);

    } catch (error: any) {
        console.error('Reporting API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
