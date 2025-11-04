// OpenLLM Chat API 路由
import type { APIRoute } from 'astro';
import { openllmClient } from '../../lib/openllm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, messages, model, stream = false, options } = body;

    // 验证请求
    if (!message && !messages) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '必须提供 message 或 messages 参数' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 如果是流式请求
    if (stream) {
      const chatMessages = messages || [{ role: 'user', content: message }];
      const streamBody = await openllmClient.chatStream(chatMessages, model, options);
      
      if (!streamBody) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '无法创建流式连接' 
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 返回流式响应
      return new Response(streamBody, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 普通聊天请求
    const chatMessages = messages || [{ role: 'user', content: message }];
    const response = await openllmClient.chat(chatMessages, model, options);

    return new Response(
      JSON.stringify(response),
      {
        status: response.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('OpenLLM Chat API 错误:', error);
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
