import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title?: string;
}

export default function ExampleComponent({ title = "Hello ShadcnUI!" }: ExampleComponentProps) {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState('');
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={cn("space-y-6", isDark && "dark")}>
      {/* 主卡片 */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>
            这是一个展示 ShadcnUI 组件的示例
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 计数器部分 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">计数器</h3>
            <p className="text-sm text-muted-foreground">当前计数: {count}</p>
            <div className="flex gap-2">
              <Button onClick={() => setCount(count + 1)} variant="default" size="sm">
                +1
              </Button>
              <Button onClick={() => setCount(count - 1)} variant="outline" size="sm">
                -1
              </Button>
              <Button onClick={() => setCount(0)} variant="destructive" size="sm">
                重置
              </Button>
            </div>
          </div>

          {/* 输入框部分 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">文本输入</h3>
            <Input
              type="text"
              placeholder="输入你的名字..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
            {name && (
              <p className="text-sm text-muted-foreground">
                你好, <span className="font-semibold">{name}</span>!
              </p>
            )}
          </div>

          {/* 主题切换 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">主题</h3>
            <Button
              onClick={() => setIsDark(!isDark)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              切换到 {isDark ? '浅色' : '深色'} 主题
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            使用 React + ShadcnUI 构建
          </p>
        </CardFooter>
      </Card>

      {/* 状态展示卡片 */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">组件状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>计数值:</span>
              <span className="font-mono">{count}</span>
            </div>
            <div className="flex justify-between">
              <span>输入文本:</span>
              <span className="font-mono">{name || '(空)'}</span>
            </div>
            <div className="flex justify-between">
              <span>当前主题:</span>
              <span className="font-mono">{isDark ? 'dark' : 'light'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}