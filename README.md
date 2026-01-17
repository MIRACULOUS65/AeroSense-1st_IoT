# AeroSense - Environmental Monitoring System 🌍

A comprehensive environmental data analysis and monitoring system with real-time IoT integration, AI-powered weather predictions, and interactive data visualization.
## 🎥 Project Demo

[![AeroSense Demo Video](./frontend/public/Screenshot%202026-01-18%20001358.png)](https://drive.google.com/file/d/12t91UTAXBcdVBofLVPkUDuXkzUMp5BOk/view?usp=sharing)

▶️ **[Watch Demo Video on Google Drive](https://drive.google.com/file/d/12t91UTAXBcdVBofLVPkUDuXkzUMp5BOk/view?usp=sharing)**

## 🌟 Features

- **Real-time IoT Monitoring** - Live sensor data from Arduino (DHT11 temperature/humidity, MQ135 air quality)
- **Weather Reporting** - Comprehensive weather data with OpenWeather API integration
- **Historical Data Analysis** - Multi-day weather and air quality trends
- **AI Weather Predictions** - GPT-2 powered weather forecasting and analysis
- **Interactive Dashboard** - Modern Next.js frontend with real-time updates

## 📋 Project Structure

```
AeroSense/
├── frontend/          # Next.js web application
├── backend/           # Node.js WebSocket server for IoT
├── aiml/              # Python AI/ML weather prediction
└── iot/               # Arduino sensor code
```

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** (for AI/ML features)
- **Arduino IDE** (for IoT features)
- **OpenWeather API key** ([Get free key](https://openweathermap.org/api))

---

## 📦 Installation

### 1. Frontend Setup (Required)

#### Environment Configuration

Create `frontend/.env.local` file:

```env
# OpenWeather API Key for reporting feature
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

> 💡 **Tip**: Copy `frontend/.env.example` and fill in your API key

#### Install & Run

```powershell
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** 🎉

---

### 2. Backend Setup (Optional - for IoT features)

#### Environment Configuration

Create `backend/.env` file:

```env
# Arduino Serial Port Configuration
SERIAL_PORT=COM3          # Windows: COM3, COM4, etc.
BAUD_RATE=9600
WS_PORT=8080
HTTP_PORT=3001
```

> 💡 **Tip**: Copy `backend/.env.example` and update `SERIAL_PORT`

**Finding your COM port:**
- Windows: Device Manager → Ports (COM & LPT) → Look for "Arduino Uno (COM X)"
- Or check Arduino IDE: Tools → Port

#### Install & Run

```powershell
cd backend
npm install
npm start
```

Runs on **http://localhost:3001** and **ws://localhost:8080**

---

### 3. AI/ML Setup (Optional - for predictions)

#### Environment Configuration

Create `aiml/.env` file:

```env
# Required for AI weather predictions
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional - for internet search
SERPAPI_KEY=your_serpapi_key_here

# Model configuration
MODEL_PATH=best_model.pt
TEMPERATURE=0.8
MAX_TOKENS=150
```

> 💡 **Tip**: Copy `aiml/.env.example` and fill in your values

#### Install & Run

```powershell
cd aiml
pip install -r requirements.txt
python weather_predict.py
```

---

## 🔌 Arduino IoT Integration Guide

### Hardware Requirements

- **Arduino Uno** (or compatible board)
- **DHT11** Temperature & Humidity Sensor
- **MQ135** Air Quality Sensor
- USB Cable
- Jumper wires

### Step 1: Upload Arduino Code

1. Open **Arduino IDE**
2. Open `iot/sketch_dec11a/sketch_dec11a.ino`
3. Connect your Arduino board via USB
4. Install required libraries:
   - **DHT sensor library**: Tools → Manage Libraries → Search "DHT sensor library"
   - **MQ135 library** (optional, code uses analog read)
5. Select the correct board: **Tools → Board → Arduino Uno**
6. Select the correct port: **Tools → Port → COM X** (note the COM port number)
7. Click **Upload** button (→)
8. Open **Serial Monitor** (Ctrl+Shift+M)
9. Set baud rate to **9600**
10. You should see JSON data output:
    ```json
    { "temperature": 25.5, "humidity": 60, "mq135_raw": 120, "air_quality": "Good" }
    ```

**⚠️ IMPORTANT**: Close the Serial Monitor before running the backend server (both can't use the serial port simultaneously).

### Step 2: Configure Backend

Follow the [Backend Setup](#2-backend-setup-optional---for-iot-features) section above and ensure the `SERIAL_PORT` in `backend/.env` matches your Arduino's COM port.

### Step 3: View Live Data

1. Ensure **frontend is running** on http://localhost:3000
2. Ensure **backend is running** on http://localhost:3001
3. Open browser to http://localhost:3000
4. Click **"Get Started"** button
5. Navigate to **Features** page
6. Click on **"Real-time Data"** (with ● symbol)
7. See live sensor data updating every 1-2 seconds! 📊

### What You'll See

- ✅ **Temperature** in °C (from DHT11)
- ✅ **Humidity** in % (from DHT11)
- ✅ **Air Quality** raw value (from MQ135)
- ✅ **Air Quality Status** (Excellent/Good/Moderate/Poor/Hazardous)
- ✅ **Last Update** timestamp
- ✅ **Connection Status** indicators

---

## 🖥️ Running Multiple Servers

You need **TWO terminals running simultaneously**:

### Terminal 1: Frontend
```powershell
cd frontend
npm run dev
```
Running on: **http://localhost:3000**

### Terminal 2: Backend (for IoT)
```powershell
cd backend
npm start
```
Running on: **http://localhost:3001** (API) + **ws://localhost:8080** (WebSocket)

---

## 🔧 Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001 |
| WebSocket | 8080 | ws://localhost:8080 |
| Arduino Serial | COM3/4/5 | USB Connection |

---

## 📱 Available Features

1. **Real-time Monitoring** (`/monitoring`) - Live IoT sensor data
2. **Weather Reporting** (`/reporting`) - Current weather conditions
3. **Historical Analysis** (`/weather`) - Multi-day weather trends
4. **AI Chat** (`/ai-chat`) - Weather predictions and Q&A

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express, WebSocket, SerialPort.
- **AI/ML**: Python, PyTorch, Transformers (GPT-2).
- **IoT**: Arduino, DHT11, MQ135, Breadboard.
- **APIs**: OpenWeather, Open-Meteo, SerpAPI.

---

## 🐛 Troubleshooting

### "API key not configured" error
- Ensure you've created `.env.local` in the frontend directory
- Verify the variable name is exactly `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- Restart the development server after creating `.env.local`

### "Cannot find module 'serialport'"
**Solution**: Run `npm install` in the backend folder

### "Error: Opening COM4: Access is denied"
**Solution**: 
- Close Arduino Serial Monitor
- Close any other programs using the COM port
- Restart the backend server

### "Port COM4 is not available"
**Solution**:
- Check Device Manager to confirm Arduino is connected
- Verify the correct COM port in `backend/.env` file
- Try unplugging and reconnecting the Arduino

### WebSocket shows "Disconnected"
**Solution**:
- Make sure backend server is running
- Check browser console for errors (F12)
- Verify WebSocket port 8080 is not blocked by firewall

### No sensor data appearing
**Solution**:
- Verify Arduino Serial Monitor shows JSON output
- Check Arduino connections (DHT11 on pin 2, MQ135 on A0)
- Restart Arduino and backend server
- Check backend terminal for "Sensor Data:" logs

### Frontend can't connect to backend
**Solution**:
- Ensure both servers are running
- Check no errors in backend terminal
- Try refreshing the monitoring page

### Module not found errors
- Run `npm install` in the respective directory
- For Python: `pip install -r requirements.txt` in aiml directory

---

## 🧪 Testing Without Arduino

If you want to test the interface without connecting Arduino:

1. Start only the frontend: `cd frontend && npm run dev`
2. Visit http://localhost:3000/monitoring
3. You'll see the monitoring page with "--" placeholders
4. Connection status will show "Arduino: Disconnected"
5. Instructions will be displayed for connecting Arduino

This lets you see the UI design before hardware setup!

---

## 🔐 Security Notes

- **Never commit `.env` or `.env.local` files** to version control
- API keys are gitignored by default
- Use `.env.example` files as templates for required variables
- Get your own free API keys from:
  - OpenWeather: https://openweathermap.org/api
  - SerpAPI: https://serpapi.com/ (optional)

---

## 🤝 Contributing

When contributing to this repository:

1. Never commit API keys or sensitive data
2. Use environment variables for all secrets
3. Update `.env.example` files when adding new variables
4. Test locally before committing

---

## 🚀 Next Steps

Once everything is working:
- ✅ Monitor environmental data in real-time
- 🔄 Extend with more sensors (CO2, PM2.5, etc.)
- 📊 Add data logging and history
- 📈 Implement data visualization charts
- 🔔 Set up threshold alerts
- 💾 Store historical data in database
- 🌐 Deploy to cloud platform

---

## 📄 License

This project is for educational purposes.

---

**Made with ❤️ for environmental monitoring and data analysis**

By Team Quantum Glitch
