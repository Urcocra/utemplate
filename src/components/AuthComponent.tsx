import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, auth } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthComponentProps {
  onAuthChange?: (user: User | null) => void;
}

export default function AuthComponent({ onAuthChange }: AuthComponentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 获取当前用户
    const getCurrentUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      onAuthChange?.(currentUser);
    };

    getCurrentUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      onAuthChange?.(currentUser);
      
      if (event === 'SIGNED_IN') {
        setMessage('登录成功！');
      } else if (event === 'SIGNED_OUT') {
        setMessage('已登出');
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthChange]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await auth.signUp(email, password);
        if (error) throw error;
        setMessage('注册成功！请检查您的邮箱以验证账户。');
      } else {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
        setMessage('登录成功！');
      }
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage(error.message || '操作失败');
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || '登出失败');
    }
    setAuthLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'discord') => {
    setAuthLoading(true);
    try {
      const { error } = await auth.signInWithProvider(provider);
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || '登录失败');
    }
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>欢迎回来！</CardTitle>
          <CardDescription>
            已登录为: {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>用户 ID:</strong> {user.id}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>邮箱:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>邮箱验证:</strong> {user.email_confirmed_at ? '已验证' : '未验证'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>注册时间:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : '未知'}
            </p>
          </div>
          
          {message && (
            <div className={cn(
              "p-2 rounded text-sm",
              message.includes('成功') || message.includes('已登出') 
                ? "bg-green-100 text-green-700 border border-green-300" 
                : "bg-red-100 text-red-700 border border-red-300"
            )}>
              {message}
            </div>
          )}
          
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            disabled={authLoading}
            className="w-full"
          >
            {authLoading ? '登出中...' : '登出'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? '注册' : '登录'}</CardTitle>
        <CardDescription>
          {isSignUp ? '创建新账户' : '登录到您的账户'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={authLoading}
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={authLoading}
              minLength={6}
            />
          </div>
          
          {message && (
            <div className={cn(
              "p-2 rounded text-sm",
              message.includes('成功') 
                ? "bg-green-100 text-green-700 border border-green-300" 
                : "bg-red-100 text-red-700 border border-red-300"
            )}>
              {message}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={authLoading || !email || !password} 
            className="w-full"
          >
            {authLoading ? (isSignUp ? '注册中...' : '登录中...') : (isSignUp ? '注册' : '登录')}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>
          
          {/* OAuth 按钮（演示用） */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={authLoading}
              className="w-full"
            >
              使用 Google 登录
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={authLoading}
              className="w-full"
            >
              使用 GitHub 登录
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            disabled={authLoading}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? '已有账户？点击登录' : '没有账户？点击注册'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}