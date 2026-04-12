import dotenv from 'dotenv';

dotenv.config();

class envconfig {
    private static CHRIPSTACK_URL: string;
    private static CHRIPSTACK_KEY: string;
    private static TOKEN_SECRET: string;
    private static MQTT_URL: string;
    private static REDIS_HOST: string;
    private static REDIS_PORT: number;
    

    static initialize() {
        envconfig.CHRIPSTACK_URL = process.env.CHRIPSTACK_URL as string;
        envconfig.CHRIPSTACK_KEY = process.env.CHRIPSTACK_KEY as string;
        envconfig.TOKEN_SECRET = process.env.TOKEN_SECRET as string;
        envconfig.MQTT_URL = process.env.MQTT_URL as string;
    }

    static  getChirpstackUrl(): string {
        return envconfig.CHRIPSTACK_URL;
    }

    static getChirpstackKey(): string {
        console.log("CHRIPSTACK_KEY:", envconfig.CHRIPSTACK_KEY); // Debug log to check the value
        return envconfig.CHRIPSTACK_KEY;
    }   

    static getTokenSecret(): string {
        return envconfig.TOKEN_SECRET;
    }
    static getMqttUrl(): string {
        return envconfig.MQTT_URL;
    }

    static getRedisHost(): string {
        return process.env.REDIS_HOST!;
    }

    static getRedisPort(): number {
        return Number(process.env.REDIS_PORT) || 6379;
    }
    
}

envconfig.initialize();

export default envconfig;