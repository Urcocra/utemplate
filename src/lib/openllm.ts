// OpenLLM 集成配置和客户端
import { OPENLLM_CONFIG, ERROR_MESSAGES } from './config';

// OpenLLM 请求类型
export interface OpenLLMRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
}

// OpenLLM 响应类型
export interface OpenLLMResponse {
  success: boolean;
  data?: string;
  error?: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// OpenLLM 模型信息类型
export interface OpenLLMModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * OpenLLM 客户端类
 * 用于与 OpenLLM 服务器进行交互
 */
export class OpenLLMClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || OPENLLM_CONFIG.BASE_URL;
    this.timeout = timeout || OPENLLM_CONFIG.REQUEST_TIMEOUT;
  }

  /**
   * 检查 OpenLLM 服务健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.error('OpenLLM 健康检查失败:', error);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<OpenLLMModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('获取 OpenLLM 模型列表失败:', error);
      return [];
    }
  }

  /**
   * 发送聊天完成请求
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    model?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      stream?: boolean;
    }
  ): Promise<OpenLLMResponse> {
    const requestModel = model || OPENLLM_CONFIG.DEFAULT_MODEL;

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: requestModel,
          messages: messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 1024,
          top_p: options?.top_p ?? 0.9,
          stream: options?.stream ?? false,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.choices?.[0]?.message?.content || '',
        model: requestModel,
        usage: data.usage,
      };
    } catch (error) {
      console.error('OpenLLM 聊天请求失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
        model: requestModel,
      };
    }
  }

  /**
   * 发送文本生成请求
   */
  async generate(request: OpenLLMRequest): Promise<OpenLLMResponse> {
    const {
      prompt,
      model = OPENLLM_CONFIG.DEFAULT_MODEL,
      max_tokens = 1024,
      temperature = 0.7,
      top_p = 0.9,
      stop = [],
    } = request;

    if (!prompt.trim()) {
      return {
        success: false,
        error: ERROR_MESSAGES.EMPTY_MESSAGE,
        model: model,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          max_tokens: max_tokens,
          temperature: temperature,
          top_p: top_p,
          stop: stop,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.choices?.[0]?.text || '',
        model: model,
        usage: data.usage,
      };
    } catch (error) {
      console.error('OpenLLM 生成请求失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
        model: model,
      };
    }
  }

  /**
   * 发送流式聊天请求
   */
  async chatStream(
    messages: Array<{ role: string; content: string }>,
    model?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
    }
  ): Promise<ReadableStream<Uint8Array> | null> {
    const requestModel = model || OPENLLM_CONFIG.DEFAULT_MODEL;

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: requestModel,
          messages: messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 1024,
          top_p: options?.top_p ?? 0.9,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('OpenLLM 流式聊天请求失败:', error);
      return null;
    }
  }
}

// 导出默认实例
export const openllmClient = new OpenLLMClient();

// 便捷函数：发送简单消息
export async function sendMessage(message: string, model?: string): Promise<OpenLLMResponse> {
  return openllmClient.chat([{ role: 'user', content: message }], model);
}

// 便捷函数：检查服务健康状态
export async function checkOpenLLMHealth(): Promise<boolean> {
  return openllmClient.checkHealth();
}

// 便捷函数：获取可用模型
export async function getAvailableModels(): Promise<OpenLLMModel[]> {
  return openllmClient.getModels();
}
