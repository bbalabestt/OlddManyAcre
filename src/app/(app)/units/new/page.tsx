"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Maximize2, CheckCircle2 } from "lucide-react";
import type { UnitType } from "@/types";

const BRANCHES = [
  { id: "branch-bkk-sukhumvit", name: "Widing Sukhumvit Micro-Hub" },
  { id: "branch-nb-pakkret",    name: "Nonthaburi Express Pods" },
  { id: "branch-cnx-nimman",    name: "Chiang Mai Nimman Lockers" },
  { id: "branch-bkk-sathorn",   name: "Widing Sathorn Compact" },
];

interface UnitFormState {
  unitType: UnitType | null;
  branchId: string;
  unitIdentifier: string;
  zone: string;
  floor: string;
  // StorageSpace
  widthM: string;
  lengthM: string;
  // DocumentBox
  boxCapacity: string;
  monthlyRate: string;
  status: string;
  notes: string;
  // Optional floor plan coords
  floorPlanX: string;
  floorPlanY: string;
  floorPlanW: string;
  floorPlanH: string;
}

const INITIAL: UnitFormState = {
  unitType: null,
  branchId: "branch-bkk-sukhumvit",
  unitIdentifier: "",
  zone: "",
  floor: "1",
  widthM: "",
  lengthM: "",
  boxCapacity: "1",
  monthlyRate: "",
  status: "Available",
  notes: "",
  floorPlanX: "",
  floorPlanY: "",
  floorPlanW: "",
  floorPlanH: "",
};

export default function NewUnitPage() {
  const router = useRouter();
  const [form, setForm] = useState<UnitFormState>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof UnitFormState, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const totalSqm =
    form.widthM && form.lengthM
      ? (parseFloat(form.widthM) * parseFloat(form.lengthM)).toFixed(1)
      : null;

  // Auto-suggest monthlyRate based on sqm
  const suggestRate = () => {
    if (!totalSqm) return "";
    const sqm = parseFloat(totalSqm);
    if (sqm <= 1)  return "800";
    if (sqm <= 4)  return "3200";
    if (sqm <= 9)  return "7200";
    if (sqm <= 16) return "12800";
    return "12800";
  };

  const canSubmit =
    form.unitType &&
    form.branchId &&
    form.unitIdentifier.trim() &&
    form.zone.trim() &&
    form.floor &&
    form.monthlyRate &&
    (form.unitType === "DocumentBox" || (form.widthM && form.lengthM));

  async function handleSubmit() {
    if (!canSubmit || !form.unitType) return;
    setSaving(true);

    const branch = BRANCHES.find(b => b.id === form.branchId);
    const payload = {
      branchId:       form.branchId,
      branchName:     branch?.name ?? "",
      unitIdentifier: form.unitIdentifier.trim().toUpperCase(),
      unitType:       form.unitType,
      floor:          parseInt(form.floor) || 1,
      zone:           form.zone.trim().toUpperCase(),
      status:         form.status as "Available" | "Occupied" | "Reserved" | "Maintenance",
      monthlyRate:    parseFloat(form.monthlyRate) || 0,
      notes:          form.notes || undefined,
      ...(form.unitType === "StorageSpace" ? {
        widthM:    parseFloat(form.widthM)  || undefined,
        lengthM:   parseFloat(form.lengthM) || undefined,
        totalSqm:  totalSqm ? parseFloat(totalSqm) : undefined,
      } : {
        boxCapacity: parseInt(form.boxCapacity) || 1,
      }),
      ...(form.floorPlanX ? {
        floorPlanX: parseInt(form.floorPlanX),
        floorPlanY: parseInt(form.floorPlanY) || 0,
        floorPlanW: parseInt(form.floorPlanW) || 1,
        floorPlanH: parseInt(form.floorPlanH) || 1,
      } : {}),
    };

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/units"), 1200);
      }
    } catch {
      // fallback: navigate anyway (mock)
      setSaved(true);
      setTimeout(() => router.push("/units"), 1200);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="text-2xl font-bold">บันทึกยูนิตสำเร็จ!</h2>
        <p className="text-muted-foreground">Unit <span className="font-mono font-semibold">{form.unitIdentifier.toUpperCase()}</span> ถูกเพิ่มแล้ว</p>
        <p className="text-sm text-muted-foreground">กำลังนำกลับสู่รายการยูนิต…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/units"><ArrowLeft className="mr-2 h-4 w-4" /> กลับ</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">เพิ่มยูนิตใหม่</h1>
          <p className="text-sm text-muted-foreground">Add New Unit</p>
        </div>
      </div>

      {/* ── Step 1: Unit Type ── */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">1  ประเภทยูนิต / Unit Type</CardTitle>
          <CardDescription>เลือกประเภทยูนิตที่ต้องการเพิ่ม</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {/* Document Box */}
          <button
            type="button"
            onClick={() => {
              set("unitType", "DocumentBox");
              if (!form.monthlyRate) set("monthlyRate", "150");
            }}
            className={`text-left p-5 rounded-xl border-2 transition-all ${
              form.unitType === "DocumentBox"
                ? "border-cyan-600 bg-cyan-50"
                : "border-border hover:border-cyan-300"
            }`}
          >
            <Package className={`h-8 w-8 mb-3 ${form.unitType === "DocumentBox" ? "text-cyan-600" : "text-muted-foreground"}`} />
            <p className="font-bold">📁 กล่องเอกสาร</p>
            <p className="text-xs text-muted-foreground mt-1">Document Box · ฝากกล่องรายกล่อง</p>
            <p className="text-xs font-semibold text-cyan-700 mt-2">฿150/กล่อง/เดือน</p>
          </button>

          {/* Storage Space */}
          <button
            type="button"
            onClick={() => set("unitType", "StorageSpace")}
            className={`text-left p-5 rounded-xl border-2 transition-all ${
              form.unitType === "StorageSpace"
                ? "border-blue-600 bg-blue-50"
                : "border-border hover:border-blue-300"
            }`}
          >
            <Maximize2 className={`h-8 w-8 mb-3 ${form.unitType === "StorageSpace" ? "text-blue-600" : "text-muted-foreground"}`} />
            <p className="font-bold">🏠 พื้นที่จัดเก็บ</p>
            <p className="text-xs text-muted-foreground mt-1">Storage Space · เช่าพื้นที่ รายตร.ม.</p>
            <p className="text-xs font-semibold text-blue-700 mt-2">฿800–฿12,800/เดือน</p>
          </button>
        </CardContent>
      </Card>

      {/* ── Step 2: Location & Identity ── */}
      <Card className={`shadow-sm transition-opacity ${!form.unitType ? "opacity-40 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base">2  ตำแหน่งและรหัสยูนิต / Location & Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">* สาขา / Branch</Label>
            <Select value={form.branchId} onValueChange={v => set("branchId", v)}>
              <SelectTrigger><SelectValue placeholder="เลือกสาขา" /></SelectTrigger>
              <SelectContent>
                {BRANCHES.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">* รหัสยูนิต / Unit Identifier</Label>
            <Input
              placeholder={form.unitType === "DocumentBox" ? "เช่น BOX-A-007" : "เช่น SPC-B-004"}
              value={form.unitIdentifier}
              onChange={e => set("unitIdentifier", e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              {form.unitType === "DocumentBox" ? "รูปแบบ: BOX-[Zone]-[เลข]" : "รูปแบบ: SPC-[Zone]-[เลข]"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">* Zone</Label>
            <Input
              placeholder="เช่น A, B, C, D"
              maxLength={2}
              value={form.zone}
              onChange={e => set("zone", e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">* ชั้น / Floor</Label>
            <Input
              type="number"
              min="1"
              placeholder="1"
              value={form.floor}
              onChange={e => set("floor", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">สถานะเริ่มต้น</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">ว่าง (Available)</SelectItem>
                <SelectItem value="Reserved">สำรอง (Reserved)</SelectItem>
                <SelectItem value="Maintenance">ซ่อมบำรุง (Maintenance)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Step 3: Dimensions & Pricing ── */}
      <Card className={`shadow-sm transition-opacity ${!form.unitType ? "opacity-40 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base">3  ขนาดและราคา / Dimensions & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {form.unitType === "StorageSpace" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">* ความกว้าง (เมตร)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 2.0"
                  value={form.widthM}
                  onChange={e => {
                    set("widthM", e.target.value);
                    if (!form.monthlyRate && form.lengthM) {
                      const sqm = parseFloat(e.target.value) * parseFloat(form.lengthM);
                      if (sqm <= 4) set("monthlyRate", "3200");
                      else if (sqm <= 9) set("monthlyRate", "7200");
                      else set("monthlyRate", "12800");
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">* ความยาว (เมตร)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="เช่น 3.0"
                  value={form.lengthM}
                  onChange={e => {
                    set("lengthM", e.target.value);
                    if (!form.monthlyRate && form.widthM) {
                      const sqm = parseFloat(form.widthM) * parseFloat(e.target.value);
                      if (sqm <= 4) set("monthlyRate", "3200");
                      else if (sqm <= 9) set("monthlyRate", "7200");
                      else set("monthlyRate", "12800");
                    }
                  }}
                />
              </div>
              {totalSqm && (
                <div className="col-span-2">
                  <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                    พื้นที่รวม: <span className="font-bold text-blue-700">{totalSqm} m²</span>
                    {!form.monthlyRate && (
                      <button
                        type="button"
                        className="ml-4 text-xs text-primary underline"
                        onClick={() => set("monthlyRate", suggestRate())}
                      >
                        ใช้ราคาแนะนำ ฿{suggestRate()}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {form.unitType === "DocumentBox" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">จำนวนกล่องสูงสุด / Box Capacity</Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={form.boxCapacity}
                onChange={e => set("boxCapacity", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">* ราคา/เดือน (฿)</Label>
            <Input
              type="number"
              placeholder={form.unitType === "DocumentBox" ? "150" : "เช่น 3200"}
              value={form.monthlyRate}
              onChange={e => set("monthlyRate", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Step 4: Floor Plan Position (optional) ── */}
      <Card className={`shadow-sm transition-opacity ${!form.unitType ? "opacity-40 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base">4  ตำแหน่งบนแผนผัง <span className="text-muted-foreground font-normal">(Optional)</span></CardTitle>
          <CardDescription>ระบุพิกัด X/Y/W/H เพื่อแสดงบน Floor Plan 2D</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-3">
          {[
            { key: "floorPlanX", label: "X" },
            { key: "floorPlanY", label: "Y" },
            { key: "floorPlanW", label: "W (กว้าง)" },
            { key: "floorPlanH", label: "H (สูง)" },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs font-semibold">{f.label}</Label>
              <Input
                type="number"
                placeholder="0"
                value={form[f.key as keyof UnitFormState]}
                onChange={e => set(f.key as keyof UnitFormState, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Notes ── */}
      <Card className={`shadow-sm transition-opacity ${!form.unitType ? "opacity-40 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base">5  หมายเหตุ / Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="บันทึกข้อมูลเพิ่มเติม เช่น สภาพยูนิต ข้อจำกัด…"
            rows={2}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pb-8">
        <Button variant="outline" asChild>
          <Link href="/units">ยกเลิก</Link>
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 min-w-[160px]"
          disabled={!canSubmit || saving}
          onClick={handleSubmit}
        >
          {saving ? "กำลังบันทึก…" : "✓ บันทึกยูนิต"}
        </Button>
      </div>
    </div>
  );
}
