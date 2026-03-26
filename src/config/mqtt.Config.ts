import mqtt , { MqttClient } from 'mqtt';
import dotenv from 'dotenv';
import loggers from './logger';
import { queueClient } from './redisConfig';
import envconfig from './envConfig';




export class MQTTconfig{
    private client:MqttClient;
    private readonly brokerURL:string;
    private readonly topic:string;

    constructor(){
        this.brokerURL = envconfig.getMqttUrl() as string;
        this.topic = `+/+/device/+/event/up`;

        this.client  = mqtt.connect(this.brokerURL,{
            clientId: `mqttjs_${Math.random().toString(16).slice(2, 10)}`,
            clean: true,
            keepalive: 60,
            reconnectPeriod: 4000,
            connectTimeout: 30000,
        })

       this.registerEvents();


    }


    private registerEvents(){
        this.client.on('connect',() => {
            
            loggers.info('✅ Connected to MQTT broker')
            console.log("MQTT init running...");
            this.client.subscribe(this.topic,(err)=>{
                if(err){
                    loggers.error('❌ MQTT Subscription error:',err.message);
                } else {                    loggers.info(`📡 Subscribed to MQTT topic: ${this.topic}`);
                }
            })
        });
       
        this.client.on('message',(topic,message) => this.onMessage(topic,message));
        this.client.on('error',(error) => loggers.error('❌ MQTT Error:',error.message));
        this.client.on('reconnect',() => loggers.info('🔄 Reconnecting to MQTT broker...'));
        this.client.on('close',() => loggers.warn('⚠️ Disconnected from MQTT broker'));
    }

    private async  onMessage(topic:string,message:Buffer){
        try{
            const payload = message.toString();
            //console.log(`Received MQTT message on topic ${topic}: ${payload}`);
           await  queueClient.add('processMqttMessage',{topic,payload},{
                removeOnComplete:true,
                removeOnFail:true
            });
            loggers.info(`📩 MQTT Message received on topic ${topic}`);
        }
        catch(error){
            loggers.error('❌ Error processing MQTT message:',JSON.stringify(error));
        }
    }

  
}

