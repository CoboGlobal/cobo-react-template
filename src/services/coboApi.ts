import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8000/api';

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
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Wallet-related methods
  async getWallets(params?: any): Promise<any> {
    return this.request('GET', '/wallets', undefined, params);
  }

  async getWalletById(id: string): Promise<any> {
    return this.request('GET', `/wallets/${id}`);
  }

  async getWalletBalance(id: string, params?: any): Promise<any> {
    return this.request('GET', `/wallets/${id}/balance`, undefined, params);
  }

  async getWalletTransactions(id: string, params?: any): Promise<any> {
    return this.request('GET', `/wallets/${id}/transactions`, undefined, params);
  }

  async createNewAddress(id: string, data?: any): Promise<any> {
    return this.request('POST', `/wallets/${id}/addresses`, data);
  }

  async listWalletAddresses(id: string, params?: any): Promise<any> {
    return this.request('GET', `/wallets/${id}/addresses`, undefined, params);
  }

  async withdrawFromWallet(id: string, data: any): Promise<any> {
    return this.request('POST', `/wallets/${id}/withdraw`, data);
  }

  async listSupportedChains(params?: any): Promise<any> {
    return this.request('GET', '/wallets/chains', undefined, params);
  }

  async listSupportedTokens(params?: any): Promise<any> {
    return this.request('GET', '/wallets/tokens', undefined, params);
  }

  async checkAddressValidity(params: any): Promise<any> {
    return this.request('GET', '/wallets/check_address_validity', undefined, params);
  }

  // Transaction-related methods
  async listTransactions(params?: any): Promise<any> {
    return this.request('GET', '/transactions', undefined, params);
  }

  async getTransactionById(id: string): Promise<any> {
    return this.request('GET', `/transactions/${id}`);
  }

  async createTransferTransaction(data: any): Promise<any> {
    return this.request('POST', '/transactions/transfer', data);
  }

  async createContractCallTransaction(data: any): Promise<any> {
    return this.request('POST', '/transactions/contract_call', data);
  }

  async createMessageSignTransaction(data: any): Promise<any> {
    return this.request('POST', '/transactions/message_sign', data);
  }

  async listAddresses(walletId: string, tokenId: string): Promise<ApiResponse<Address[]>> {
    return this.request('GET', `/wallets/${walletId}/addresses`, undefined, { coin: tokenId });
  }

  async newAddress(walletId: string, tokenId: string): Promise<ApiResponse<Address>> {
    return this.request('POST', `/wallets/${walletId}/addresses`, { coin: tokenId });
  }
}

export const coboApi = new CoboApi();
export default coboApi;