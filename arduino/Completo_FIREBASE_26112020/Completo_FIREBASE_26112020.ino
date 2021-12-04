//#include <Firebase.h>
#include <ESP8266WiFi.h>                                                    // Biblioteca Firebase
//#include <FirebaseArduino.h>                                                // Biblioteca Firebase
#include <DHT.h>                                                            // Biblioteca DHT11

#define FIREBASE_HOST "smartfire-94b06.firebaseio.com"                          // Nome do projeto e endereço do Firebase
#define FIREBASE_AUTH "N5xWgOYTNACbg4tzGooxrBHtXmbMYjCcawL40d2j"            // Senha Firebase

#define WIFI_SSID "G3_Canto"                                             // Nome do Wifi 
#define WIFI_PASSWORD "24112012"                                    // Senha do wifi
 
#define DHTPIN 4                                                           // Definição do pino GPIO digital
#define DHTTYPE DHT11                                                       // Definição do modelo do sensor de temperatura e umidade
DHT dht(DHTPIN, DHTTYPE);                                                     
const int flame_sensor_pin = 0;                                     // Definição do Pino GPIO sensor de chamas (D3 no ESP8266 NODEMCU = 0)                            
int flame_pin = HIGH ;

void setup() {
  Serial.begin(115200);
  delay(1000);                
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);                                     //Conectando wifi
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected to ");
  Serial.println(WIFI_SSID);
  Serial.print("IP Address is : ");
  Serial.println(WiFi.localIP());                                            //print local IP address
//  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                              // connect to firebase
  dht.begin();                                                               //Start reading dht sensor
}

void loop() { 
  float h = dht.readHumidity();                                              // Reading temperature or humidity takes about 250 milliseconds!
  float t = dht.readTemperature();                                           // Read temperature as Celsius (the default)
  float g = analogRead(A0);
  flame_pin = digitalRead (flame_sensor_pin) ;                


   if (isnan(g)) {
      Serial.println("Failed to read from MQ-2 sensor!");
      return;
       }
   if (flame_pin == LOW )  {
      Serial.println ( " Fogo Detectado!!! " ) ;
                 } 
  if (isnan(h) || isnan(t)) {                                                // Check if any reads failed and exit early (to try again).
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.print("Fire:");  Serial.print(flame_pin);
  String fire = String(flame_pin);  
  
  Serial.print("Gas Meter:");  Serial.print(g);
  String firegas = String(g) + String("ppm");  
  Serial.print("Humidity:");  Serial.print(h);
  String fireHumid = String(h) + String("%");                                         //convert integer humidity to string humidity 
  Serial.print("%  Temperature: ");  Serial.print(t);  Serial.println("°C");
  String fireTemp = String(t) + String("°C");                                                     //convert integer temperature to string temperature
  
 
  Serial.print(".");
  //Firebase.pushString("Gas Meter", firegas);                                  //setup path and send readings
  //Firebase.pushString("Humidity", fireHumid);                                  //setup path and send readings
  //Firebase.pushString("Temperature", fireTemp);
  //Firebase.pushString("Fire", fire);  
  delay(500);
  }
 
