// OpenLLM Models API 路由
import type { APIRoute } from 'astro';
import { openllmClient } from '../../lib/openllm';

export const GET: APIRoute = async () => {
  try {
    const models = await openllmClient.getModels();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: models,
        count: models.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('OpenLLM Models API 错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '获取模型列表失败'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
