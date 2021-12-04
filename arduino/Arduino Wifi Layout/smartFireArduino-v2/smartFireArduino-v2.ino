#include <ArduinoJson.h>
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

  //Declarando variáveis de LED, Botão e Contador para Intervalo de Leitura dos Sensores.
  //led = 13 -> Porta D7; button = 15 -> Porta D8; buttonState = Estado de leitura do Botão; Interval e previusMillis = Tempo de Intervalo de leitura de sensores.
  int led = 13;
  int button = 15;
  int buttonState = 0;         
  int intervaloSensores = 19000;
  int intervaloAlerta = 1000;
  unsigned long previousMillisSensores=0;
  unsigned long previousMillisAlerta=0;
  
  //Definindo variáveis de configuração do Ponto de Monitoramento no Gerenciador de Redes(wifiManager).
  bool shouldSaveConfig = true;
  char codeRegiao[20];
  char codeIcon[20];
  
  //Definindo variáveis de endereços do firebase. device_status = Controle Remoto de leitura: ON/OFF;
  //device_data = Endereço de dados do sensor.
  //device_alert = Endereço de dados de alerta.
  String device_status;
  String device_data;
  String device_alert;
  String device_alert_status;
  
  //Fuso Horário de Brasília .
  int timeZone = -3;
  
  //Socket UDP que a lib utiliza para recuperar dados sobre o horário.
  WiFiUDP udp;
  
  //Objeto responsável por recuperar dados sobre horário em servidor.
  NTPClient timeClient(
      udp,                    //socket udp
      "0.br.pool.ntp.org",    //URL do servwer NTP
      timeZone*3600,          //Deslocamento do horário em relacão ao GMT 0
      60000);                 //Intervalo entre verificações online
  
  // Definindo porta de servidor Web para 80.
  WiFiServer server(80);
  
  //Para encontrar mudanças na fingerprint:
  //Entrar nesse link: https://www.grc.com/fingerprints.htm
  //Escrever: "test.firebaseio.com"
  //Substituir o valor da fingerprint na library: Firebase-arduino-master/src/FirebaseHttpClient; linha43


  #define FIREBASE_HOST "website-ea996-default-rtdb.firebaseio.com"                          // Nome do projeto e endereço do Firebase
  #define FIREBASE_AUTH "qAOTv2EhAKD6wDAxAmShkatvvWaDoI0p4n2X9FgD"                           // Senha Firebase
  FirebaseData fbdo;                                                                         // Objeto Firebase Data
  FirebaseJsonArray arr;                                                                     // Objeto Firebase Array

  
  #define DHTPIN 4                                                                           // Definição do pino GPIO digital
  #define DHTTYPE DHT11                                                                      // Definição do modelo do sensor de temperatura e umidade
  DHT dht(DHTPIN, DHTTYPE);                                                     
  const int flame_sensor_pin = 0;                                                            // Definição do Pino GPIO sensor de chamas (D3 no ESP8266 NODEMCU = 0)                            
  int flame_pin = HIGH ;
  
  // Variáveis para salvar tempo e horário.
  String formattedDate;
  String dayStamp;
  String timeStamp;
  
  //Definindo Gerenciador de Redes(wifiManager).
  WiFiManager wifiManager;

void setup() {
    
  // Inicializando o programa
  Serial.begin(115200);                                                  
  Serial.println(); 
  Serial.println("mounting FS...");

  //Protocolo Json para definição de variáveis de configuração do Ponto de Monitoramento no Gerenciador de Redes(wifiManager).
  if (SPIFFS.begin()) {
    Serial.println("Sistema de arquivos montado");
    if (SPIFFS.exists("/config.json")) {
      //existe arquivo, lendo e carregando
      Serial.println("Lendo arquivo config");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("Abrindo arquivo config");
        size_t size = configFile.size();
        //Alocando bufer (região de memória física utilizada para armazenar temporariamente os dados enquanto eles estão sendo movidos de um lugar para outro),
        //para armazenar variáveis de arquivo.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\njson analisado.");

          strcpy(codeRegiao, json["codeRegiao"]);
          strcpy(codeIcon, json["codeIcon"]);

        } else {
          Serial.println("falha ao carregar o json config");
        }
      }
    }
  } else {
    Serial.println("falha ao montar FS");
  }
  //Finalização de montagem.
  
  // Os parâmetros extras a serem configurados no Gerenciador de Redes(wifiManager) de configurações do ponto de Monitoramento.
  WiFiManagerParameter custom_code_region("server", "Código da Região", codeRegiao, 20);
  WiFiManagerParameter custom_code_icon("port", "Código do Monitoramento", codeIcon, 20);

   //adicionando parâmetros no objeto do Gerenciador de Redes(wifiManager).
  wifiManager.addParameter(&custom_code_region);
  wifiManager.addParameter(&custom_code_icon);

  //utilizando esse comando, as configurações são apagadas da memória
  //caso tiver salvo alguma rede para conectar automaticamente, ela é apagada.
  //wifiManager.resetSettings();

  //cria uma rede de nome ESP8266-Access-Point com senha 12345678
  
  if(!wifiManager.autoConnect("ESP8266-Access-Point", "12345678")){
  Serial.println("Falha ao conectar e atingiu o tempo limite.");
    delay(3000);
    //Resetar o Esp-8266 para tentar novamente.
    ESP.restart();
  }
  Serial.println("conectado...:)");

  //Lendo os parâmetros de configurações do ponto de Monitoramento.
  strcpy(codeRegiao, custom_code_region.getValue());
  strcpy(codeIcon, custom_code_icon.getValue());

  //Salvado os parâmetros de configurações do ponto de Monitoramento no FS
  if (shouldSaveConfig) {
    Serial.println("salvando config json");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["codeRegiao"] = codeRegiao;
    json["codeIcon"] = codeIcon;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("falha ao abrir o arquivo config para escrita.");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //Salvo com sucesso!
  }

  //Imprimindo no Monitor dados de rede.
  Serial.println("local ip");
  Serial.println(WiFi.localIP());
  Serial.println(codeRegiao);
  Serial.println(codeIcon);

  //Definindo variáveis de endereços do firebase. device_status = Controle Remoto de leitura: ON/OFF;
  //device_data = Endereço de dados do sensor.
  //device_alert = Endereço de dados de alerta.
  String regiao = codeRegiao;
  String icon = codeIcon;
  device_status = "regioes/"+regiao+"/pontosMonitoramento/"+icon+"/status";
  device_data = "regioes/"+regiao+"/pontosMonitoramento/"+icon+"/dados";
  device_alert = "alertas/"+regiao+"/"+icon;
  device_alert_status = device_alert+"/status";

  //Inicio de Leitura de Sensores.
  dht.begin();
  Serial.println("Conectado com sucesso aos sensores!");
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  // Conexão ao Firebase.                           
  Serial.println("Conectado com sucesso ao firebase!");

  //Verificação dos dados de configuração de Monitoramento no firebase. Se os dados estiverem incorretos, o Esp-8266 é reiniciado.
  if(Firebase.getString(fbdo,device_status)){
    Serial.println("Checando configurações de Monitoramento...");
    if(fbdo.stringData()==""){
      Serial.println("configurações de Monitoramento não conferem no Sistema!");
      Serial.println("Reiniciando Configurações...");
      wifiManager.resetSettings();
      Serial.println("Reiniciando ESP...");
      ESP.restart();
    }
  }else{
    Serial.println("Não foi possível Checar configurações de Monitoramento devido a problemas de Conectividade");
    Serial.println("Reiniciando ESP...");
    ESP.restart();
  }


  //Conectando no servidor público para leitura de dados de tempo.
  timeClient.begin();  
  Serial.println("Connected to NTP Client");

  //Definindo portas de Led e Botão.
  pinMode(led, OUTPUT);
  pinMode(button, INPUT);
}

void loop(){
  //Se a conexão com a Internet existir, o Led é posto em estado ON, se não Existir em Estado OFF e o Esp-8266 sofre um reset de energia
  //para tentar reconectar na Rede.
  if (WiFi.status() == WL_CONNECTED){
    digitalWrite(led, HIGH);
  }else{
    Serial.println("Internet não Conectada");
    digitalWrite(led, LOW);
    ESP.restart();
  }
  //Leitura do Estado lógico do Botão, uma vez apertado, o Esp-8266 sofre um reset de energia e de configurações de rede 
  //para reiserir os dados de Rede e de Configuraçoes de Monitoramento.
  buttonState = digitalRead(button);
  if (buttonState == HIGH) {
    Serial.println("Botão Ativado");
    // Desligando Led:
    digitalWrite(led, HIGH);
    WiFiManager wifiManager;
    wifiManager.resetSettings();
    Serial.println("Reiniciando ESP...");
    ESP.restart();
  }

  //Definindo tempo de intervalo de Leitura de Sensores.
  unsigned long currentMillisSensores = millis();

  //Definindo tempo de intervalo de Leitura de Alerta.
  unsigned long currentMillisAlerta = millis();

  if ((unsigned long)(currentMillisAlerta - previousMillisAlerta) >= intervaloAlerta) {
   loopAlerta();
   previousMillisAlerta = currentMillisAlerta;
  }
  
  if ((unsigned long)(currentMillisSensores - previousMillisSensores) >= intervaloSensores) {
   loopDadosSensores();
   previousMillisSensores = currentMillisSensores;
  }
  
}

void loopAlerta(){
  Serial.println("LoopAlerta");
  //Leitura de Tempo do servidor NTP;
  Serial.println("TimeSet");
  timeClient.update();
  formattedDate = timeClient.getFormattedDate();
  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
  timeStamp = formattedDate.substring(splitT+1, formattedDate.length()-1);
  
  //Lendo Humidade, Temperatura, Gás e Fogo, na ordem descrita. Obs: Ler temperatura ou Humidade leva em torno de 250milis
  Serial.println("Lendo Sensores");
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float g = analogRead(A0);
  flame_pin = digitalRead (flame_sensor_pin);                

  Serial.println("Definindo falha de Sensores");
  if (isnan(g)) {
    Serial.println("Falha de leitura do sensor MQ-2!");
    return;
  }
  if (flame_pin == LOW )  {
    Serial.println ( "Fogo Detectado!!! " ) ;
  } 
  if (isnan(h) || isnan(t)) {                                                
    Serial.println("Falha de leitura do sensor DHT!");
    return;
  }
  String fire = String(flame_pin);  
  
  //Convertendo Leituras de variáveis de tipo Inteiro para String 
  Serial.println("Convertendo Leituras de variáveis de tipo Inteiro para String ");
  String firegas = String(g);
  String fireHumid = String(h);
  String fireTemp = String(t);
  
  //Enviando dados ao firebase e condições para envio de alertas.  
  //Declarar objetos FirebaseJson
  Serial.println("Declarar objetos FirebaseJson");
  FirebaseJson jsonAlertaGas;
  FirebaseJson jsonAlertaHum;
  FirebaseJson jsonAlertaTem;
  FirebaseJson jsonAlertaFire;

  
  if(g>1118){
    Serial.println("Detectada Leitura de Gás acima do permitido(1118ppm).");
    jsonAlertaGas
    .add("data",dayStamp)
    .add("hora",timeStamp)
    .add("gas",firegas)
    .add("hum",fireHumid)
    .add("tem",fireTemp)
    .add("status","ON");
    Serial.println("getString,device_status");
    Firebase.getString(fbdo,device_status);
    if(fbdo.stringData()=="ON"){
      Serial.println("getString,device_alert_status");
      Firebase.getString(fbdo,device_alert_status);
      if(fbdo.stringData()!="ON"){
        if(Firebase.pushJSON(fbdo,device_alert+"/GÁS",jsonAlertaGas)){
          if(Firebase.setString(fbdo,device_alert_status,"ON")){
            Serial.println("Alerta de Gás enviado ao Firebase com sucesso!");
          }else{
            Serial.println("Falha ao ativar Status de Alerta no Firebase!");
          }
        }else{
          Serial.println("Falha ao enviar Alerta de Gás ao Firebase!");
        }
      }
    }
  }
  if(h<12){
    Serial.println("Detectada Leitura de Humidade abaixo permitido(12%).");
    jsonAlertaHum
    .add("data",dayStamp)
    .add("hora",timeStamp)
    .add("gas",firegas)
    .add("hum",fireHumid)
    .add("tem",fireTemp)
    .add("status","ON");
    Serial.println("getString,device_status");
    Firebase.getString(fbdo,device_status);
    if(fbdo.stringData()=="ON"){
      Serial.println("getString,device_alert_status");
      Firebase.getString(fbdo,device_alert_status);
      if(fbdo.stringData()!="ON"){
        if(Firebase.pushJSON(fbdo,device_alert+"/HUMIDADE",jsonAlertaHum)){
          if(Firebase.setString(fbdo,device_alert_status,"ON")){
            Serial.println("Alerta de Humidade enviado ao Firebase com sucesso!");
          }else{
            Serial.println("Falha ao ativar Status de Alerta no Firebase!");
          }
        }else{
          Serial.println("Falha ao enviar Alerta de Humidade ao Firebase!");
        }
      }
    }
  }
  if(t>50){
    Serial.println("Detectada Leitura de Temperatura acima do permitido(50ºC).");
    jsonAlertaTem
    .add("data",dayStamp)
    .add("hora",timeStamp)
    .add("gas",firegas)
    .add("hum",fireHumid)
    .add("tem",fireTemp)
    .add("status","ON");
    Serial.println("getString,device_status");
    Firebase.getString(fbdo,device_status);
    if(fbdo.stringData()=="ON"){
      Serial.println("getString,device_alert_status");
      Firebase.getString(fbdo,device_alert_status);
      if(fbdo.stringData()!="ON"){
        if(Firebase.pushJSON(fbdo,device_alert+"/TEMPERATURA",jsonAlertaTem)){
          if(Firebase.setString(fbdo,device_alert_status,"ON")){
            Serial.println("Alerta de Temperatura enviado ao Firebase com sucesso!");
          }else{
            Serial.println("Falha ao ativar Status de Alerta no Firebase!");
          }
        }else{
          Serial.println("Falha ao enviar Alerta de Temperatura ao Firebase!");
        }
      }
    }
  }
  if(flame_pin==LOW){
    Serial.println("Detectado fogo!");
    jsonAlertaFire
    .add("data",dayStamp)
    .add("hora",timeStamp)
    .add("gas",firegas)
    .add("hum",fireHumid)
    .add("tem",fireTemp)
    .add("status","ON");
    Serial.println("getString,device_status");
    Firebase.getString(fbdo,device_status);
    if(fbdo.stringData()=="ON"){
      Serial.println("getString,device_alert_status");
      Firebase.getString(fbdo,device_alert_status);
      if(fbdo.stringData()!="ON"){
        if(Firebase.pushJSON(fbdo,device_alert+"/FOGO",jsonAlertaFire)){
          if(Firebase.setString(fbdo,device_alert_status,"ON")){
            Serial.println("Alerta de Fogo enviado ao Firebase com sucesso!");
          }else{
            Serial.println("Falha ao ativar Status de Alerta no Firebase!");
          }
        }else{
          Serial.println("Falha ao enviar Alerta de Fogo ao Firebase!");
        }
      }
    }
  }
  Serial.println("FimLoopAlerta");
}

void loopDadosSensores(){
  Serial.println("LoopSensores");
  //Leitura de Tempo do servidor NTP;
  timeClient.update();
  formattedDate = timeClient.getFormattedDate();
  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
  Serial.println(dayStamp);
  timeStamp = formattedDate.substring(splitT+1, formattedDate.length()-1);
  Serial.println(timeStamp);
  
  //Lendo Humidade, Temperatura, Gás e Fogo, na ordem descrita. Obs: Ler temperatura ou Humidade leva em torno de 250milis
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float g = analogRead(A0);
  flame_pin = digitalRead (flame_sensor_pin);                

  if (isnan(g)) {
    Serial.println("Falha de leitura do sensor MQ-2!");
    return;
  }
  if (flame_pin == LOW )  {
    Serial.println ( "Fogo Detectado!!! " ) ;
  } 
  if (isnan(h) || isnan(t)) {                                                
    Serial.println("Falha de leitura do sensor DHT!");
    return;
  }
  Serial.print("Fire:");  Serial.print(flame_pin);
  String fire = String(flame_pin);  
  
  //Convertendo Leituras de variáveis de tipo Inteiro para String 
  Serial.print("Gas Meter:");  Serial.print(g);
  String firegas = String(g); //+ String("ppm");  
  Serial.print("Humidity:");  Serial.print(h);
  String fireHumid = String(h); //+ String("%");                                         
  Serial.print("%  Temperature: ");  Serial.print(t);  Serial.println("°C");
  String fireTemp = String(t); //+ String("°C");                                                     
  
  //Enviando dados ao firebase e condições para envio de alertas.
  Serial.print(".");
  
  Firebase.getString(fbdo,device_status);
  if(fbdo.stringData()=="ON"){
    if(Firebase.setString(fbdo,device_data+"/"+"Gas Meter"+"/"+dayStamp+"/"+timeStamp, firegas)){
      Serial.println("Dado de Sensor de Gás enviado ao Firebase com sucesso!");
    }else{
      Serial.println("Falha ao enviar Dado de Sensor de Gás ao Firebase!");
    }
    if(Firebase.setString(fbdo,device_data+"/"+"Humidity"+"/"+dayStamp+"/"+timeStamp, fireHumid)){
      Serial.println("Dado de Sensor de Humidade enviado ao Firebase com sucesso!");
    }else{
      Serial.println("Falha ao enviar Dado de Sensor de Humidade ao Firebase!");
    }
    if(Firebase.setString(fbdo,device_data+"/"+"Temperature"+"/"+dayStamp+"/"+timeStamp, fireTemp)){
      Serial.println("Dado de Sensor de Temperatura enviado ao Firebase com sucesso!");
    }else{
      Serial.println("Falha ao enviar Dado de Sensor de Temperatura ao Firebase!");
    }
  }
}
