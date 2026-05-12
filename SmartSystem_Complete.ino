/*
 * ESP32 Smart System - Optimized Version
 * Non-Blocking | Batch HTTP Requests | FreeRTOS Tasks
 * With Supabase and Blynk
 */

/* ================= BLYNK CONFIG (MUST BE FIRST!) ================= */
#define BLYNK_TEMPLATE_ID   "TMPL21_0J5RRM"
#define BLYNK_TEMPLATE_NAME "Smart City IOT SystemCopy"
#define BLYNK_AUTH_TOKEN    "J95HUNtrZRojrICq7_a4b8WNXtNTuMrj"
#define BLYNK_PRINT Serial

/* ================= INCLUDES ================= */
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <BlynkSimpleEsp32.h>
#include <time.h>
#include <Preferences.h>

/* ================= DEBUG MODE ================= */
#define DEBUG_MODE 1  // Set to 0 to disable verbose logging

/* ================= WiFi CONFIG ================= */
const char* WIFI_SSID     = "5enoo";
const char* WIFI_PASSWORD = "5enoooooo1";

/* ================= SUPABASE CONFIG ================= */
const String SUPABASE_URL = "https://ezpflxkgwemymisdgkoe.supabase.co";
const String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cGZseGtnd2VteW1pc2Rna29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDQ3MDUsImV4cCI6MjA5MjUyMDcwNX0.MKFErh-QDACfAx5797AjvlIdA8ftKD6HWrvq-6LLO2w";
const String DEVICE_ID    = "esp32_main_01";

/* ================= PINS ================= */
// RFID
#define RFID_SS_PIN  5
#define RFID_RST_PIN 22

// IR & LDR
#define IR1_PIN 34
#define IR2_PIN 35
#define LDR_PIN 32

// LEDs
#define GATE_LED  14
#define GATE_LED2 2
#define PWM_LED_1 12
#define PWM_LED_2 13

// Soil
#define SOIL_PIN 33

// PWM Settings
#define PWM_FREQ       5000
#define PWM_RESOLUTION 8

/* ================= BLYNK VIRTUAL PINS ================= */
#define VPIN_RFID_UID       V0
#define VPIN_RFID_COUNT     V1
#define VPIN_RFID_LED       V2
#define VPIN_LDR_VALUE      V3
#define VPIN_IR1_STATUS     V4
#define VPIN_IR2_STATUS     V5
#define VPIN_LIGHT_CONTROL  V6
#define VPIN_SOIL_MOISTURE  V7
#define VPIN_BRIGHTNESS_1   V8
#define VPIN_BRIGHTNESS_2   V9
#define VPIN_DEVICE_ONLINE  V10

/* ================= OBJECTS ================= */
MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
BlynkTimer timer;
Preferences preferences;

/* ================= RFID VARS ================= */
const String ACCEPTED_UIDS[] = {"A7CA1EAF"};
const int    ACCEPTED_COUNT  = 1;
String       lastUID         = "none";
bool         lastAccessGranted = false;  // Track access control status
unsigned long rfidAccessCount = 0;

/* ================= SENSOR VARS ================= */
const int LDR_THRESHOLD = 2000;

unsigned long lastMotion1Time = 0;
unsigned long lastMotion2Time = 0;
const unsigned long LIGHT_DELAY        = 3000;
const unsigned long DB_SEND_INTERVAL   = 10000;
const unsigned long BLYNK_UPDATE_INTERVAL = 3000; // Reduced frequency
unsigned long lastDBSend = 0;

int   ldrValue        = 0;
bool  ir1Detected     = false;
bool  ir2Detected     = false;
int   brightness1     = 0;
int   brightness2     = 0;
int   soilValue       = 0;
float soilMoisturePct = 0;
int   lightControlMode = 0; // 0=Auto, 1=Force OFF, 2=Force ON

/* ================= NON-BLOCKING RFID VARS ================= */
unsigned long rfidLedStartTime = 0;
bool rfidLedActive = false;
bool rfidDeniedBlinkState = false;
int rfidDeniedBlinkCount = 0;
unsigned long rfidDeniedBlinkTime = 0;

/* ================= BATCH DATA STRUCTURE ================= */
struct SensorBatch {
  String rfid;
  bool accessGranted;  // Access control status
  int ldr;
  bool ir1;
  bool ir2;
  float soil;
  int brightness1;
  int brightness2;
  unsigned long rfidCount;
  String timestamp;
};
SensorBatch currentBatch;

/* ================= TASK HANDLES ================= */
TaskHandle_t httpTaskHandle = NULL;
SemaphoreHandle_t dataMutex = NULL;
volatile bool dataReadyToSend = false;

/* ================= FUNCTION DECLARATIONS ================= */
void handleRFID();
void handleLighting();
void handleSoil();
void updateBlynkDashboard();
void sendBatchToSupabase();
void httpTask(void* parameter);
String getTimestamp();
bool checkUID(String uid);
void debugPrint(String msg);

/* ================= DEBUG HELPER ================= */
void debugPrint(String msg) {
  #if DEBUG_MODE
    Serial.println(msg);
  #endif
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================");
  Serial.println("  ESP32 Smart System - OPTIMIZED");
  Serial.println("  Non-Blocking | Batch Requests");
  Serial.println("========================================\n");

  // GPIO
  pinMode(IR1_PIN, INPUT);
  pinMode(IR2_PIN, INPUT);
  pinMode(GATE_LED, OUTPUT);
  pinMode(GATE_LED2, OUTPUT);
  digitalWrite(GATE_LED, LOW);
  digitalWrite(GATE_LED2, LOW);

  // PWM
  ledcAttach(PWM_LED_1, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(PWM_LED_2, PWM_FREQ, PWM_RESOLUTION);

  // RFID
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("✓ RFID initialized");

  // Load saved RFID count
  preferences.begin("smart_city", false);
  rfidAccessCount = preferences.getULong("rfid_count", 0);
  Serial.println("✓ RFID access count loaded: " + String(rfidAccessCount));

  // Create Mutex for thread-safe data access
  dataMutex = xSemaphoreCreateMutex();

  // WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected: " + WiFi.localIP().toString());

    Blynk.config(BLYNK_AUTH_TOKEN);
    Blynk.connect();
    if (Blynk.connected()) {
      Serial.println("✓ Blynk Connected");
      Blynk.virtualWrite(VPIN_DEVICE_ONLINE, 1);
      Blynk.virtualWrite(VPIN_RFID_COUNT, rfidAccessCount);
      Blynk.virtualWrite(VPIN_LIGHT_CONTROL, lightControlMode);
    }

    // Create HTTP Task on Core 0 (Core 1 runs loop())
    xTaskCreatePinnedToCore(
      httpTask,           // Task function
      "HTTP_Task",        // Task name
      8192,               // Stack size (bytes)
      NULL,               // Parameters
      1,                  // Priority
      &httpTaskHandle,    // Task handle
      0                   // Core 0
    );
    Serial.println("✓ HTTP Task created on Core 0");
  } else {
    Serial.println("\n✗ WiFi Failed - Running Offline");
  }

  // NTP
  configTime(0, 0, "pool.ntp.org");

  // Blynk timer
  timer.setInterval(BLYNK_UPDATE_INTERVAL, updateBlynkDashboard);

  Serial.println("\n=== SMART SYSTEM READY ===");
  Serial.println("==========================\n");
}

/* ================= RFID (NON-BLOCKING) ================= */
bool checkUID(String uid) {
  for (int i = 0; i < ACCEPTED_COUNT; i++) {
    if (uid.equals(ACCEPTED_UIDS[i])) return true;
  }
  return false;
}

void handleRFID() {
  // Handle non-blocking LED states first
  unsigned long now = millis();
  
  // Handle granted LED timeout
  if (rfidLedActive && (now - rfidLedStartTime >= 1000)) {
    digitalWrite(GATE_LED, LOW);
    rfidLedActive = false;
    if (Blynk.connected()) {
      Blynk.virtualWrite(VPIN_RFID_LED, LOW);
    }
  }
  
  // Handle denied LED blinking
  if (rfidDeniedBlinkCount > 0) {
    if (now - rfidDeniedBlinkTime >= 300) {
      rfidDeniedBlinkState = !rfidDeniedBlinkState;
      digitalWrite(GATE_LED2, rfidDeniedBlinkState ? HIGH : LOW);
      rfidDeniedBlinkTime = now;
      if (!rfidDeniedBlinkState) {
        rfidDeniedBlinkCount--;
      }
    }
    return; // Don't check for new cards while blinking
  }

  // Check for new RFID card
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  uid.trim();
  lastUID = uid;

  debugPrint("----- RFID: " + uid + " -----");

  if (checkUID(uid)) {
    rfidAccessCount++;
    preferences.putULong("rfid_count", rfidAccessCount);
    debugPrint("✓ Access Granted | Count: " + String(rfidAccessCount));

    // Set access granted status
    lastAccessGranted = true;

    // Turn on LED (non-blocking)
    digitalWrite(GATE_LED, HIGH);
    rfidLedActive = true;
    rfidLedStartTime = now;

    // Update Blynk immediately
    if (Blynk.connected()) {
      Blynk.virtualWrite(VPIN_RFID_UID, uid);
      Blynk.virtualWrite(VPIN_RFID_COUNT, rfidAccessCount);
      Blynk.virtualWrite(VPIN_RFID_LED, HIGH);
    }

  } else {
    debugPrint("✗ Access Denied");
    
    // Set access denied status
    lastAccessGranted = false;
    
    // Start blinking sequence (non-blocking)
    rfidDeniedBlinkCount = 4; // 2 blinks = 4 state changes
    rfidDeniedBlinkTime = now;
    rfidDeniedBlinkState = true;
    digitalWrite(GATE_LED2, HIGH);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

/* ================= LIGHTING (PWM) ================= */
void handleLighting() {
  ir1Detected = digitalRead(IR1_PIN) == HIGH;
  ir2Detected = digitalRead(IR2_PIN) == HIGH;

  ldrValue = analogRead(LDR_PIN);
  // عكس المنطق: قراءة منخفضة = ظلام
  bool isDark = ldrValue < LDR_THRESHOLD;

  unsigned long now = millis();

  if (ir1Detected) lastMotion1Time = now;
  if (ir2Detected) lastMotion2Time = now;

  if (lightControlMode == 1) {
    brightness1 = 0;
    brightness2 = 0;
  } else if (lightControlMode == 2) {
    brightness1 = 255;
    brightness2 = 255;
  } else {
    brightness1 = 0;
    brightness2 = 0;
    if (isDark && (now - lastMotion1Time < LIGHT_DELAY)) {
      // عكس المنطق: كلما قلت القراءة (ظلام أكثر)، زادت الإضاءة
      brightness1 = map(ldrValue, 0, 2000, 255, 50);
      brightness1 = constrain(brightness1, 50, 255);
    }
    if (isDark && (now - lastMotion2Time < LIGHT_DELAY)) {
      brightness2 = map(ldrValue, 0, 2000, 255, 50);
      brightness2 = constrain(brightness2, 50, 255);
    }
  }

  ledcWrite(PWM_LED_1, brightness1);
  ledcWrite(PWM_LED_2, brightness2);
}

/* ================= SOIL ================= */
void handleSoil() {
  soilValue = analogRead(SOIL_PIN);
  soilMoisturePct = map(soilValue, 4095, 0, 0, 100);
  soilMoisturePct = constrain(soilMoisturePct, 0, 100);
}

/* ================= BLYNK DASHBOARD (OPTIMIZED) ================= */
void updateBlynkDashboard() {
  if (!Blynk.connected()) return;

  // Use Blynk.virtualWrite for individual updates (already optimized by Blynk library)
  Blynk.virtualWrite(VPIN_RFID_UID,      lastUID);
  Blynk.virtualWrite(VPIN_RFID_COUNT,    rfidAccessCount);
  Blynk.virtualWrite(VPIN_LDR_VALUE,     ldrValue);
  Blynk.virtualWrite(VPIN_IR1_STATUS,    ir1Detected ? "Motion" : "Clear");
  Blynk.virtualWrite(VPIN_IR2_STATUS,    ir2Detected ? "Motion" : "Clear");
  Blynk.virtualWrite(VPIN_SOIL_MOISTURE, (int)soilMoisturePct);
  Blynk.virtualWrite(VPIN_BRIGHTNESS_1,  brightness1);
  Blynk.virtualWrite(VPIN_BRIGHTNESS_2,  brightness2);
  // Device online is sent less frequently to reduce traffic
  static unsigned long lastOnlineUpdate = 0;
  if (millis() - lastOnlineUpdate > 30000) { // Every 30 seconds
    Blynk.virtualWrite(VPIN_DEVICE_ONLINE, 1);
    lastOnlineUpdate = millis();
  }
}

/* ================= BLYNK LIGHT CONTROL ================= */
BLYNK_WRITE(VPIN_LIGHT_CONTROL) {
  lightControlMode = param.asInt();
  debugPrint("Light Mode: " + String(lightControlMode));
}

/* ================= BLYNK CONNECTED ================= */
BLYNK_CONNECTED() {
  Serial.println("✓ Blynk reconnected");
  Blynk.virtualWrite(VPIN_DEVICE_ONLINE, 1);
  Blynk.virtualWrite(VPIN_RFID_COUNT, rfidAccessCount);
  Blynk.syncVirtual(VPIN_LIGHT_CONTROL);
}

/* ================= SUPABASE (BATCH REQUEST) ================= */
void sendBatchToSupabase() {
  // Prepare batch data with mutex protection
  if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
    currentBatch.rfid = lastUID;
    currentBatch.accessGranted = lastAccessGranted;
    currentBatch.ldr = ldrValue;
    currentBatch.ir1 = ir1Detected;
    currentBatch.ir2 = ir2Detected;
    currentBatch.soil = soilMoisturePct;
    currentBatch.brightness1 = brightness1;
    currentBatch.brightness2 = brightness2;
    currentBatch.rfidCount = rfidAccessCount;
    currentBatch.timestamp = getTimestamp();
    
    dataReadyToSend = true;
    xSemaphoreGive(dataMutex);
  }
}

/* ================= HTTP TASK (RUNS ON CORE 0) ================= */
void httpTask(void* parameter) {
  while (true) {
    if (dataReadyToSend && WiFi.status() == WL_CONNECTED) {
      
      // Copy data with mutex protection
      SensorBatch localBatch;
      if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
        localBatch = currentBatch;
        dataReadyToSend = false;
        xSemaphoreGive(dataMutex);
      }

      // Send batch request (single HTTP call)
      HTTPClient http;
      http.setTimeout(5000);
      http.begin(SUPABASE_URL + "/rest/v1/sensor_readings");
      http.addHeader("apikey",        SUPABASE_KEY);
      http.addHeader("Authorization", "Bearer " + SUPABASE_KEY);
      http.addHeader("Content-Type",  "application/json");
      http.addHeader("Prefer",        "return=minimal");

      // Create JSON with all sensor data in ONE request
      DynamicJsonDocument doc(512);
      doc["device_id"]   = DEVICE_ID;
      doc["timestamp"]   = localBatch.timestamp;
      doc["rfid_uid"]    = localBatch.rfid;
      doc["access_granted"] = localBatch.accessGranted;
      doc["rfid_count"]  = localBatch.rfidCount;
      doc["ldr_value"]   = localBatch.ldr;
      doc["ir1_motion"]  = localBatch.ir1;
      doc["ir2_motion"]  = localBatch.ir2;
      doc["soil_moisture"] = localBatch.soil;
      doc["brightness1"] = localBatch.brightness1;
      doc["brightness2"] = localBatch.brightness2;

      String json;
      serializeJson(doc, json);

      int httpCode = http.POST(json);

      if (httpCode == 200 || httpCode == 201 || httpCode == 204) {
        debugPrint("✓ Batch sent to Supabase");
      } else {
        Serial.println("✗ Supabase failed (HTTP " + String(httpCode) + ")");
      }

      http.end();
    }
    
    vTaskDelay(100 / portTICK_PERIOD_MS); // Check every 100ms
  }
}

/* ================= TIMESTAMP ================= */
String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return String(millis());
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

/* ================= LOOP (NON-BLOCKING) ================= */
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Blynk.run();
  }
  timer.run();

  handleRFID();      // Non-blocking now
  handleLighting();  // Fast sensor reads
  handleSoil();      // Fast sensor reads

  // Trigger batch send every 10 seconds
  if (millis() - lastDBSend > DB_SEND_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      sendBatchToSupabase(); // Prepares data, HTTP task sends it
    }
    lastDBSend = millis();
  }

  // No delay() - fully non-blocking!
}
