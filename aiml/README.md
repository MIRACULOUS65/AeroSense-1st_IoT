# Weather Prediction CLI - AI-Powered Weather Forecasting

This is a command-line interface for weather prediction using a fine-tuned GPT-2 model with RAG (Retrieval-Augmented Generation) capabilities.

## Features

✅ **Live Weather Data** - Real-time temperature, humidity, wind speed from OpenWeather API  
✅ **Air Quality Index (AQI)** - Live PM2.5, PM10, CO, NO2 measurements  
✅ **5-Day Forecast** - Detailed weather predictions  
✅ **AI-Powered Responses** - Fine-tuned GPT-2 (124M parameters) trained on 18,360 environmental samples  
✅ **RAG System** - Combines live API data with AI generation  
✅ **Internet Search** - SerpAPI integration for latest news/research  
✅ **Natural Language** - Ask questions in plain English  

## Quick Start

### 1. Install Dependencies

```bash
cd aiml
pip install -r requirements.txt
```

**Required packages:**
- `torch` - PyTorch for model inference
- `transformers` - Hugging Face transformers library
- `requests` - API calls to OpenWeather and SerpAPI
- `python-dotenv` - Environment variable management

### 2. Verify Files

Ensure these files are present in the `aiml/` directory:
- ✅ `best_model.pt` - Trained GPT-2 weights (already present)
- ✅ `.env` - API keys (already configured)
- ✅ `weather_predict.py` - Main CLI script
- ✅ `requirements.txt` - Dependencies list

### 3. Run the CLI

```bash
python weather_predict.py
```

## Usage Examples

### Example 1: Current Weather
```
🔍 You: What is the weather in Kolkata?

🤖 Assistant: Kolkata, West Bengal - Current Air Quality
📊 AQI: 424 (Severe)
🔴 PM2.5: 309.9 μg/m³
🌡️ Weather: 19.95°C, 73% humidity
```

### Example 2: 5-Day Forecast
```
🔍 You: Weather forecast for Delhi for next 5 days

======================================================================
🌍  WEATHER FORECAST: DELHI
======================================================================

📍 CURRENT CONDITIONS
   🌡️  Temperature: 12.1°C (feels like 10.5°C)
   💧 Humidity: 82%
   🌬️  Wind: 2.5 m/s
   ☁️  Conditions: Clear Sky

🏭 AIR QUALITY
   🔴 AQI: 299 (Poor)
   💨 PM2.5: 120.0 μg/m³
   💨 PM10: 237.7 μg/m³

📅 5-DAY FORECAST

   Day 1 (Thu 12 Dec):
      🌡️  Avg Temp: 14.2°C
      💧 Avg Humidity: 75%
      ☁️  Conditions: Clear Sky

   Day 2 (Fri 13 Dec):
      🌡️  Avg Temp: 15.8°C
      💧 Avg Humidity: 68%
      ☁️  Conditions: Few Clouds

   [...more days...]
======================================================================
```

### Example 3: Air Quality Query
```
🔍 You: Current AQI in Mumbai

🤖 Assistant: Mumbai air quality is currently Moderate with AQI of 189.
📊 LIVE DATA (Mumbai):
🔴 AQI: 189 (Moderate)
💨 PM2.5: 78.5 μg/m³
```

### Example 4: General Questions
```
🔍 You: Why is pollution increasing in India?

🤖 Assistant: [AI-generated response with web search results]
```

## Available Cities

The system supports 12 Indian cities:
- Kolkata
- Delhi
- Mumbai
- Bangalore
- Chennai
- Hyderabad
- Siliguri
- Darjeeling
- Durgapur
- Asansol
- Howrah
- Malda

## Commands

- **Weather Query**: "What is the weather in [city]?"
- **AQI Query**: "Current AQI in [city]"
- **Forecast**: "Weather forecast for [city] for next 5 days"
- **General**: Ask any environmental/climate question
- **Exit**: Type `quit`, `exit`, or `q`

## Technical Details

### Model Architecture
- **Base**: GPT-2 (124M parameters)
- **Fine-tuned on**: 18,360 environmental Q&A samples
- **Validation loss**: 0.0346
- **Training steps**: 6,000 steps with cosine learning rate schedule

### RAG System
The system uses Retrieval-Augmented Generation:
1. **Live API Data**: Fetches current weather and AQI from OpenWeather
2. **Internet Search**: Uses SerpAPI for latest news/research
3. **Context Injection**: Combines retrieved data with user query
4. **AI Generation**: GPT-2 generates response with injected context

### API Keys
API keys are configured in `.env` file:
- `OPENWEATHER_API_KEY`: For weather and air quality data
- `SERPAPI_KEY`: For internet search capabilities

## Configuration

Edit `.env` to customize:
```env
# Model parameters
MAX_LENGTH=256          # Maximum sequence length
TEMPERATURE=0.8         # Generation temperature (0.0-1.0)
MAX_TOKENS=150         # Maximum generated tokens

# API keys (already configured)
OPENWEATHER_API_KEY=...
SERPAPI_KEY=...
```

## Output Formats

### Terminal Output
The CLI provides formatted terminal output with:
- 🌡️  Temperature and feels-like
- 💧 Humidity percentage
- 🌬️  Wind speed
- ☁️  Weather conditions
- 🔴 AQI with category (Good/Moderate/Poor/Severe)
- 💨 PM2.5 and PM10 levels
- 📅 Day-by-day forecast

### Example Terminal Session
```bash
$ python weather_predict.py

======================================================================
🌤️  WEATHER PREDICTION CLI - RAG Enhanced
======================================================================

Features:
  • Live weather data from OpenWeather API
  • Live AQI (Air Quality Index) monitoring
  • 5-day weather forecast
  • AI-powered responses using fine-tuned GPT-2
  • Internet search integration

Commands:
  • Ask for weather: "What is the weather in Kolkata?"
  • Ask for forecast: "Weather forecast for Delhi for next 5 days"
  • Ask for AQI: "Current AQI in Mumbai"
  • Ask general questions: "Why is pollution high in Delhi?"
  • Type "quit" to exit

Available cities: kolkata, delhi, mumbai, bangalore, chennai, hyderabad, siliguri, darjeeling, durgapur, asansol, howrah, malda
======================================================================

🔍 You: 
```

## Troubleshooting

### Model file not found
If you see `⚠️ Warning: best_model.pt not found`, the CLI will still work but use the base GPT-2 model without fine-tuning. Ensure `best_model.pt` is in the `aiml/` directory.

### API errors
If weather/AQI data fails to load:
- Check internet connection
- Verify API keys in `.env` are correct
- API might be rate-limited (wait a few minutes)

### CUDA/GPU errors
The script automatically detects CUDA. If GPU is unavailable, it falls back to CPU. For faster inference, install PyTorch with CUDA support.

## Project Structure

```
aiml/
├── weather_predict.py       # Main CLI application
├── best_model.pt             # Trained GPT-2 weights
├── requirements.txt          # Python dependencies
├── .env                      # API keys and configuration
├── README.md                # This file
└── complete-env-llm (1).ipynb  # Original training notebook
```

## Credits

- Model: Fine-tuned GPT-2 from Hugging Face
- Weather Data: OpenWeather API
- Air Quality: OpenWeather Air Pollution API (India AQI standard)
- Search: SerpAPI
- Framework: PyTorch + Transformers

---

**Built for Environmental Analysis Project**  
Part of the comprehensive EVS monitoring system with real-time Arduino sensors and historical weather data viewer.
