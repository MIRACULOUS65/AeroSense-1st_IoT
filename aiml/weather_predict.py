"""
Weather Prediction CLI using Fine-tuned GPT-2 Model
Supports RAG with live OpenWeather API and internet search
"""

import torch
import torch.nn.functional as F
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
SERPAPI_KEY = os.getenv('SERPAPI_KEY')
MODEL_PATH = os.getenv('MODEL_PATH', 'best_model.pt')
MAX_LENGTH = int(os.getenv('MAX_LENGTH', '256'))
TEMPERATURE = float(os.getenv('TEMPERATURE', '0.8'))
MAX_TOKENS = int(os.getenv('MAX_TOKENS', '150'))

# Indian cities with coordinates
CITIES = {
    'kolkata': (22.57, 88.36),
    'delhi': (28.61, 77.21),
    'mumbai': (19.08, 72.88),
    'bangalore': (12.97, 77.59),
    'chennai': (13.08, 80.27),
    'hyderabad': (17.38, 78.49),
    'siliguri': (26.73, 88.40),
    'darjeeling': (27.04, 88.27),
    'durgapur': (23.52, 87.31),
    'asansol': (23.67, 86.95),
    'howrah': (22.59, 88.26),
    'malda': (25.01, 88.14),
}

# Device configuration
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'🔧 Device: {device}')

# Load model and tokenizer
print('📦 Loading GPT-2 model and tokenizer...')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
tokenizer.pad_token = tokenizer.eos_token
model = GPT2LMHeadModel.from_pretrained('gpt2').to(device)

# Load trained weights
if os.path.exists(MODEL_PATH):
    print(f'✅ Loading trained model from {MODEL_PATH}')
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
else:
    print(f'⚠️  Warning: {MODEL_PATH} not found. Using base GPT-2.')

model.eval()


def get_live_aqi(city):
    """Fetch LIVE AQI from OpenWeather API"""
    if city.lower() not in CITIES:
        return None
    
    lat, lon = CITIES[city.lower()]
    try:
        url = f'http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}'
        r = requests.get(url, timeout=10)
        
        if r.status_code == 200:
            data = r.json()['list'][0]['components']
            pm25 = data.get('pm2_5', 0)
            
            # India AQI calculation
            breakpoints = [
                (0, 30, 0, 50),
                (31, 60, 51, 100),
                (61, 90, 101, 200),
                (91, 120, 201, 300),
                (121, 250, 301, 400),
                (251, 500, 401, 500)
            ]
            
            aqi = 500
            for c_lo, c_hi, i_lo, i_hi in breakpoints:
                if c_lo <= pm25 <= c_hi:
                    aqi = int(((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo)
                    break
            
            categories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']
            cat_idx = min(aqi // 50, 5)
            category = categories[cat_idx]
            
            return {
                'aqi': aqi,
                'category': category,
                'pm25': pm25,
                'pm10': data.get('pm10', 0),
                'co': data.get('co', 0),
                'no2': data.get('no2', 0),
            }
    except Exception as e:
        print(f'Error fetching AQI: {e}')
    
    return None


def get_live_weather(city):
    """Fetch LIVE weather from OpenWeather API"""
    if city.lower() not in CITIES:
        return None
    
    lat, lon = CITIES[city.lower()]
    try:
        url = f'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric'
        r = requests.get(url, timeout=10)
        
        if r.status_code == 200:
            data = r.json()
            return {
                'temp': data['main']['temp'],
                'feels_like': data['main']['feels_like'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': data['wind']['speed'],
                'desc': data['weather'][0]['description'],
            }
    except Exception as e:
        print(f'Error fetching weather: {e}')
    
    return None


def get_weather_forecast(city, days=5):
    """Fetch 5-day weather forecast"""
    if city.lower() not in CITIES:
        return None
    
    lat, lon = CITIES[city.lower()]
    try:
        url = f'http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric'
        r = requests.get(url, timeout=10)
        
        if r.status_code == 200:
            data = r.json()
            forecasts = []
            
            for item in data['list'][:days * 8]:  # 8 entries per day (3-hour intervals)
                forecasts.append({
                    'date': item['dt_txt'],
                    'temp': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'desc': item['weather'][0]['description'],
                    'wind': item['wind']['speed'],
                })
            
            return forecasts
    except Exception as e:
        print(f'Error fetching forecast: {e}')
    
    return None


def search_internet(query):
    """Search the internet using SerpAPI"""
    try:
        url = f'https://serpapi.com/search.json?q={query}&api_key={SERPAPI_KEY}'
        r = requests.get(url, timeout=15)
        
        if r.status_code == 200:
            data = r.json()
            results = []
            for item in data.get('organic_results', [])[:3]:
                results.append({
                    'title': item.get('title', ''),
                    'snippet': item.get('snippet', '')
                })
            return results
    except Exception as e:
        print(f'Error searching internet: {e}')
    
    return None


@torch.no_grad()
def rag_generate(prompt, max_tokens=MAX_TOKENS, temp=TEMPERATURE):
    """Generate response with RAG (Retrieval-Augmented Generation)"""
    model.eval()
    context = ''
    
    # 1. Extract city and get LIVE data
    detected_city = None
    for city in CITIES:
        if city in prompt.lower():
            detected_city = city
            aqi = get_live_aqi(city)
            weather = get_live_weather(city)
            
            if aqi:
                context += f'[LIVE DATA: {city.title()} AQI={aqi["aqi"]} ({aqi["category"]}), PM2.5={aqi["pm25"]:.1f}]\\n'
            
            if weather:
                context += f'[WEATHER: {weather["temp"]}°C, {weather["humidity"]}% humidity, {weather["desc"]}]\\n'
            break
    
    # 2. Search internet if needed
    search_keywords = ['news', 'latest', 'research', 'study', 'why', 'how', 'cause', 'effect', 'climate', 'forecast', 'future', 'predict']
    if any(kw in prompt.lower() for kw in search_keywords):
        results = search_internet(prompt + ' India environment')
        if results:
            context += f'[WEB SEARCH: {results[0]["snippet"][:150]}]\\n'
    
    # 3. Generate with context
    full_prompt = f'{context}User: {prompt}\\nAssistant:' if context else f'User: {prompt}\\nAssistant:'
    ids = tokenizer.encode(full_prompt, return_tensors='pt').to(device)
    
    if ids.size(1) > 400:
        ids = ids[:, -400:]
    
    for _ in range(max_tokens):
        out = model(ids)
        logits = out.logits[:, -1, :] / temp
        probs = F.softmax(logits, dim=-1)
        next_id = torch.multinomial(probs, 1)
        ids = torch.cat([ids, next_id], dim=1)
        
        if next_id.item() == tokenizer.eos_token_id:
            break
    
    response = tokenizer.decode(ids[0], skip_special_tokens=True).split('Assistant:')[-1].strip()
    
    return response, detected_city


def format_weather_output(city, forecast_data, aqi_data, weather_data):
    """Format weather forecast in terminal-friendly output"""
    output = []
    output.append('')
    output.append('=' * 70)
    output.append(f'🌍  WEATHER FORECAST: {city.upper()}')
    output.append('=' * 70)
    output.append('')
    
    # Current conditions
    if weather_data:
        output.append('📍 CURRENT CONDITIONS')
        output.append(f'   🌡️  Temperature: {weather_data["temp"]}°C (feels like {weather_data["feels_like"]}°C)')
        output.append(f'   💧 Humidity: {weather_data["humidity"]}%')
        output.append(f'   🌬️  Wind: {weather_data["wind_speed"]} m/s')
        output.append(f'   ☁️  Conditions: {weather_data["desc"].title()}')
        output.append('')
    
    # Air quality
    if aqi_data:
        output.append('🏭 AIR QUALITY')
        output.append(f'   🔴 AQI: {aqi_data["aqi"]} ({aqi_data["category"]})')
        output.append(f'   💨 PM2.5: {aqi_data["pm25"]:.1f} μg/m³')
        output.append(f'   💨 PM10: {aqi_data["pm10"]:.1f} μg/m³')
        output.append('')
    
    # 5-day forecast
    if forecast_data:
        output.append('📅 5-DAY FORECAST')
        output.append('')
        
        # Group by day
        by_day = {}
        for item in forecast_data:
            date = item['date'].split()[0]
            if date not in by_day:
                by_day[date] = []
            by_day[date].append(item)
        
        for i, (date, items) in enumerate(list(by_day.items())[:5], 1):
            avg_temp = sum(item['temp'] for item in items) / len(items)
            avg_humidity = sum(item['humidity'] for item in items) / len(items)
            desc = items[len(items)//2]['desc']  # Mid-day description
            
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            day_name = date_obj.strftime('%a')
            
            output.append(f'   Day {i} ({day_name} {date_obj.strftime("%d %b")}):')
            output.append(f'      🌡️  Avg Temp: {avg_temp:.1f}°C')
            output.append(f'      💧 Avg Humidity: {avg_humidity:.0f}%')
            output.append(f'      ☁️  Conditions: {desc.title()}')
            output.append('')
    
    output.append('=' * 70)
    output.append('')
    
    return '\\n'.join(output)


def main():
    """Main CLI interface"""
    print('')
    print('=' * 70)
    print('🌤️   WEATHER PREDICTION CLI - RAG Enhanced')
    print('=' * 70)
    print()
    print('Features:')
    print('  • Live weather data from OpenWeather API')
    print('  • Live AQI (Air Quality Index) monitoring')
    print('  • 5-day weather forecast')
    print('  • AI-powered responses using fine-tuned GPT-2')
    print('  • Internet search integration')
    print()
    print('Commands:')
    print('  • Ask for weather: "What is the weather in Kolkata?"')
    print('  • Ask for forecast: "Weather forecast for Delhi for next 5 days"')
    print('  • Ask for AQI: "Current AQI in Mumbai"')
    print('  • Ask general questions: "Why is pollution high in Delhi?"')
    print('  • Type "quit" to exit')
    print()
    print(f'Available cities: {", ".join(CITIES.keys())}')
    print('=' * 70)
    print()
    
    while True:
        try:
            query = input('🔍 You: ').strip()
            
            if not query:
                continue
            
            if query.lower() in ['quit', 'exit', 'q']:
                print('\\n👋 Goodbye!')
                break
            
            # Check if user wants formatted forecast
            forecast_keywords = ['forecast', 'next days', 'future', 'tomorrow', 'week', 'coming days']
            wants_forecast = any(kw in query.lower() for kw in forecast_keywords)
            
            # Detect city
            detected_city = None
            for city in CITIES:
                if city in query.lower():
                    detected_city = city
                    break
            
            if wants_forecast and detected_city:
                # Provide formatted forecast
                forecast = get_weather_forecast(detected_city, days=5)
                aqi = get_live_aqi(detected_city)
                weather = get_live_weather(detected_city)
                
                print(format_weather_output(detected_city.title(), forecast, aqi, weather))
            else:
                # Use AI to generate response
                print('\\n🤖 Assistant: ', end='', flush=True)
                response, city = rag_generate(query)
                
                # Add live data display
                if city:
                    aqi = get_live_aqi(city)
                    weather = get_live_weather(city)
                    
                    if aqi:
                        response += f'\\n\\n📊 LIVE DATA ({city.title()}):'
                        response += f'\\n🔴 AQI: {aqi["aqi"]} ({aqi["category"]})'
                        response += f'\\n💨 PM2.5: {aqi["pm25"]:.1f} μg/m³'
                    
                    if weather:
                        response += f'\\n🌡️  Weather: {weather["temp"]}°C, {weather["humidity"]}% humidity'
                
                print(response)
                print()
        
        except KeyboardInterrupt:
            print('\\n\\n👋 Goodbye!')
            break
        except Exception as e:
            print(f'\\n❌ Error: {e}')
            print()


if __name__ == '__main__':
    main()
