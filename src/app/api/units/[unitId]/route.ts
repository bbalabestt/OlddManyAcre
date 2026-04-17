import { NextRequest, NextResponse } from "next/server";
import { getUnitById, updateUnitStatus } from "@/lib/db";
import type { Unit } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  return NextResponse.json({ unit });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await params;
  const body = await request.json();

  const validStatuses: Unit["status"][] = [
    "Available", "Occupied", "Reserved", "Maintenance", "AwaitingRenewal",
  ];

  if (body.status) {
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    const updated = await updateUnitStatus(unitId, body.status);
    if (!updated) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    return NextResponse.json({ unit: updated });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}
