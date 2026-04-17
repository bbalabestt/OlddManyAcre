import { NextRequest, NextResponse } from "next/server";
import { getUnits, createUnit } from "@/lib/db";
import type { Unit } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? undefined;
  const units = await getUnits(branchId);
  return NextResponse.json({ units });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["unitType", "branchId", "branchName", "unitIdentifier", "zone", "floor", "monthlyRate", "status"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate StorageSpace dimensions
    if (body.unitType === "StorageSpace") {
      if (!body.widthM || !body.lengthM) {
        return NextResponse.json({ error: "StorageSpace requires widthM and lengthM" }, { status: 400 });
      }
    }

    const unitData: Omit<Unit, "id" | "createdAt"> = {
      unitType:       body.unitType,
      branchId:       body.branchId,
      branchName:     body.branchName,
      unitIdentifier: body.unitIdentifier,
      zone:           body.zone,
      floor:          Number(body.floor),
      status:         body.status ?? "Available",
      monthlyRate:    Number(body.monthlyRate),
      widthM:         body.widthM    ? Number(body.widthM)    : undefined,
      lengthM:        body.lengthM   ? Number(body.lengthM)   : undefined,
      totalSqm:       body.totalSqm  ? Number(body.totalSqm)  : undefined,
      boxCapacity:    body.boxCapacity ? Number(body.boxCapacity) : undefined,
      floorPlanX:     body.floorPlanX ? Number(body.floorPlanX) : undefined,
      floorPlanY:     body.floorPlanY ? Number(body.floorPlanY) : undefined,
      floorPlanW:     body.floorPlanW ? Number(body.floorPlanW) : undefined,
      floorPlanH:     body.floorPlanH ? Number(body.floorPlanH) : undefined,
      notes:          body.notes ?? undefined,
    };

    const newUnit = await createUnit(unitData);
    return NextResponse.json({ unit: newUnit }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
