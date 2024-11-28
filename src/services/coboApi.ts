import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { atomStore } from '@/atoms';
// %if app_type == portal
import { accessTokenAtom, refreshTokenAtom } from '@/atoms/auth';
// %endif

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8000';

interface Address {
  address: string;
  // Add other properties if needed
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

class CoboApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });
  }

  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  private async request<T>(method: string, url: string, data?: any, params?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request({
        method,
        url,
        data,
        params,
      });
      return response.data;
    } catch (error: any) {
      // %if app_type == portal
      if (error?.response?.status === 401) {
        this.setAuthToken("");
        atomStore.set(accessTokenAtom, "");
        atomStore.set(refreshTokenAtom, "");
        console.error("Auth failed. Please login and try again")
      } else {
        console.error('API request error:', error);
      }
      // %else
      console.error('API request error:', error);
      // %endif
      throw error;
    }
  }

  // %if app_type == portal
  async login(token: string): Promise<{ token: string; refresh_token: string }> {
    return this.request('POST', '/auth', { token });
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return this.request('POST', '/auth/refresh', { refresh_token: refreshToken })
  }
  // %endif

  // Wallet-related methods
  async getWallets(params?: any): Promise<any> {
    return this.request('GET', '/api/wallets', undefined, params);
  }

  async getWalletById(id: string): Promise<any> {
    return this.request('GET', `/api/wallets/${id}`);
  }

  async getWalletBalance(id: string, params?: any): Promise<any> {
    return this.request('GET', `/api/wallets/${id}/balance`, undefined, params);
  }

  async getWalletTransactions(id: string, params?: any): Promise<any> {
    return this.request('GET', `/api/wallets/${id}/transactions`, undefined, params);
  }

  async createNewAddress(id: string, data?: any): Promise<any> {
    return this.request('POST', `/api/wallets/${id}/addresses`, data);
  }

  async listWalletAddresses(id: string, params?: any): Promise<any> {
    return this.request('GET', `/api/wallets/${id}/addresses`, undefined, params);
  }

  async withdrawFromWallet(id: string, data: any): Promise<any> {
    return this.request('POST', `/api/wallets/${id}/withdraw`, data);
  }

  async listSupportedChains(params?: any): Promise<any> {
    return this.request('GET', '/api/wallets/chains', undefined, params);
  }

  async listSupportedTokens(params?: any): Promise<any> {
    return this.request('GET', '/api/wallets/tokens', undefined, params);
  }

  async checkAddressValidity(params: any): Promise<any> {
    return this.request('GET', '/api/wallets/check_address_validity', undefined, params);
  }

  // Transaction-related methods
  async listTransactions(params?: any): Promise<any> {
    return this.request('GET', '/api/transactions', undefined, params);
  }

  async getTransactionById(id: string): Promise<any> {
    return this.request('GET', `/api/transactions/${id}`);
  }

  async createTransferTransaction(data: any): Promise<any> {
    return this.request('POST', '/api/transactions/transfer', data);
  }

  async createContractCallTransaction(data: any): Promise<any> {
    return this.request('POST', '/api/transactions/contract_call', data);
  }

  async createMessageSignTransaction(data: any): Promise<any> {
    return this.request('POST', '/api/transactions/message_sign', data);
  }

  async listAddresses(walletId: string, tokenId: string): Promise<ApiResponse<Address[]>> {
    return this.request('GET', `/api/wallets/${walletId}/addresses`, undefined, { coin: tokenId });
  }

  async newAddress(walletId: string, tokenId: string): Promise<ApiResponse<Address>> {
    return this.request('POST', `/api/wallets/${walletId}/addresses`, { coin: tokenId });
  }
}

export const coboApi = new CoboApi();
export default coboApi;