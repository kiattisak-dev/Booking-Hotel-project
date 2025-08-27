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
      router.push(intendedPath || '/');
    } catch {
      toast.error('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative isolate min-h-[100svh] grid grid-cols-1 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 lg:order-1 relative hidden lg:flex h-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative h-full w-full grid place-items-center">
            <div className="w-full max-w-xl px-12">
              <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
                จองโรงแรมได้ง่าย <br /> สะดวกและปลอดภัย
              </h1>
              <p className="mt-4 text-gray-600">
                ค้นหาห้องว่าง ดูราคาแบบเรียลไทม์ และชำระเงินด้วยการอัปโหลดสลิป
                ทุกขั้นตอนถูกออกแบบมาเพื่อความง่ายและรวดเร็ว
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl text-sm text-gray-700">
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ แพ็กเกจหลากหลาย</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ ประวัติการจองในบัญชีเดียว</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ อัปโหลดสลิปได้ทันที</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ ทีมซัพพอร์ตยินดีช่วยเหลือ</div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="order-1 lg:order-2 h-full flex items-center justify-center px-4 sm:px-8"
        >
          <div className="w-full max-w-md">
            <Card className="shadow-soft">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{th.login}</CardTitle>
                <CardDescription>เข้าสู่ระบบเพื่อจองห้องพัก</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">{th.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="กรุณาใส่อีเมล"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{th.password}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="กรุณาใส่รหัสผ่าน"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm">{errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'กำลังเข้าสู่ระบบ…' : th.login}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    ยังไม่มีบัญชี?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                      {th.register}
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
