import { getUnitById, getBranchById } from "@/lib/db";
import { UnitDetailClient, UnitNotFound } from "./components/unit-detail-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ unitId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  return { title: unit ? `${unit.unitIdentifier} — Widing` : "Unit Not Found — Widing" };
}

export default async function UnitDetailPage({ params }: Props) {
  const { unitId } = await params;
  const unit = await getUnitById(unitId);

  if (!unit) return <UnitNotFound unitId={unitId} />;

  const branch = await getBranchById(unit.branchId);

  return <UnitDetailClient unit={unit} branch={branch ?? undefined} />;
}
