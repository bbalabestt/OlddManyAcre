
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Truck, CheckCircle2 } from "lucide-react";
import type { ServiceType, StorageSubType, PaymentCycle } from "@/types";

type Step = 1 | 2 | 3;

interface OrderFormState {
  // Step 1 — Service type
  serviceType: ServiceType | null;
  storageSubType: StorageSubType | null;
  // Step 2 — Customer info
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientLineId: string;
  clientFacebook: string;
  serviceAddress: string;
  serviceFloor: string;
  hasElevator: boolean;
  // Step 3 — Service details
  itemsDescription: string;
  quantity: string;
  quantityUnit: string;
  serviceDate: string;
  storageDuration: string;
  paymentCycle: PaymentCycle;
  branchId: string;
  staffNotes: string;
}

const INITIAL: OrderFormState = {
  serviceType: null, storageSubType: null,
  clientName: "", clientPhone: "", clientEmail: "", clientLineId: "", clientFacebook: "",
  serviceAddress: "", serviceFloor: "", hasElevator: false,
  itemsDescription: "", quantity: "", quantityUnit: "กล่อง", serviceDate: "", storageDuration: "3 เดือน",
  paymentCycle: "Monthly", branchId: "", staffNotes: "",
};

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<OrderFormState>(INITIAL);

  const set = (key: keyof OrderFormState, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const steps = [
    { n: 1, label: "ประเภทบริการ", sublabel: "Service Type" },
    { n: 2, label: "ข้อมูลลูกค้า",  sublabel: "Customer Info" },
    { n: 3, label: "รายละเอียด",    sublabel: "Service Details" },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back */}
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ</Link>
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step > s.n ? "bg-green-600 text-white" : step === s.n ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className={`text-xs mt-1 font-medium ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              <span className="text-[10px] text-muted-foreground">{s.sublabel}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-24 mx-2 mt-[-18px] ${step > s.n ? "bg-green-600" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: Service Type ─────────────────────────────── */}
      {step === 1 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>เลือกประเภทบริการ</CardTitle>
            <CardDescription>Select the type of service you need</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storage */}
            <button
              type="button"
              onClick={() => set("serviceType", "Storage")}
              className={`text-left p-5 rounded-xl border-2 transition-all ${form.serviceType === "Storage" ? "border-green-600 bg-green-50" : "border-border hover:border-green-300"}`}
            >
              <Package className={`h-8 w-8 mb-3 ${form.serviceType === "Storage" ? "text-green-600" : "text-muted-foreground"}`} />
              <p className="font-bold text-lg">ฝากของ / Storage</p>
              <p className="text-sm text-muted-foreground mb-4">ฝากกล่องเอกสาร หรือเช่าพื้นที่จัดเก็บ</p>
              {form.serviceType === "Storage" && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {(["DocumentBox", "StorageSpace"] as StorageSubType[]).map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={e => { e.stopPropagation(); set("storageSubType", sub); }}
                      className={`p-3 rounded-lg border text-xs font-medium transition-all
                        ${form.storageSubType === sub ? "border-green-600 bg-green-600 text-white" : "border-border hover:border-green-400"}`}
                    >
                      {sub === "DocumentBox" ? "📁 กล่องเอกสาร" : "🏠 พื้นที่จัดเก็บ"}
                    </button>
                  ))}
                </div>
              )}
            </button>

            {/* Delivery */}
            <button
              type="button"
              onClick={() => set("serviceType", "Delivery")}
              className={`text-left p-5 rounded-xl border-2 transition-all ${form.serviceType === "Delivery" ? "border-purple-600 bg-purple-50" : "border-border hover:border-purple-300"}`}
            >
              <Truck className={`h-8 w-8 mb-3 ${form.serviceType === "Delivery" ? "text-purple-600" : "text-muted-foreground"}`} />
              <p className="font-bold text-lg">ขนส่ง / Delivery</p>
              <p className="text-sm text-muted-foreground">รับ-ส่งของถึงบ้าน พร้อมทีมงาน</p>
            </button>
          </CardContent>

          <div className="px-6 pb-6 flex justify-end">
            <Button
              disabled={!form.serviceType || (form.serviceType === "Storage" && !form.storageSubType)}
              onClick={() => setStep(2)}
            >
              ถัดไป: ข้อมูลลูกค้า →
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 2: Customer Info ───────────────────────────────── */}
      {step === 2 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
              <Badge variant="outline">
                {form.serviceType === "Storage" ? `📦 Storage · ${form.storageSubType === "DocumentBox" ? "กล่องเอกสาร" : "พื้นที่"}` : "🚚 Delivery"}
              </Badge>
            </div>
            <CardDescription>กรอกข้อมูลที่จำเป็นในการให้บริการ</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {/* ชื่อนามสกุล */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">* ชื่อ-นามสกุล (TH)</Label>
              <Input placeholder="สมชาย ใจดี" value={form.clientName} onChange={e => set("clientName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name (EN)</Label>
              <Input placeholder="Somchai Jaidee" />
            </div>

            {/* เบอร์ติดต่อ */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">* เบอร์ติดต่อ / Phone</Label>
              <Input placeholder="081-234-5678" value={form.clientPhone} onChange={e => set("clientPhone", e.target.value)} />
            </div>
            {/* อีเมล */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">อีเมล / Email</Label>
              <Input placeholder="email@example.com" type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} />
            </div>

            {/* Social */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">LINE ID</Label>
              <Input placeholder="@somchai" value={form.clientLineId} onChange={e => set("clientLineId", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Facebook</Label>
              <Input placeholder="facebook.com/..." value={form.clientFacebook} onChange={e => set("clientFacebook", e.target.value)} />
            </div>

            {/* ที่อยู่ */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">* ที่อยู่รับของ / Pickup Address</Label>
              <Textarea placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด" rows={2} value={form.serviceAddress} onChange={e => set("serviceAddress", e.target.value)} />
            </div>

            {/* ชั้น + มีลิฟต์ */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ชั้นที่ / Floor</Label>
              <Input placeholder="เช่น ชั้น 3" value={form.serviceFloor} onChange={e => set("serviceFloor", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">มีลิฟต์ไหม? / Has Elevator</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={form.hasElevator}
                  onCheckedChange={v => set("hasElevator", v)}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {form.hasElevator ? "✓ มีลิฟต์" : "ไม่มีลิฟต์"}
                </span>
              </div>
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>← ย้อนกลับ</Button>
            <Button
              disabled={!form.clientName || !form.clientPhone || !form.serviceAddress}
              onClick={() => setStep(3)}
            >
              ถัดไป: รายละเอียดบริการ →
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 3: Service Details ───────────────────────────── */}
      {step === 3 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>รายละเอียดบริการ</CardTitle>
            <CardDescription>ระบุรายการสิ่งของ ปริมาณ และระยะเวลา</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {/* ฝากอะไรบ้าง */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">* ฝากอะไรบ้าง / Items to Store</Label>
              <Textarea
                placeholder="เช่น กล่องเอกสาร 10 กล่อง, โซฟา, เตียง, อุปกรณ์สำนักงาน..."
                rows={3}
                value={form.itemsDescription}
                onChange={e => set("itemsDescription", e.target.value)}
              />
            </div>

            {/* ปริมาณ */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">* ปริมาณ / Quantity</Label>
              <Input placeholder="เช่น 10" type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">หน่วย / Unit</Label>
              <Select value={form.quantityUnit} onValueChange={v => set("quantityUnit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="กล่อง">กล่อง (Boxes)</SelectItem>
                  <SelectItem value="ตร.ม.">ตร.ม. (sqm)</SelectItem>
                  <SelectItem value="ชิ้น">ชิ้น (Items)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* วันเวลาที่ต้องการใช้ */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">* วันที่เริ่มบริการ</Label>
              <Input type="date" value={form.serviceDate} onChange={e => set("serviceDate", e.target.value)} />
            </div>

            {/* ฝากนานแค่ไหน */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ฝากนานแค่ไหน / Duration</Label>
              <Select value={form.storageDuration} onValueChange={v => set("storageDuration", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 เดือน">1 เดือน</SelectItem>
                  <SelectItem value="3 เดือน">3 เดือน</SelectItem>
                  <SelectItem value="6 เดือน">6 เดือน</SelectItem>
                  <SelectItem value="12 เดือน">12 เดือน (1 ปี)</SelectItem>
                  <SelectItem value="ไม่กำหนด">ไม่กำหนด (ต่อเนื่อง)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ชำระเงิน */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-semibold">* ชำระเงิน / Payment Cycle</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["Monthly", "Annual"] as PaymentCycle[]).map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => set("paymentCycle", cycle)}
                    className={`p-4 rounded-xl border-2 text-left transition-all
                      ${form.paymentCycle === cycle ? "border-green-600 bg-green-50" : "border-border hover:border-green-300"}`}
                  >
                    <p className="font-semibold">{cycle === "Monthly" ? "รายเดือน" : "รายปี"}</p>
                    <p className="text-xs text-muted-foreground">
                      {cycle === "Monthly" ? "จ่ายทุกเดือน — ยืดหยุ่น" : "จ่ายล่วงหน้า 12 เดือน — ประหยัด ~10%"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">สาขา / Branch</Label>
              <Select value={form.branchId} onValueChange={v => set("branchId", v)}>
                <SelectTrigger><SelectValue placeholder="เลือกสาขา" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch-bkk-sukhumvit">Widing Sukhumvit Micro-Hub</SelectItem>
                  <SelectItem value="branch-nb-pakkret">Nonthaburi Express Pods</SelectItem>
                  <SelectItem value="branch-cm-nimman">Chiang Mai Nimman Vault</SelectItem>
                  <SelectItem value="branch-bkk-sathorn">Sathorn City Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff notes */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">หมายเหตุสำหรับสตาฟ / Staff Notes</Label>
              <Textarea placeholder="หมายเหตุภายใน..." rows={2} value={form.staffNotes} onChange={e => set("staffNotes", e.target.value)} />
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>← ย้อนกลับ</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={!form.itemsDescription || !form.serviceDate || !form.branchId}
              onClick={() => { router.push("/orders"); }}
            >
              ✓ ยืนยันสร้างออเดอร์
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
