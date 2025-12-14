"""
Weather Prediction API - Non-Interactive Version
Designed to be called from Next.js backend via child process
"""

import torch
import torch.nn.functional as F
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import requests
import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
SERPAPI_KEY = os.getenv('SERPAPI_KEY')
MODEL_PATH = os.getenv('MODEL_PATH', 'best_model.pt')
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

# Global model cache (loaded once)
_model = None
_tokenizer = None
_device = None


def init_model():
    """Initialize model (singleton pattern)"""
    global _model, _tokenizer, _device
    
    if _model is not None:
        return
    
    _device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    _tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    _tokenizer.pad_token = _tokenizer.eos_token
    _model = GPT2LMHeadModel.from_pretrained('gpt2').to(_device)
    
    # Load trained weights if available
    if os.path.exists(MODEL_PATH):
        _model.load_state_dict(torch.load(MODEL_PATH, map_location=_device))
    
    _model.eval()


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
            }
    except:
        pass
    
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
                'humidity': data['main']['humidity'],
                'desc': data['weather'][0]['description'],
            }
    except:
        pass
    
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
    except:
        pass
    
    return None


@torch.no_grad()
def rag_generate(prompt, max_tokens=MAX_TOKENS, temp=TEMPERATURE):
    """Generate response with RAG"""
    init_model()
    
    context = ''
    detected_city = None
    
    # 1. Extract city and get LIVE data
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
    search_keywords = ['news', 'latest', 'research', 'study', 'why', 'how', 'cause', 'effect', 'climate', 'forecast', 'future']
    if any(kw in prompt.lower() for kw in search_keywords):
        results = search_internet(prompt + ' India environment')
        if results:
            context += f'[WEB SEARCH: {results[0]["snippet"][:150]}]\\n'
    
    # 3. Generate with context
    full_prompt = f'{context}User: {prompt}\\nAssistant:' if context else f'User: {prompt}\\nAssistant:'
    ids = _tokenizer.encode(full_prompt, return_tensors='pt').to(_device)
    
    if ids.size(1) > 400:
        ids = ids[:, -400:]
    
    for _ in range(max_tokens):
        out = _model(ids)
        logits = out.logits[:, -1, :] / temp
        probs = F.softmax(logits, dim=-1)
        next_id = torch.multinomial(probs, 1)
        ids = torch.cat([ids, next_id], dim=1)
        
        if next_id.item() == _tokenizer.eos_token_id:
            break
    
    response = _tokenizer.decode(ids[0], skip_special_tokens=True).split('Assistant:')[-1].strip()
    
    # Get live data for detected city
    live_data = {}
    if detected_city:
        aqi = get_live_aqi(detected_city)
        weather = get_live_weather(detected_city)
        if aqi:
            live_data['aqi'] = aqi
        if weather:
            live_data['weather'] = weather
        live_data['city'] = detected_city.title()
    
    return response, live_data


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
    except:
        pass
    
    return None


def format_weather_output(city, forecast_data, aqi_data, weather_data):
    """Format weather forecast in terminal-friendly output"""
    from datetime import datetime
    
    output = []
    output.append('')
    output.append('=' * 70)
    output.append(f'🌍  WEATHER FORECAST: {city.upper()}')
    output.append('=' * 70)
    output.append('')
    
    # Current conditions
    if weather_data:
        output.append('📍 CURRENT CONDITIONS')
        output.append(f'   🌡️  Temperature: {weather_data["temp"]}°C')
        output.append(f'   💧 Humidity: {weather_data["humidity"]}%')
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
    
    return '\n'.join(output)


def main():
    """Main function - called from command line"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No query provided'}))
        sys.exit(1)
    
    query = sys.argv[1]
    
    try:
        # Check if user wants formatted forecast
        forecast_keywords = ['forecast', 'next days', 'future', 'tomorrow', 'week', 'coming days', 'predict', 'prediction']
        wants_forecast = any(kw in query.lower() for kw in forecast_keywords)
        
        # Detect city
        detected_city = None
        for city in CITIES:
            if city in query.lower():
                detected_city = city
                break
        
        # If wants forecast and city detected, provide formatted forecast
        if wants_forecast and detected_city:
            forecast = get_weather_forecast(detected_city, days=5)
            aqi = get_live_aqi(detected_city)
            weather = get_live_weather(detected_city)
            
            response = format_weather_output(detected_city.title(), forecast, aqi, weather)
            
            output = {
                'success': True,
                'response': response,
                'liveData': {
                    'city': detected_city.title(),
                    'aqi': aqi,
                    'weather': weather
                }
            }
        else:
            # Use AI to generate response
            response, live_data = rag_generate(query)
            
            # Add live data display
            if live_data:
                if 'aqi' in live_data:
                    aqi_data = live_data['aqi']
                    response += f"\n\n📊 LIVE DATA ({live_data['city']}):"
                    response += f"\n🔴 AQI: {aqi_data['aqi']} ({aqi_data['category']})"
                    response += f"\n💨 PM2.5: {aqi_data['pm25']:.1f} μg/m³"
                
                if 'weather' in live_data:
                    weather_data = live_data['weather']
                    response += f"\n🌡️  Weather: {weather_data['temp']}°C, {weather_data['humidity']}% humidity"
            
            output = {
                'success': True,
                'response': response,
                'liveData': live_data
            }
        
        print(json.dumps(output))
        sys.exit(0)
        
    except Exception as e:
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)


if __name__ == '__main__':
    main()

