import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import UploadSlip from "@/components/Booking/UploadSlip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, MapPin, QrCode, Copy } from "lucide-react";
import { roomAPI, bookingAPI, paymentAPI, apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { th } from "@/lib/i18n";
import { toast } from "sonner";

const checkoutSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณาใส่อีเมลที่ถูกต้อง"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    const stored = localStorage.getItem("pendingBooking");
    const pkg = localStorage.getItem("selectedPackageId");
    if (stored) {
      setBookingData(JSON.parse(stored));
    } else {
      router.push("/rooms");
    }
    if (pkg) setSelectedPackageId(pkg);
  }, []);

  const { data: room } = useQuery({
    queryKey: ["room", bookingData?.roomId],
    queryFn: () => roomAPI.getById(bookingData.roomId),
    enabled: !!bookingData?.roomId,
  });

  const nightlyPrice = useMemo(
    () => Number((room as any)?.pricePerNight ?? (room as any)?.price ?? 0),
    [room]
  );

  const calculateNights = () => {
    if (!bookingData) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const total = useMemo(() => {
    return Number(nightlyPrice) * Number(calculateNights() || 0);
  }, [nightlyPrice, bookingData]);

  useEffect(() => {
    const calc = async () => {
      if (!bookingData || !bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut) {
        setFinalAmount(total);
        setDiscount(0);
        return;
      }
      if (!selectedPackageId) {
        setFinalAmount(total);
        setDiscount(0);
        return;
      }
      try {
        const res = await apiFetch<{ total: number; discount: number; finalTotal: number }>(
          "/api/packages/apply",
          {
            method: "POST",
            body: JSON.stringify({
              packageId: selectedPackageId,
              roomTypeId: bookingData.roomId,
              checkIn: bookingData.checkIn,
              checkOut: bookingData.checkOut,
            }),
          }
        );
        setDiscount(Number(res.discount || 0));
        setFinalAmount(Number(res.finalTotal || total));
      } catch {
        setDiscount(0);
        setFinalAmount(total);
      }
    };
    calc();
  }, [selectedPackageId, bookingData?.roomId, bookingData?.checkIn, bookingData?.checkOut, total]);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrPayload, setQrPayload] = useState<string>("");
  const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID || "";

  useEffect(() => {
    const fetchQR = async () => {
      if (step !== 2 || !PROMPTPAY_ID || !finalAmount) return;
      try {
        const res = await paymentAPI.getQR(PROMPTPAY_ID, finalAmount);
        setQrPayload(res.payload || "");
        setQrDataUrl(res.qrcodeDataUrl || "");
      } catch (e: any) {
        toast.error(e?.message || "สร้าง QR ไม่สำเร็จ");
      }
    };
    fetchQR();
  }, [step, PROMPTPAY_ID, finalAmount]);

  const goNextToQR = async () => {
    const ok = await trigger();
    if (!ok) return;
    if (!PROMPTPAY_ID) {
      toast.error("ยังไม่ได้ตั้งค่าเลขพร้อมเพย์ (NEXT_PUBLIC_PROMPTPAY_ID)");
      return;
    }
    if (!finalAmount) {
      toast.error("ไม่สามารถคำนวณยอดชำระได้");
      return;
    }
    setStep(2);
  };

  const onConfirmBooking = async () => {
    if (!paymentSlip) {
      toast.error("กรุณาอัปโหลดสลิปการโอนเงิน");
      return;
    }
    if (!bookingData || !room) return;

    setIsSubmitting(true);
    try {
      const contactDetails = getValues();
      const booking = await bookingAPI.create({
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        contactDetails,
      });

      const bookingId = (booking as any).id ?? (booking as any)._id;

      await paymentAPI.uploadSlip(paymentSlip, bookingId, finalAmount);

      localStorage.removeItem("pendingBooking");
      localStorage.removeItem("selectedPackageId");

      router.push(`/booking/success?bookingId=${bookingId}`);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData || !room) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลการจอง</h1>
            <Button onClick={() => router.push("/rooms")}>
              กลับไปเลือกห้องพัก
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-center mb-2">
              ยืนยันการจอง
            </h1>
            <p className="text-center text-gray-500 mb-8">ขั้นตอน {step} / 2</p>

            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>สรุปการจอง</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                          <h3 className="font-semibold">
                            {(room as any)?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {(room as any)?.description}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">วันที่เข้าพัก - ออก</p>
                          <p className="text-sm text-gray-600">
                            {new Date(bookingData.checkIn).toLocaleDateString(
                              "th-TH"
                            )}{" "}
                            -{" "}
                            {new Date(bookingData.checkOut).toLocaleDateString(
                              "th-TH"
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {calculateNights()} {th.nights}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">จำนวนแขก</p>
                          <p className="text-sm text-gray-600">
                            {bookingData.guests} แขก
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>
                            ฿{nightlyPrice.toLocaleString()} ×{" "}
                            {calculateNights()} คืน
                          </span>
                          <span>฿{total.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>ส่วนลดแพ็กเกจ</span>
                            <span>-฿{discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg">
                          <span>ยอดรวมชำระ</span>
                          <span>฿{finalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {step === 2 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        ชำระเงินผ่าน PromptPay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {qrDataUrl ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={qrDataUrl}
                              alt="PromptPay QR"
                              className="w-56 h-56 rounded border"
                            />
                            <div className="mt-3 text-sm text-gray-600">
                              พร้อมเพย์: {PROMPTPAY_ID} | จำนวนเงิน: ฿
                              {finalAmount.toLocaleString()}
                            </div>
                            {qrPayload && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigator.clipboard
                                    .writeText(qrPayload)
                                    .then(() =>
                                      toast.success("คัดลอก Payload แล้ว")
                                    )
                                }
                                className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:underline"
                              >
                                <Copy className="h-4 w-4" />
                                คัดลอก Payload
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            กำลังเตรียม QR...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                {step === 1 ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      goNextToQR();
                    }}
                  >
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>{th.contactDetails}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="name">{th.name}</Label>
                          <Input
                            id="name"
                            {...register("name")}
                            placeholder="กรุณาใส่ชื่อ"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">{th.email}</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="กรุณาใส่อีเมล"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">{th.phone}</Label>
                          <Input
                            id="phone"
                            {...register("phone")}
                            placeholder="กรุณาใส่เบอร์โทรศัพท์"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="notes">{th.notes}</Label>
                          <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/rooms")}
                      >
                        เลือกห้องใหม่
                      </Button>
                      <Button type="submit" className="flex-1">
                        ถัดไป: แสดง QR และอัปโหลดสลิป
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onConfirmBooking();
                    }}
                  >
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>{th.paymentSlip}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UploadSlip
                          onFileSelect={setPaymentSlip}
                          currentFile={paymentSlip}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          แนบสลิปหลังโอนเงินตาม QR ข้างต้น
                        </p>
                      </CardContent>
                    </Card>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        แก้ไขข้อมูลติดต่อ
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "กำลังจอง..." : th.confirmBooking}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
