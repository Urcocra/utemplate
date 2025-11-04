import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { database, type Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProfileManagerProps {
  user: User | null;
}

export default function ProfileManager({ user }: ProfileManagerProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await database.getProfile(user.id);
      if (error && error.code !== 'PGRST116') { // 忽略 "not found" 错误
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
        });
      }
    } catch (error: any) {
      setMessage(`加载配置文件失败: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');
    
    try {
      const profileData = {
        user_id: user.id,
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
      };

      if (profile) {
        // 更新现有配置文件
        const { error } = await database.updateProfile(user.id, profileData);
        if (error) throw error;
        setMessage('配置文件更新成功！');
      } else {
        // 创建新配置文件
        const { error } = await database.createProfile({
          id: crypto.randomUUID(), // 生成随机 ID
          ...profileData,
        });
        if (error) throw error;
        setMessage('配置文件创建成功！');
      }
      
      // 重新加载配置文件
      await loadProfile();
    } catch (error: any) {
      setMessage(`保存失败: ${error.message}`);
    }
    setSaving(false);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            请先登录以管理您的配置文件
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>用户配置文件</CardTitle>
        <CardDescription>
          管理您的个人信息和偏好设置
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">加载配置文件...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                用户名
              </label>
              <Input
                id="username"
                type="text"
                placeholder="输入用户名"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={saving}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                全名
              </label>
              <Input
                id="full_name"
                type="text"
                placeholder="输入全名"
                value={formData.full_name}
                onChange={handleInputChange('full_name')}
                disabled={saving}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                个人简介
              </label>
              <textarea
                id="bio"
                placeholder="介绍一下自己..."
                value={formData.bio}
                onChange={handleInputChange('bio')}
                disabled={saving}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex-1"
              >
                {saving ? '保存中...' : (profile ? '更新配置' : '创建配置')}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={loadProfile}
                disabled={saving}
              >
                刷新
              </Button>
            </div>
          </form>
        )}
        
        {profile && (
          <div className="mt-6 pt-4 border-t space-y-2">
            <h4 className="font-medium">当前配置文件信息</h4>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {profile.id}</p>
              <p><strong>用户名:</strong> {profile.username || '未设置'}</p>
              <p><strong>全名:</strong> {profile.full_name || '未设置'}</p>
              <p><strong>简介:</strong> {profile.bio || '未设置'}</p>
              {profile.created_at && (
                <p><strong>创建时间:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              )}
              {profile.updated_at && (
                <p><strong>更新时间:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}