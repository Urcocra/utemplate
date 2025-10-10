// Ollama 配置文件
export const OLLAMA_CONFIG = {
  // Ollama 服务器地址
  HOST: 'http://localhost:11434',
  
  // 默认模型
  DEFAULT_MODEL: 'llama2',
  
  // 支持的模型列表（如果 Ollama 服务不可用时的备选）
  FALLBACK_MODELS: [
    'llama2',
    'llama2:13b',
    'codellama',
    'mistral',
    'neural-chat',
    'starling-lm'
  ],
  
  // API 端点
  ENDPOINTS: {
    HEALTH: '/api/version',
    MODELS: '/api/tags',
    CHAT: '/api/chat',
    GENERATE: '/api/generate'
  },
  
  // 请求配置
  REQUEST_TIMEOUT: 30000, // 30秒超时
  
  // 流式响应配置
  STREAM_CONFIG: {
    enabled: true,
    chunkSize: 1024
  }
};

// 错误消息配置
export const ERROR_MESSAGES = {
  SERVICE_UNAVAILABLE: 'Ollama 服务不可用，请确保 Ollama 正在运行',
  MODEL_NOT_FOUND: '指定的模型未找到',
  TIMEOUT: '请求超时，请稍后重试',
  NETWORK_ERROR: '网络连接错误',
  INVALID_REQUEST: '请求格式无效',
  EMPTY_MESSAGE: '消息内容不能为空'
};