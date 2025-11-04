import type { APIRoute } from 'astro';

// 模拟用户数据（实际项目中应该使用数据库）
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', created_at: new Date().toISOString() },
  { id: 2, name: '李四', email: 'lisi@example.com', created_at: new Date().toISOString() }
];

// GET /api/users/[id] - 根据ID获取特定用户
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少用户ID',
        message: '用户ID是必填的'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = parseInt(id as string);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在',
        message: '找不到指定的用户'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: user,
      message: '获取用户信息成功'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: '获取用户信息失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/users/[id] - 更新特定用户
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email } = body;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少用户ID',
        message: '用户ID是必填的'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = parseInt(id as string);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在',
        message: '找不到指定的用户'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 更新用户信息
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;

    return new Response(JSON.stringify({
      success: true,
      data: users[userIndex],
      message: '用户更新成功'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('更新用户错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: '更新用户失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/users/[id] - 删除特定用户
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少用户ID',
        message: '用户ID是必填的'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = parseInt(id as string);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在',
        message: '找不到指定的用户'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    return new Response(JSON.stringify({
      success: true,
      data: deletedUser,
      message: '用户删除成功'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('删除用户错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: '删除用户失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};