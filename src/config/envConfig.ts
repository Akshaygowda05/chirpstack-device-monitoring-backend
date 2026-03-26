import dotenv from 'dotenv';

dotenv.config();

class envconfig {
    private static CHRIPSTACK_URL: string;
    private static CHRIPSTACK_KEY: string;
    private static TOKEN_SECRET: string;
    private static MQTT_URL: string;

    static initialize() {
        envconfig.CHRIPSTACK_URL = process.env.CHRIPSTACK_URL as string;
        envconfig.CHRIPSTACK_KEY = process.env.CHRIPSTACK_KEY as string;
        envconfig.TOKEN_SECRET = process.env.TOKEN_SECRET as string;
        envconfig.MQTT_URL = process.env.MQTT_URL as string;
    }

    static getChirpstackUrl(): string {
        return envconfig.CHRIPSTACK_URL;
    }

    static getChirpstackKey(): string {
        return envconfig.CHRIPSTACK_KEY;
    }   

    static getTokenSecret(): string {
        return envconfig.TOKEN_SECRET;
    }
    static getMqttUrl(): string {
        return envconfig.MQTT_URL;
    }
    
}

envconfig.initialize();

export default envconfig;