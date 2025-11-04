import type { APIRoute } from 'astro';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequired, 
  validateEmail,
  handleCORS,
  parsePagination,
  createPaginatedResponse
} from '../../lib/api-utils';

// 模拟产品数据
let products = [
  { id: 1, name: 'iPhone 15', price: 999, category: '手机', stock: 10, created_at: new Date().toISOString() },
  { id: 2, name: 'MacBook Pro', price: 1999, category: '笔记本', stock: 5, created_at: new Date().toISOString() },
  { id: 3, name: 'AirPods Pro', price: 249, category: '耳机', stock: 20, created_at: new Date().toISOString() },
  { id: 4, name: 'iPad Air', price: 599, category: '平板', stock: 8, created_at: new Date().toISOString() },
  { id: 5, name: 'Apple Watch', price: 399, category: '手表', stock: 15, created_at: new Date().toISOString() }
];

// 处理 CORS 预检请求
export const OPTIONS: APIRoute = () => handleCORS();

// GET /api/products - 获取产品列表（支持分页和筛选）
export const GET: APIRoute = async ({ url }) => {
  try {
    // 解析分页参数
    const { page, limit, offset } = parsePagination(url);
    
    // 解析筛选参数
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');

    // 应用筛选条件
    let filteredProducts = products;

    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredProducts = filteredProducts.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(p => p.price <= max);
    }

    // 应用分页
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    // 创建分页响应
    const responseData = createPaginatedResponse(
      paginatedProducts,
      total,
      page,
      limit
    );

    return createSuccessResponse(responseData, '获取产品列表成功');

  } catch (error) {
    console.error('获取产品列表错误:', error);
    return createErrorResponse('服务器内部错误', '获取产品列表失败', 500);
  }
};

// POST /api/products - 创建新产品
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, price, category, stock } = body;

    // 验证必填字段
    const validationError = validateRequired(body, ['name', 'price', 'category']);
    if (validationError) {
      return createErrorResponse(validationError, '参数验证失败', 400);
    }

    // 验证价格
    if (typeof price !== 'number' || price <= 0) {
      return createErrorResponse('价格必须是大于0的数字', '参数验证失败', 400);
    }

    // 验证库存
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return createErrorResponse('库存必须是非负数', '参数验证失败', 400);
    }

    // 检查产品名称是否已存在
    if (products.some(product => product.name.toLowerCase() === name.toLowerCase())) {
      return createErrorResponse('产品名称已存在', '创建产品失败', 409);
    }

    // 创建新产品
    const newProduct = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name,
      price,
      category,
      stock: stock || 0,
      created_at: new Date().toISOString()
    };

    products.push(newProduct);

    return createSuccessResponse(newProduct, '产品创建成功', 201);

  } catch (error) {
    console.error('创建产品错误:', error);
    return createErrorResponse('服务器内部错误', '创建产品失败', 500);
  }
};

// PUT /api/products - 批量更新产品
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { updates } = body; // 期望是一个包含更新信息的数组

    if (!Array.isArray(updates)) {
      return createErrorResponse('updates 必须是数组', '参数验证失败', 400);
    }

    const updatedProducts = [];
    const errors = [];

    for (const update of updates) {
      const { id, ...updateData } = update;
      
      if (!id) {
        errors.push('缺少产品ID');
        continue;
      }

      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        errors.push(`产品ID ${id} 不存在`);
        continue;
      }

      // 更新产品信息
      Object.assign(products[productIndex], updateData);
      updatedProducts.push(products[productIndex]);
    }

    if (errors.length > 0 && updatedProducts.length === 0) {
      return createErrorResponse(errors.join(', '), '批量更新失败', 400);
    }

    return createSuccessResponse({
      updated: updatedProducts,
      errors: errors
    }, `成功更新 ${updatedProducts.length} 个产品`);

  } catch (error) {
    console.error('批量更新产品错误:', error);
    return createErrorResponse('服务器内部错误', '批量更新产品失败', 500);
  }
};

// DELETE /api/products - 批量删除产品
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { ids } = body; // 期望是一个包含要删除的ID的数组

    if (!Array.isArray(ids)) {
      return createErrorResponse('ids 必须是数组', '参数验证失败', 400);
    }

    const deletedProducts = [];
    const errors = [];

    for (const id of ids) {
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        errors.push(`产品ID ${id} 不存在`);
        continue;
      }

      const deletedProduct = products.splice(productIndex, 1)[0];
      deletedProducts.push(deletedProduct);
    }

    if (errors.length > 0 && deletedProducts.length === 0) {
      return createErrorResponse(errors.join(', '), '批量删除失败', 400);
    }

    return createSuccessResponse({
      deleted: deletedProducts,
      errors: errors
    }, `成功删除 ${deletedProducts.length} 个产品`);

  } catch (error) {
    console.error('批量删除产品错误:', error);
    return createErrorResponse('服务器内部错误', '批量删除产品失败', 500);
  }
};