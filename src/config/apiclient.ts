import axios from 'axios';
import envconfig from './envConfig';

const apiClient = axios.create({
    baseURL: envconfig.getChirpstackUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Grpc-Metadata-Authorization': `Bearer ${envconfig.getChirpstackKey}`
    }
})

export default apiClient;