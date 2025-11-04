// OpenLLM Generate API 路由（文本补全）
import type { APIRoute } from 'astro';
import { openllmClient } from '../../lib/openllm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prompt, model, max_tokens, temperature, top_p, stop } = body;

    // 验证请求
    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '必须提供 prompt 参数' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await openllmClient.generate({
      prompt,
      model,
      max_tokens,
      temperature,
      top_p,
      stop,
    });

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('OpenLLM Generate API 错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
