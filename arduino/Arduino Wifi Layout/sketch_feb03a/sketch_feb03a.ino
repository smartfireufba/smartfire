 #include <Process.h>
#include <Firebase.h>
#include <FirebaseArduino.h>   
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>         // https://github.com/tzapu/WiFiManager
#include <DHT.h>
#include <NTPClient.h>

int led = 13;


//define your default values here, if there are different values in config.json, they are overwritten.
bool shouldSaveConfig = true;
char codeRegiao[20];
char codeIcon[20];

//Define Esp-8266 Device Name:
//Hexadecimal - 8 Digits
String device_status;
String device_data;
String device_alert;

//Fuso Horário de Brasília 
int timeZone = -3;

//Socket UDP que a lib utiliza para recuperar dados sobre o horário
WiFiUDP udp;

//Objeto responsável por recuperar dados sobre horário
NTPClient timeClient(
    udp,                    //socket udp
    "0.br.pool.ntp.org",    //URL do servwer NTP
    timeZone*3600,          //Deslocamento do horário em relacão ao GMT 0
    60000);                 //Intervalo entre verificações online

// Set web server port number to 80
WiFiServer server(80);

//To find and change the current fingerprint:
//Go to https://www.grc.com/fingerprints.htm
//Enter "test.firebaseio.com"

#define FIREBASE_HOST "website-ea996-default-rtdb.firebaseio.com"                          // Nome do projeto e endereço do Firebase
#define FIREBASE_AUTH "qAOTv2EhAKD6wDAxAmShkatvvWaDoI0p4n2X9FgD"                           // Senha Firebase

//const int PIN_AP = 2;
#define DHTPIN 4                                                                           // Definição do pino GPIO digital
#define DHTTYPE DHT11                                                                      // Definição do modelo do sensor de temperatura e umidade
DHT dht(DHTPIN, DHTTYPE);                                                     
const int flame_sensor_pin = 0;                                                            // Definição do Pino GPIO sensor de chamas (D3 no ESP8266 NODEMCU = 0)                            
int flame_pin = HIGH ;

// Variables to save date and time
String formattedDate;
String dayStamp;
String timeStamp;

WiFiManager wifiManager;

void setup() {
    
  // Initialize the output variables as outputs
  Serial.begin(115200);                                                  // initialize Serial
  Serial.println(); 

  //read configuration from FS json
  Serial.println("mounting FS...");

  if (SPIFFS.begin()) {
    Serial.println("mounted file system");
    if (SPIFFS.exists("/config.json")) {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");

          strcpy(codeRegiao, json["codeRegiao"]);
          strcpy(codeIcon, json["codeIcon"]);

        } else {
          Serial.println("failed to load json config");
        }
      }
    }
  } else {
    Serial.println("failed to mount FS");
  }
  //end read
  
  // The extra parameters to be configured (can be either global or just in the setup)
  // After connecting, parameter.getValue() will get you the configured value
  // id/name placeholder/prompt default length
  WiFiManagerParameter custom_code_region("server", "Código da Região", codeRegiao, 20);
  WiFiManagerParameter custom_code_icon("port", "Código do Ícone", codeIcon, 20);

  
  //declaração do objeto wifiManager
  //WiFiManager wifiManager;

  //add all your parameters here
  wifiManager.addParameter(&custom_code_region);
  wifiManager.addParameter(&custom_code_icon);

  //utilizando esse comando, as configurações são apagadas da memória
  //caso tiver salvo alguma rede para conectar automaticamente, ela é apagada.
  wifiManager.resetSettings();

//cria uma rede de nome ESP_AP com senha 12345678
  
  if(!wifiManager.autoConnect("ESP8266-Access-Point", "12345678")){
  Serial.println("failed to connect and hit timeout");
    delay(3000);
    //reset and try again, or maybe put it to deep sleep
    ESP.restart();
  }
  Serial.println("connected...:)");

  //read updated parameters
  strcpy(codeRegiao, custom_code_region.getValue());
  strcpy(codeIcon, custom_code_icon.getValue());

  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["codeRegiao"] = codeRegiao;
    json["codeIcon"] = codeIcon;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //end save
  }

  Serial.println("local ip");
  Serial.println(WiFi.localIP());
  Serial.println(codeRegiao);
  Serial.println(codeIcon);

  String regiao = codeRegiao;
  String icon = codeIcon;
  device_status = "regioes/"+regiao+"/pontosMonitoramento/"+icon+"/status";
  device_data = "regioes/"+regiao+"/pontosMonitoramento/"+icon+"/dados";
  device_alert = "alertas/"+regiao+"/"+icon;
    
  dht.begin();                                                               //Start reading dht sensor
  Serial.println("Connected to dht");
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                              // connect to firebase
  Serial.println("Connected to Firebase");
  
  if(Firebase.getString(device_status)==""){
    Serial.println("vazio");
    Serial.println("Reiniciando Configurações...");
    wifiManager.resetSettings();
    Serial.println("Reiniciando ESP...");
    ESP.restart();
  }
  
  timeClient.begin();  
  Serial.println("Connected to NTP Client");

  pinMode(led, OUTPUT);
}

void loop(){
  timeClient.update();

  formattedDate = timeClient.getFormattedDate();
  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
  Serial.println(dayStamp);
  // Extract time
  timeStamp = formattedDate.substring(splitT+1, formattedDate.length()-1);
  Serial.println(timeStamp);
  
  if (WiFi.status() == WL_CONNECTED){
    Serial.println("Internet Connected");
    digitalWrite(led, HIGH);
  }else{
    Serial.println("Internet not Connected");
    digitalWrite(led, LOW);
    ESP.restart();
  }
  float h = dht.readHumidity();                                              // Reading temperature or humidity takes about 250 milliseconds!
  float t = dht.readTemperature();                                           // Read temperature as Celsius (the default)
  float g = analogRead(A0);
  flame_pin = digitalRead (flame_sensor_pin);                


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
  String firegas = String(g); //+ String("ppm");  
  Serial.print("Humidity:");  Serial.print(h);
  String fireHumid = String(h); //+ String("%");                                         //convert integer humidity to string humidity 
  Serial.print("%  Temperature: ");  Serial.print(t);  Serial.println("°C");
  String fireTemp = String(t); //+ String("°C");                                                     //convert integer temperature to string temperature

  Serial.print(Firebase.getString("regioes/1234"));
 
  Serial.print(".");
  if(Firebase.getString(device_status)=="ON"){
    Firebase.setString(device_data+"/"+"Gas Meter"+"/"+dayStamp+"/"+timeStamp, firegas);                                  //setup path and send readings
    if(g>1118){
      Firebase.setString(device_alert+"/"+"Gas Meter"+"/"+dayStamp+"/"+timeStamp, firegas);
    }
    Firebase.setString(device_data+"/"+"Humidity"+"/"+dayStamp+"/"+timeStamp, fireHumid);                                  //setup path and send readings
    if(h<12){
      Firebase.setString(device_alert+"/"+"Humidity"+"/"+dayStamp+"/"+timeStamp, fireHumid);
    }
    Firebase.setString(device_data+"/"+"Temperature"+"/"+dayStamp+"/"+timeStamp, fireTemp);
    if(t>50){
      Firebase.setString(device_alert+"/"+"Temperature"+"/"+dayStamp+"/"+timeStamp, fireTemp);
    }
    Firebase.setString(device_data+"/"+"Fire"+"/"+dayStamp+"/"+timeStamp, fire);
    if(flame_pin==0){
      Firebase.setString(device_alert+"/"+"Fire"+"/"+dayStamp+"/"+timeStamp, fire);
    }
    if(Firebase.failed()){
      Serial.println("Firebase error");
      Serial.println(Firebase.error());
    }
    Serial.println("FirebaseSentData");
  }
  delay(29000);
}
