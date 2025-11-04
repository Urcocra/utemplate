import type { APIRoute } from 'astro';

// 模拟用户数据（实际项目中应该使用数据库）
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', created_at: new Date().toISOString() },
  { id: 2, name: '李四', email: 'lisi@example.com', created_at: new Date().toISOString() }
];

// GET /api/users - 获取所有用户
export const GET: APIRoute = async ({ url }) => {
  try {
    // 支持查询参数
    const limit = url.searchParams.get('limit');
    const page = url.searchParams.get('page');
    
    let result = users;
    
    // 简单的分页逻辑
    if (limit && page) {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum;
      result = users.slice(start, end);
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      total: users.length,
      message: '获取用户列表成功'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('获取用户列表错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: '获取用户列表失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/users - 创建新用户
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email } = body;

    // 验证必填字段
    if (!name || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必填字段',
        message: '姓名和邮箱都是必填的'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查邮箱是否已存在
    if (users.some(user => user.email === email)) {
      return new Response(JSON.stringify({
        success: false,
        error: '邮箱已存在',
        message: '该邮箱已被注册'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建新用户
    const newUser = {
      id: users.length + 1,
      name,
      email,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    return new Response(JSON.stringify({
      success: true,
      data: newUser,
      message: '用户创建成功'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('创建用户错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      message: '创建用户失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/users - 更新用户（批量更新或需要在具体用户ID端点实现）
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, email } = body;

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

    const userIndex = users.findIndex(user => user.id === id);
    
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

// DELETE /api/users - 删除用户
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

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

    const userIndex = users.findIndex(user => user.id === id);
    
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