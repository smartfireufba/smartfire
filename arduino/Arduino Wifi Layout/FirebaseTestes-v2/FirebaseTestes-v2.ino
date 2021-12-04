#include <FirebaseESP8266.h>
#include <FirebaseESP8266HTTPClient.h>
#include <FirebaseFS.h>
#include <FirebaseJson.h>  
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <DHT.h>
#include <NTPClient.h>

#define WIFI_SSID "Galera Hostel 1"                                             // Nome do Wifi 
#define WIFI_PASSWORD "4FAA7B6C2D"                                    // Senha do wifi
#define FIREBASE_HOST "website-ea996-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "qAOTv2EhAKD6wDAxAmShkatvvWaDoI0p4n2X9FgD"

int led = 13;
int button = 15;
int buttonState = 0;         // variable for reading the pushbutton status
int interval = 9000;
unsigned long previousMillis=0;
int count = 0;

FirebaseData fbdo;
FirebaseJsonArray arr;

void setup() {
  Serial.begin(9600);                                                  // initialize Serial
  Serial.println("begin"); 
  
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
  Serial.println(WiFi.localIP());            

   Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  //2. Enable auto reconnect the WiFi when connection lost
  Firebase.reconnectWiFi(true);
  

  // put your setup code here, to run once:

  //Declare FirebaseJson object (global or local)
  FirebaseJson json;
  
  //Add name with value Living Room to JSON object
  //json.add("name", "Living Room");
  
  //Add temp1 with value 120 and temp1 with 40 to JSON object
  //Note: temp2 is not the child of temp1 as in previous version.
  //json.add("temp1", 120).add("temp2", 40);
  
  //Add nested child contents directly
  json.set("67d711/f6bf/cod123/tipo3", "tipo1");
  json.set("67d711/f6bf/cod123/tipo4", "tipo2");
  json.set("67d711/6222/cod124/tipo3", "tipo1");
  json.set("67d711/6222/cod124/tipo4", "tipo2");
  
  //To print out as prettify string
  String jsonStr;
  json.toString(jsonStr, true);
  if(jsonStr == "{}"){
    Serial.println("vazio");
  }else{
    Serial.println("non-vazio");
  }
  Serial.println(jsonStr);

  Serial.println("SAVING FIREBASE JSON: ");
  if(Firebase.getString(fbdo,"regioes/67d711/pontosMonitoramento/f6bf/status")){
    Serial.println(fbdo.dataType());
    Serial.println(fbdo.stringData());
  }
  //set Json irá apagar todo o caminho e colocar o json definido no local.
  Firebase.setJSON(fbdo,"alertas",json);
  //para adicionar vários arquivos de mesma forma, o melhor é utilizar o array;
  Firebase.pushString(fbdo,"oi/xau/issoai","cole");
}

void loop() {
  count ++;
  arr.clear();
  
  
}
