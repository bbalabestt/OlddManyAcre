
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getUnits } from "@/lib/data";
import type { Unit } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Floor Plan — Widing" };

const STATUS_COLOR: Record<Unit["status"], { bg: string; border: string; text: string; dot: string }> = {
  Available:   { bg:"bg-green-100",  border:"border-green-400", text:"text-green-900",  dot:"bg-green-500"  },
  Occupied:    { bg:"bg-gray-900",   border:"border-gray-700",  text:"text-white",       dot:"bg-green-400"  },
  Reserved:    { bg:"bg-blue-100",   border:"border-blue-400",  text:"text-blue-900",   dot:"bg-blue-500"   },
  Maintenance: { bg:"bg-red-100",    border:"border-red-400",   text:"text-red-900",    dot:"bg-red-500"    },
};

const STATUS_LABEL_TH: Record<Unit["status"], string> = {
  Available:   "ว่าง",
  Occupied:    "มีผู้เช่า",
  Reserved:    "สำรอง",
  Maintenance: "ซ่อมบำรุง",
};

function FloorPlanCell({ unit }: { unit: Unit }) {
  const s = STATUS_COLOR[unit.status];
  const isLarge = unit.totalSqm && unit.totalSqm >= 9;
  const isMedium = unit.totalSqm && unit.totalSqm >= 4 && unit.totalSqm < 9;

  return (
    <div
      className={`relative rounded-lg border-2 flex flex-col justify-between p-2 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer
        ${s.bg} ${s.border}
        ${isLarge ? "min-h-[120px] min-w-[120px]" : isMedium ? "min-h-[90px] min-w-[90px]" : "min-h-[60px] min-w-[60px]"}
      `}
    >
      <div>
        <p className={`font-bold text-[11px] leading-tight ${s.text}`}>{unit.unitIdentifier}</p>
        {unit.totalSqm && (
          <p className={`text-[10px] ${s.text} opacity-80`}>{unit.totalSqm} m²</p>
        )}
      </div>
      {unit.currentClientName && (
        <p className={`text-[9px] font-medium truncate ${s.text} opacity-90`}>{unit.currentClientName}</p>
      )}
      <div className="flex items-center gap-1 mt-1">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className={`text-[9px] ${s.text} opacity-80`}>{STATUS_LABEL_TH[unit.status]}</span>
      </div>
    </div>
  );
}

export default function FloorPlanPage({ params }: { params: { branchId: string } }) {
  const allUnits = getUnits(params.branchId);
  const floors = [...new Set(allUnits.map(u => u.floor))].sort();
  const zones  = [...new Set(allUnits.map(u => u.zone))].sort();

  const BRANCH_NAMES: Record<string, string> = {
    "branch-bkk-sukhumvit": "Widing Sukhumvit Micro-Hub",
    "branch-nb-pakkret":    "Nonthaburi Express Pods",
    "branch-cm-nimman":     "Chiang Mai Nimman Vault",
    "branch-bkk-sathorn":   "Sathorn City Store",
  };
  const branchName = BRANCH_NAMES[params.branchId] ?? "Branch";

  const stats = {
    total:       allUnits.length,
    available:   allUnits.filter(u => u.status === "Available").length,
    occupied:    allUnits.filter(u => u.status === "Occupied").length,
    reserved:    allUnits.filter(u => u.status === "Reserved").length,
    maintenance: allUnits.filter(u => u.status === "Maintenance").length,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/units"><ArrowLeft className="mr-2 h-4 w-4" /> กลับ</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">แผนผัง 2D — {branchName}</h1>
          <p className="text-sm text-muted-foreground">Floor Plan View · {allUnits.length} units across {floors.length} floor(s)</p>
        </div>
      </div>

      {/* Legend + stats */}
      <div className="flex flex-wrap gap-3 items-center">
        {(Object.keys(STATUS_COLOR) as Unit["status"][]).map(s => (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <span className={`w-3 h-3 rounded-sm border ${STATUS_COLOR[s].bg} ${STATUS_COLOR[s].border}`} />
            <span className="font-medium">{STATUS_LABEL_TH[s]}</span>
            <span className="text-muted-foreground">
              ({s === "Available" ? stats.available : s === "Occupied" ? stats.occupied : s === "Reserved" ? stats.reserved : stats.maintenance})
            </span>
          </div>
        ))}
      </div>

      {/* Floor tabs */}
      {floors.map(floor => (
        <Card key={floor} className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              🏢 ชั้น {floor}
              <span className="text-xs font-normal text-muted-foreground">
                — {allUnits.filter(u => u.floor === floor).length} units
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Corridor label */}
            <div className="text-center text-xs text-muted-foreground mb-4 py-1 bg-muted rounded-md">
              ← ทางเข้า / ENTRANCE →
            </div>

            {/* Zone grid */}
            <div className="space-y-6">
              {zones.map(zone => {
                const zoneUnits = allUnits.filter(u => u.floor === floor && u.zone === zone);
                if (!zoneUnits.length) return null;
                const docBoxes = zoneUnits.filter(u => u.unitType === "DocumentBox");
                const spaces   = zoneUnits.filter(u => u.unitType === "StorageSpace");

                return (
                  <div key={zone}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {zone}
                      </div>
                      <span className="text-sm font-semibold">Zone {zone}</span>
                      <span className="text-xs text-muted-foreground">
                        {docBoxes.length > 0 ? `${docBoxes.length} Doc Boxes` : ""}
                        {docBoxes.length > 0 && spaces.length > 0 ? " · " : ""}
                        {spaces.length > 0 ? `${spaces.length} Storage Spaces` : ""}
                      </span>
                    </div>

                    {/* Document boxes — compact grid */}
                    {docBoxes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
                          📁 Document Boxes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {docBoxes.map(u => <FloorPlanCell key={u.id} unit={u} />)}
                        </div>
                      </div>
                    )}

                    {/* Storage spaces — larger cells */}
                    {spaces.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
                          🏠 Storage Spaces
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {spaces.map(u => <FloorPlanCell key={u.id} unit={u} />)}
                        </div>
                      </div>
                    )}

                    {/* Corridor between zones */}
                    <div className="mt-4 h-px bg-dashed border-t border-dashed border-muted-foreground/30" />
                    <p className="text-center text-[10px] text-muted-foreground mt-1">— ทางเดิน / CORRIDOR —</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
