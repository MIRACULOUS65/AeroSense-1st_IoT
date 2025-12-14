#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define MQ135_PIN A0

// Function to smooth noisy analog data using averaging
int readMQ135Smooth(int samples = 10) {
  long total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(MQ135_PIN);
    delay(5);
  }
  return total / samples;
}

// Function to classify air quality based on MQ135 raw value
String getAirQualityLevel(int mqValue) {
  if (mqValue < 150) return "Excellent";
  if (mqValue < 250) return "Good";
  if (mqValue < 350) return "Moderate";
  if (mqValue < 450) return "Poor";
  return "Hazardous";
}

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // Read DHT sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Read smoothed MQ135 value
  int mqValue = readMQ135Smooth(20);  // 20-sample average

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT11!");
    delay(2000);
    return;
  }

  String quality = getAirQualityLevel(mqValue);

  // JSON-style structured output (good for IoT/Web later)
  Serial.print("{ ");
  Serial.print("\"temperature\": "); Serial.print(temperature);
  Serial.print(", \"humidity\": "); Serial.print(humidity);
  Serial.print(", \"mq135_raw\": "); Serial.print(mqValue);
  Serial.print(", \"air_quality\": \""); Serial.print(quality); Serial.print("\"");
  Serial.println(" }");

  delay(2000);
}