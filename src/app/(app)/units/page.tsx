
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUnits } from "@/lib/data";
import { Plus, Package, Maximize2 } from "lucide-react";
import type { Metadata } from "next";
import type { Unit } from "@/types";

export const metadata: Metadata = { title: "Units — Widing" };

const STATUS_STYLE: Record<Unit["status"], string> = {
  Available:   "bg-green-100 text-green-800 border-green-200",
  Occupied:    "bg-gray-900 text-white border-gray-800",
  Reserved:    "bg-blue-100 text-blue-800 border-blue-200",
  Maintenance: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABEL: Record<Unit["status"], string> = {
  Available:   "ว่าง",
  Occupied:    "มีผู้เช่า",
  Reserved:    "สำรอง",
  Maintenance: "ซ่อมบำรุง",
};

export default function UnitsPage() {
  const units = getUnits();

  const stats = {
    total:       units.length,
    available:   units.filter(u => u.status === "Available").length,
    occupied:    units.filter(u => u.status === "Occupied").length,
    reserved:    units.filter(u => u.status === "Reserved").length,
    maintenance: units.filter(u => u.status === "Maintenance").length,
    docBoxes:    units.filter(u => u.unitType === "DocumentBox").length,
    spaces:      units.filter(u => u.unitType === "StorageSpace").length,
    revenue:     units.filter(u => u.status === "Occupied").reduce((s, u) => s + u.monthlyRate, 0),
  };

  const BRANCHES = [
    { id: "branch-bkk-sukhumvit", name: "Widing Sukhumvit" },
    { id: "branch-nb-pakkret",    name: "Nonthaburi Express" },
    { id: "branch-cm-nimman",     name: "Chiang Mai Nimman" },
    { id: "branch-bkk-sathorn",   name: "Sathorn City" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">คลังยูนิต</h1>
          <p className="text-sm text-muted-foreground">Unit Inventory — Document Boxes &amp; Storage Spaces</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/units/floor-plan/branch-bkk-sukhumvit">
              <Maximize2 className="mr-2 h-4 w-4" /> แผนผัง 2D
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มยูนิต
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "ยูนิตทั้งหมด", val: stats.total,       sub: "Total",       color: "" },
          { label: "ว่าง",          val: stats.available,   sub: "Available",   color: "text-green-700" },
          { label: "มีผู้เช่า",      val: stats.occupied,    sub: "Occupied",    color: "text-blue-700" },
          { label: "สำรอง",         val: stats.reserved,    sub: "Reserved",    color: "text-orange-600" },
          { label: "ซ่อมบำรุง",     val: stats.maintenance, sub: "Maintenance", color: "text-red-600" },
          { label: "รายได้/เดือน",  val: `฿${stats.revenue.toLocaleString()}`, sub: "Monthly Revenue", color: "text-green-700" },
        ].map(s => (
          <Card key={s.sub}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Type split */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-cyan-200 bg-cyan-50/40">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Package className="h-5 w-5 text-cyan-700" />
            <CardTitle className="text-base">📁 กล่องเอกสาร / Document Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-cyan-700">{stats.docBoxes}</span>
            <span className="text-sm text-muted-foreground ml-2">units · ฿150/กล่อง/เดือน</span>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Maximize2 className="h-5 w-5 text-blue-700" />
            <CardTitle className="text-base">🏠 พื้นที่จัดเก็บ / Storage Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-blue-700">{stats.spaces}</span>
            <span className="text-sm text-muted-foreground ml-2">units · ฿800–฿12,800/เดือน</span>
          </CardContent>
        </Card>
      </div>

      {/* Units table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการยูนิตทั้งหมด</CardTitle>
          <CardDescription>
            สาขา Sukhumvit · {units.length} ยูนิต ·{" "}
            <Link href="/units/floor-plan/branch-bkk-sukhumvit" className="text-primary underline">ดูแผนผัง 2D →</Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Unit ID</th>
                  <th className="text-left px-4 py-3 font-medium">ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium">ขนาด</th>
                  <th className="text-left px-4 py-3 font-medium">Zone · ชั้น</th>
                  <th className="text-left px-4 py-3 font-medium">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium">ลูกค้า</th>
                  <th className="text-left px-4 py-3 font-medium">ราคา/เดือน</th>
                  <th className="text-left px-4 py-3 font-medium">ต่อสัญญา</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <tr key={unit.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{unit.unitIdentifier}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {unit.unitType === "DocumentBox" ? "📁 Doc Box" : "🏠 Space"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {unit.unitType === "StorageSpace"
                        ? `${unit.widthM}×${unit.lengthM} m (${unit.totalSqm} m²)`
                        : `กล่อง 1 ใบ`}
                    </td>
                    <td className="px-4 py-3 text-xs">Zone {unit.zone} · ชั้น {unit.floor}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_STYLE[unit.status]}`}>
                        {STATUS_LABEL[unit.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{unit.currentClientName ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-700">
                      ฿{unit.monthlyRate.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {unit.billingCycleEndDate
                        ? new Date(unit.billingCycleEndDate).toLocaleDateString("th-TH", { day:"2-digit", month:"short" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">จัดการ</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
