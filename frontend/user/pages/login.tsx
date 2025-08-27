import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/store/useAuth';
import { authAPI } from '@/lib/api';
import { th } from '@/lib/i18n';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('กรุณาใส่อีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, intendedPath } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await authAPI.login(data);
      login(user);
      toast.success('เข้าสู่ระบบสำเร็จ');
      
      // Redirect to intended path or home
      const redirectTo = intendedPath || '/';
      router.push(redirectTo);
    } catch (error) {
      toast.error('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{th.login}</CardTitle>
              <CardDescription>
                เข้าสู่ระบบเพื่อจองห้องพัก
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">{th.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="กรุณาใส่อีเมล"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">{th.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="กรุณาใส่รหัสผ่าน"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : th.login}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  ยังไม่มีบัญชี?{' '}
                  <Link href="/register" className="text-primary hover:underline">
                    {th.register}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}