// API 响应标准化工具
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  timestamp?: string;
}

// 创建成功响应
export function createSuccessResponse<T>(
  data: T, 
  message: string = '操作成功',
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 创建错误响应
export function createErrorResponse(
  error: string,
  message: string = '操作失败',
  status: number = 400
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 参数验证工具
export function validateRequired(data: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `缺少必填字段: ${field}`;
    }
  }
  return null;
}

// 邮箱验证
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 处理 CORS 预检请求
export function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 身份验证中间件（示例）
export function verifyToken(request: Request): { valid: boolean; userId?: number; error?: string } {
  const authorization = request.headers.get('Authorization');
  
  if (!authorization) {
    return { valid: false, error: '缺少认证令牌' };
  }

  const token = authorization.replace('Bearer ', '');
  
  // 这里应该验证 JWT token 或其他认证方式
  // 示例：简单的 token 验证
  if (token === 'valid-token-123') {
    return { valid: true, userId: 1 };
  }

  return { valid: false, error: '无效的认证令牌' };
}

// 分页工具
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// 创建分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}