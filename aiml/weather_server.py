"""
Weather Prediction Flask Server
Persistent server that loads model once and keeps it in memory
"""

import torch
import torch.nn.functional as F
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import requests
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

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

# Flask app
app = Flask(__name__)
CORS(app)

# Global model (loaded once at startup)
device = None
model = None
tokenizer = None

print('🔧 Initializing Weather Prediction Server...')

# Load model at startup
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'📦 Device: {device}')

print('📦 Loading GPT-2 model and tokenizer...')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
tokenizer.pad_token = tokenizer.eos_token
model = GPT2LMHeadModel.from_pretrained('gpt2').to(device)

# Load trained weights if available
if os.path.exists(MODEL_PATH):
    print(f'✅ Loading trained model from {MODEL_PATH}')
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
else:
    print(f'⚠️  Warning: {MODEL_PATH} not found. Using base GPT-2.')

model.eval()
print('✅ Model loaded successfully!')


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


@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'No query provided', 'success': False}), 400
        
        # Generate response
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
        
        return jsonify({
            'success': True,
            'response': response,
            'liveData': live_data
        })
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})


if __name__ == '__main__':
    print('🚀 Starting Flask server on http://localhost:5001')
    app.run(host='0.0.0.0', port=5001, debug=False)
