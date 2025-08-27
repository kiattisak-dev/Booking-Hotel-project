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

const registerSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('กรุณาใส่อีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const user = await authAPI.register(data);
      login(user);
      toast.success('สมัครสมาชิกสำเร็จ');
      router.push('/');
    } catch {
      toast.error('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* เต็มจอจริง ๆ */}
      <div className="relative isolate min-h-[100svh] grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: ฟอร์มสมัคร (อยู่ซ้าย) */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="order-1 h-full flex items-center justify-center px-4 sm:px-8"
        >
          <div className="w-full max-w-md">
            <Card className="shadow-soft">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{th.register}</CardTitle>
                <CardDescription>สร้างบัญชีใหม่เพื่อเริ่มจองห้องพัก</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">{th.name}</Label>
                    <Input id="name" placeholder="กรุณาใส่ชื่อ" {...register('name')} />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{th.email}</Label>
                    <Input id="email" type="email" placeholder="กรุณาใส่อีเมล" {...register('email')} />
                    {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{th.password}</Label>
                    <Input id="password" type="password" placeholder="กรุณาใส่รหัสผ่าน" {...register('password')} />
                    {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{th.confirmPassword}</Label>
                    <Input id="confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" {...register('confirmPassword')} />
                    {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'กำลังสมัครสมาชิก…' : th.register}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    มีบัญชีอยู่แล้ว?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                      {th.login}
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* RIGHT: ภาพ/สีพื้น + โปรโมต (อยู่ขวา, กึ่งกลางจริง ๆ) */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 relative hidden lg:flex h-full overflow-hidden"
        >
          {/* พื้นหลังไล่เฉด + วงกลมเบลอ */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

          {/* จัดกึ่งกลางทั้งแนวตั้ง/แนวนอน */}
          <div className="relative h-full w-full grid place-items-center">
            <div className="w-full max-w-xl px-12">
              <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
                สมัครง่ายเพียงไม่กี่ขั้นตอน
              </h1>
              <p className="mt-4 text-gray-600">
                เก็บประวัติการจอง ตรวจสอบสถานะ และรับข้อเสนอพิเศษสำหรับสมาชิกเท่านั้น
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl text-sm text-gray-700">
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ บันทึกข้อมูลผู้เข้าพัก</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ แจ้งเตือนการยืนยัน</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ แพ็กเกจแนะนำเฉพาะคุณ</div>
                <div className="rounded-lg border bg-white/60 backdrop-blur p-4 shadow-soft">✓ อัปโหลดสลิปทันใจ</div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
