import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.industrial-gateway');
const TOKEN_FILE = path.join(CONFIG_DIR, 'token');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface Config {
  apiUrl: string;
  token?: string;
}

export class API {
  private client: AxiosInstance;
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {},
    });
  }

  private loadConfig(): Config {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }

      let config: Config = {
        apiUrl: process.env.IGP_API_URL || 'http://localhost:3000/api',
      };

      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        config = { ...config, ...JSON.parse(data) };
      }

      if (fs.existsSync(TOKEN_FILE)) {
        config.token = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
      }

      return config;
    } catch (error) {
      return {
        apiUrl: 'http://localhost:3000/api',
      };
    }
  }

  saveConfig(config: Partial<Config>) {
    this.config = { ...this.config, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  saveToken(token: string) {
    fs.writeFileSync(TOKEN_FILE, token);
    this.config.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
    delete this.config.token;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    this.saveToken(response.data.token);
    return response.data;
  }

  async getPlcs(type?: string) {
    const response = await this.client.get('/plcs', {
      params: type ? { type } : {},
    });
    return response.data;
  }

  async getPlc(id: string) {
    const response = await this.client.get(`/plcs/${id}`);
    return response.data;
  }

  async createPlc(data: any) {
    const response = await this.client.post('/plcs', data);
    return response.data;
  }

  async startPlc(id: string) {
    const response = await this.client.post(`/plcs/${id}/start`);
    return response.data;
  }

  async stopPlc(id: string) {
    const response = await this.client.post(`/plcs/${id}/stop`);
    return response.data;
  }

  async deletePlc(id: string) {
    const response = await this.client.delete(`/plcs/${id}`);
    return response.data;
  }

  async getTags(plcId: string) {
    const response = await this.client.get(`/tags/plc/${plcId}`);
    return response.data;
  }

  async createTag(data: any) {
    const response = await this.client.post('/tags', data);
    return response.data;
  }

  async getMappings() {
    const response = await this.client.get('/mappings');
    return response.data;
  }

  async createMapping(data: any) {
    const response = await this.client.post('/mappings', data);
    return response.data;
  }

  async deleteMapping(id: string) {
    const response = await this.client.delete(`/mappings/${id}`);
    return response.data;
  }

  async getLogs(params?: any) {
    const response = await this.client.get('/logs', { params });
    return response.data;
  }

  async health() {
    const response = await this.client.get('/health', {
      baseURL: this.config.apiUrl.replace('/api', ''),
    });
    return response.data;
  }
}

export const api = new API();
