// Pin Definitions (Connected to Relay IN pins)
const int relayPump1 = 2;    // Relay Channel 1 → Pump 1
const int relayPump2 = 3;    // Relay Channel 2 → Pump 2 (NEW)
const int relayValve1 = 4;   // Relay Channel 3 → Valve 1
const int relayValve2 = 5;   // Relay Channel 4 → Valve 2
const int valve3Pin = 6;     // Direct GPIO for Valve 3 (if no relay left)
const int tdsSensorPin = A0; // TDS sensor

// Constants
const int tdsThreshold = 500;       // TDS threshold (ppm)
const unsigned long delay1Min = 60000; // 1 minute (ms)
const int totalCycles = 5;          // Number of cycles

void setup() {
  // Initialize relay control pins
  pinMode(relayPump1, OUTPUT);
  pinMode(relayPump2, OUTPUT);
  pinMode(relayValve1, OUTPUT);
  pinMode(relayValve2, OUTPUT);
  pinMode(valve3Pin, OUTPUT);

  // Start with all devices OFF
  digitalWrite(relayPump1, LOW);
  digitalWrite(relayPump2, LOW);
  digitalWrite(relayValve1, LOW);
  digitalWrite(relayValve2, LOW);
  digitalWrite(valve3Pin, LOW);

  Serial.begin(9600);
  Serial.println("System ready. Starting cycles...");
}

void loop() {
  for (int cycle = 1; cycle <= totalCycles; cycle++) {
    Serial.print("\n=== CYCLE "); Serial.print(cycle); Serial.println(" STARTED ===");

    // --- STEP 1: Start Pump 1 ---
    digitalWrite(relayPump1, HIGH); // Turn relay ON (adjust to LOW if active-low)
    Serial.println("[ACTION] Pump 1 (Tank) ON");
    delay(delay1Min);

    // --- STEP 2: Open Valve 1 ---
    digitalWrite(relayValve1, HIGH);
    Serial.println("[ACTION] Valve 1 OPEN");

    // --- STEP 3: Monitor TDS and Open Valve 2 ---
    Serial.println("[STATUS] Monitoring TDS...");
    unsigned long startTime = millis();
    float tdsValue;
    
    do {
      tdsValue = analogRead(tdsSensorPin) * (5.0 / 1023.0) * 200; // Calibrate!
      Serial.print("  TDS: "); Serial.print(tdsValue); Serial.println(" ppm");
      if (millis() - startTime > 300000) { // 5-minute timeout
        Serial.println("[WARNING] TDS timeout! Proceeding.");
        break;
      }
      delay(1000);
    } while (tdsValue >= tdsThreshold);

    digitalWrite(relayValve2, HIGH);
    Serial.println("[ACTION] Valve 2 OPEN (TDS < 500ppm)");
    delay(delay1Min);

    // --- STEP 4: Open Valve 3 (using GPIO) ---
    digitalWrite(valve3Pin, HIGH);
    Serial.println("[ACTION] Valve 3 OPEN");
    delay(delay1Min);

    // --- STEP 5: Start Pump 2 (via Relay) ---
    digitalWrite(relayPump2, HIGH);
    Serial.println("[ACTION] Pump 2 ON");
    delay(delay1Min);

    // --- Reset for next cycle ---
    digitalWrite(relayPump1, LOW);
    digitalWrite(relayPump2, LOW);
    digitalWrite(relayValve1, LOW);
    digitalWrite(relayValve2, LOW);
    digitalWrite(valve3Pin, LOW);
    Serial.println("[STATUS] All devices OFF. Waiting 10s...");
    delay(10000);
  }

  Serial.println("\n=== ALL 5 CYCLES COMPLETED ===");
  while (true); // Stop here
}