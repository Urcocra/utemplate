import { createClient } from '@supabase/supabase-js';

// 这些是示例值，你需要替换为你的实际 Supabase 项目配置
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义（示例）
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

// 认证相关的辅助函数
export const auth = {
  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 登录
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // 注册
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  // 登出
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // OAuth 登录
  signInWithProvider: async (provider: 'google' | 'github' | 'discord') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  },
};

// 数据库操作辅助函数
export const database = {
  // 获取用户配置文件
  getProfile: async (userId: string) => {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  // 更新用户配置文件
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
  },

  // 创建用户配置文件
  createProfile: async (profile: Omit<Profile, 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('profiles')
      .insert([profile]);
  },
};