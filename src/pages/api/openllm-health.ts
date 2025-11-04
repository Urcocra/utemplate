// OpenLLM Health Check API 路由
import type { APIRoute } from 'astro';
import { openllmClient } from '../../lib/openllm';

export const GET: APIRoute = async () => {
  try {
    const isHealthy = await openllmClient.checkHealth();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        healthy: isHealthy,
        service: 'OpenLLM',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('OpenLLM Health Check 错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        healthy: false,
        error: error instanceof Error ? error.message : '健康检查失败'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
