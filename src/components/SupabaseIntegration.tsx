import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import AuthComponent from './AuthComponent';
import ProfileManager from './ProfileManager';

export default function SupabaseIntegration() {
  const [user, setUser] = useState<User | null>(null);

  const handleAuthChange = (newUser: User | null) => {
    setUser(newUser);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 认证组件 */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">用户认证</h2>
        <AuthComponent onAuthChange={handleAuthChange} />
      </div>
      
      {/* 配置文件管理组件 */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">配置文件管理</h2>
        <ProfileManager user={user} />
      </div>
    </div>
  );
}