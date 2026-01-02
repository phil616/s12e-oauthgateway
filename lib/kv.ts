import axios from 'axios';

const KV_API_URL = process.env.KV_API_URL || 'https://your-project.edgeone.app/api';
const KV_API_KEY = process.env.KV_API_KEY || 'mysecret';

const kvClient = axios.create({
  baseURL: KV_API_URL,
  headers: {
    'X-KV-KEY': KV_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export async function getKV<T>(key: string): Promise<T | null> {
  try {
    const response = await kvClient.get(`/${key}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error(`Error getting KV key ${key}:`, error);
    throw error;
  }
}

export async function putKV(key: string, value: any): Promise<void> {
  try {
    await kvClient.put(`/${key}`, value);
  } catch (error) {
    console.error(`Error putting KV key ${key}:`, error);
    throw error;
  }
}

export async function deleteKV(key: string): Promise<void> {
  try {
    await kvClient.delete(`/${key}`);
  } catch (error) {
    console.error(`Error deleting KV key ${key}:`, error);
    throw error;
  }
}
