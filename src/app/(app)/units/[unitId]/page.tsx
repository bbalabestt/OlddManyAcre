"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Maximize2, Building2, MapPin, Calendar, User, DollarSign, Edit2, CheckCircle2, AlertTriangle, Wrench, Clock } from "lucide-react";
import { getUnitById, updateUnitStatus, mockBranches } from "@/lib/data";
import { use } from "react";

const STATUS_STYLE: Record<string, { badge: string; bg: string; label: string; icon: React.ReactNode }> = {
  Available:       { badge: "bg-green-100 text-green-800 border-green-300",  bg: "bg-green-50",  label: "ว่าง",          icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> },
  Occupied:        { badge: "bg-gray-900 text-white border-gray-700",         bg: "bg-gray-50",   label: "มีผู้เช่า",       icon: <User className="w-4 h-4 text-gray-600" /> },
  Reserved:        { badge: "bg-blue-100 text-blue-800 border-blue-300",     bg: "bg-blue-50",   label: "สำรอง",         icon: <Calendar className="w-4 h-4 text-blue-600" /> },
  Maintenance:     { badge: "bg-red-100 text-red-800 border-red-300",        bg: "bg-red-50",    label: "ซ่อมบำรุง",      icon: <Wrench className="w-4 h-4 text-red-600" /> },
  AwaitingRenewal: { badge: "bg-yellow-100 text-yellow-800 border-yellow-300", bg: "bg-yellow-50", label: "รอต่อสัญญา",    icon: <Clock className="w-4 h-4 text-yellow-600" /> },
};

const STATUS_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: "Available",       label: "ว่าง",          description: "พร้อมให้เช่า" },
  { value: "Occupied",        label: "มีผู้เช่า",       description: "มีลูกค้าใช้งานอยู่" },
  { value: "Reserved",        label: "สำรอง",         description: "สำรองไว้สำหรับลูกค้า" },
  { value: "Maintenance",     label: "ซ่อมบำรุง",      description: "อยู่ระหว่างซ่อมบำรุง" },
  { value: "AwaitingRenewal", label: "รอต่อสัญญา",    description: "รอการต่ออายุสัญญา" },
];

export default function UnitDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = use(params);
  const router = useRouter();

  // We load the unit on client by calling getUnitById (mock data)
  const [unit, setUnit] = useState(() => getUnitById(unitId));
  const [editingStatus, setEditingStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-foreground">ไม่พบยูนิต</h2>
        <p className="text-sm">Unit ID: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{unitId}</code> ไม่มีในระบบ</p>
        <Button variant="outline" asChild>
          <Link href="/units"><ArrowLeft className="mr-2 h-4 w-4" /> กลับไปรายการยูนิต</Link>
        </Button>
      </div>
    );
  }

  const s = STATUS_STYLE[unit.status] ?? STATUS_STYLE.Available;
  const branch = mockBranches.find(b => b.id === unit.branchId);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    // Update in mock data
    updateUnitStatus(unit.id, newStatus as typeof unit.status);
    setUnit({ ...unit, status: newStatus as typeof unit.status });
    setSaving(false);
    setEditingStatus(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/units"><ArrowLeft className="mr-2 h-4 w-4" /> กลับ</Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-mono">{unit.unitIdentifier}</h1>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${s.badge}`}>
                {s.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {unit.unitType === "DocumentBox" ? "📁 Document Box" : "🏠 Storage Space"} ·{" "}
              Zone {unit.zone} · ชั้น {unit.floor} · {unit.branchName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/units/floor-plan/${unit.branchId}`}>
              <Maximize2 className="mr-2 h-3 w-3" /> ดูแผนผัง
            </Link>
          </Button>
          <Button size="sm" onClick={() => setEditingStatus(true)} disabled={editingStatus}>
            <Edit2 className="mr-2 h-3 w-3" /> เปลี่ยนสถานะ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Status change panel */}
          {editingStatus && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> เปลี่ยนสถานะยูนิต
                </CardTitle>
                <CardDescription>เลือกสถานะใหม่สำหรับยูนิตนี้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      disabled={saving || opt.value === unit.status}
                      onClick={() => handleStatusChange(opt.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all
                        ${opt.value === unit.status
                          ? "border-primary bg-primary/10 opacity-60 cursor-not-allowed"
                          : "border-border hover:border-primary hover:bg-muted cursor-pointer"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {STATUS_STYLE[opt.value]?.icon}
                        <span className="font-medium text-sm">{opt.label}</span>
                        {opt.value === unit.status && (
                          <Badge variant="outline" className="text-[10px] ml-auto">ปัจจุบัน</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6">{opt.description}</p>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setEditingStatus(false)}>
                  ยกเลิก
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unit info card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {unit.unitType === "DocumentBox"
                  ? <Package className="w-4 h-4 text-cyan-600" />
                  : <Maximize2 className="w-4 h-4 text-blue-600" />
                }
                ข้อมูลยูนิต
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">Unit Identifier</dt>
                  <dd className="font-mono font-semibold">{unit.unitIdentifier}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">ประเภท</dt>
                  <dd>{unit.unitType === "DocumentBox" ? "📁 Document Box" : "🏠 Storage Space"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">Zone</dt>
                  <dd className="font-semibold">Zone {unit.zone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">ชั้น</dt>
                  <dd>ชั้น {unit.floor}</dd>
                </div>

                {unit.unitType === "StorageSpace" && (
                  <>
                    <div>
                      <dt className="text-muted-foreground text-xs mb-0.5">ขนาด (กว้าง × ยาว)</dt>
                      <dd className="font-semibold">{unit.widthM} × {unit.lengthM} เมตร</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs mb-0.5">พื้นที่รวม</dt>
                      <dd className="font-semibold text-blue-700">{unit.totalSqm} ตร.ม.</dd>
                    </div>
                  </>
                )}

                {unit.unitType === "DocumentBox" && unit.boxCapacity && (
                  <div>
                    <dt className="text-muted-foreground text-xs mb-0.5">ความจุกล่อง</dt>
                    <dd>{unit.boxCapacity} กล่อง</dd>
                  </div>
                )}

                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">ค่าบริการ/เดือน</dt>
                  <dd className="font-bold text-green-700 text-base">฿{unit.monthlyRate.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs mb-0.5">สร้างเมื่อ</dt>
                  <dd className="text-xs text-muted-foreground">
                    {new Date(unit.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                  </dd>
                </div>

                {unit.notes && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground text-xs mb-0.5">หมายเหตุ</dt>
                    <dd className="text-sm bg-muted rounded p-2">{unit.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Current tenant */}
          {unit.currentClientName ? (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> ลูกค้าปัจจุบัน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs mb-0.5">ชื่อลูกค้า</dt>
                    <dd className="font-semibold">{unit.currentClientName}</dd>
                  </div>
                  {unit.billingCycleEndDate && (
                    <div>
                      <dt className="text-muted-foreground text-xs mb-0.5">วันครบกำหนด</dt>
                      <dd className="font-medium text-orange-600">
                        {new Date(unit.billingCycleEndDate).toLocaleDateString("th-TH", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </dd>
                    </div>
                  )}
                  {unit.currentClientId && (
                    <div className="col-span-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/clients/${unit.currentClientId}`}>ดูโปรไฟล์ลูกค้า →</Link>
                      </Button>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> ยูนิตว่าง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">ยูนิตนี้ยังไม่มีลูกค้า พร้อมรับการจองใหม่</p>
                <Button size="sm" asChild>
                  <Link href="/orders/new">+ สร้าง Order ใหม่</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Branch info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" /> ข้อมูลสาขา
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="font-semibold">{unit.branchName}</p>
                {branch?.addressDetail && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> {branch.addressDetail}
                  </p>
                )}
              </div>
              {branch?.operatingHours && (
                <div>
                  <p className="text-xs text-muted-foreground">เวลาทำการ</p>
                  <p className="text-xs">{branch.operatingHours}</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href={`/branches/${unit.branchId}`}>ดูรายละเอียดสาขา →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Floor plan position */}
          {(unit.floorPlanX !== undefined || unit.floorPlanY !== undefined) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> ตำแหน่งบน Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1 text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium text-foreground">X:</span> {unit.floorPlanX ?? "—"}</div>
                  <div><span className="font-medium text-foreground">Y:</span> {unit.floorPlanY ?? "—"}</div>
                  <div><span className="font-medium text-foreground">W:</span> {unit.floorPlanW ?? "—"}</div>
                  <div><span className="font-medium text-foreground">H:</span> {unit.floorPlanH ?? "—"}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue card */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-green-600" /> รายได้
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายเดือน</span>
                <span className="font-bold text-green-700">฿{unit.monthlyRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายปี (ประมาณ)</span>
                <span className="font-semibold text-green-700">฿{(unit.monthlyRate * 12).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/units/floor-plan/${unit.branchId}`}>
                  <Maximize2 className="mr-2 h-3 w-3" /> ดูแผนผัง 2D
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setEditingStatus(true)}
              >
                <Edit2 className="mr-2 h-3 w-3" /> เปลี่ยนสถานะ
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/units/new">
                  <Package className="mr-2 h-3 w-3" /> เพิ่มยูนิตใหม่
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-3 w-3" /> ย้อนกลับ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
