import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const CACHE_DIR = path.join(process.cwd(), ".cache_weather");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function cacheKey(lat: string, lon: string, start: string, end: string): string {
    return `${lat}_${lon}_${start}_${end}.json`;
}

async function fetchJSON(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch error ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const lat = searchParams.get("lat") ?? "22.57"; // Default: Kolkata
        const lon = searchParams.get("lon") ?? "88.36";

        // Validate required parameters
        if (!start || !end) {
            return NextResponse.json(
                { error: "start and end query params required (YYYY-MM-DD)" },
                { status: 400 }
            );
        }

        // Validate date format and range
        const startDate = dayjs(start, "YYYY-MM-DD", true);
        const endDate = dayjs(end, "YYYY-MM-DD", true);

        if (!startDate.isValid() || !endDate.isValid()) {
            return NextResponse.json(
                { error: "Invalid date format. Use YYYY-MM-DD" },
                { status: 400 }
            );
        }

        if (startDate.isAfter(endDate)) {
            return NextResponse.json(
                { error: "Start date must be before or equal to end date" },
                { status: 400 }
            );
        }

        // Check cache first
        const key = cacheKey(lat, lon, start, end);
        const cachePath = path.join(CACHE_DIR, key);

        if (fs.existsSync(cachePath)) {
            const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
            return NextResponse.json({ fromCache: true, ...cached });
        }

        // Fetch from Open-Meteo API (using archive endpoint for historical data)
        const weatherURL = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=UTC`;

        const aqiURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=pm10,pm2_5,carbon_monoxide,ozone&timezone=UTC`;

        // Fetch both APIs in parallel
        const [weatherData, aqiData] = await Promise.all([
            fetchJSON(weatherURL),
            fetchJSON(aqiURL).catch(() => ({ daily: {} })) // AQI might not be available for all locations
        ]);

        // Normalize data into per-day objects
        const days: any[] = [];
        const dates = weatherData?.daily?.time || [];

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            days.push({
                date,
                temp_max: weatherData?.daily?.temperature_2m_max?.[i] ?? null,
                temp_min: weatherData?.daily?.temperature_2m_min?.[i] ?? null,
                precipitation: weatherData?.daily?.precipitation_sum?.[i] ?? null,
                wind_speed: weatherData?.daily?.wind_speed_10m_max?.[i] ?? null,
                pm10: aqiData?.daily?.pm10?.[i] ?? null,
                pm2_5: aqiData?.daily?.pm2_5?.[i] ?? null,
                co: aqiData?.daily?.carbon_monoxide?.[i] ?? null,
                ozone: aqiData?.daily?.ozone?.[i] ?? null,
            });
        }

        const payload = {
            start,
            end,
            lat,
            lon,
            days,
            totalDays: days.length,
        };

        // Write to cache
        fs.writeFileSync(cachePath, JSON.stringify(payload), "utf8");

        return NextResponse.json(payload);
    } catch (error: any) {
        console.error("Weather API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch weather data" },
            { status: 500 }
        );
    }
}
