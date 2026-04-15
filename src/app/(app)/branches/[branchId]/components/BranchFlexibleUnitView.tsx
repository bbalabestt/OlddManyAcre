
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BranchFlexibleUnitViewProps {
  totalCapacitySqm: number;
  occupiedCapacitySqm: number;
  branchName: string;
}

const MAX_UNITS_TO_DISPLAY_DIRECTLY = 400; // Adjust as needed for performance/UX

export function BranchFlexibleUnitView({
  totalCapacitySqm,
  occupiedCapacitySqm,
  branchName,
}: BranchFlexibleUnitViewProps) {
  if (totalCapacitySqm === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flexible Unit Layout</CardTitle>
          <CardDescription>Top-down view of 1x1 SQ.M units for {branchName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This branch has no flexible storage capacity defined.</p>
        </CardContent>
      </Card>
    );
  }

  const availableCapacitySqm = Math.max(0, totalCapacitySqm - occupiedCapacitySqm);
  const units = [];
  const displayDirectly = totalCapacitySqm <= MAX_UNITS_TO_DISPLAY_DIRECTLY;

  if (displayDirectly) {
    for (let i = 0; i < totalCapacitySqm; i++) {
      units.push({
        id: `unit-${i}`,
        isOccupied: i < occupiedCapacitySqm,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flexible Unit Layout</CardTitle>
        <CardDescription>
          Top-down view of 1x1 SQ.M units for {branchName}.
          Showing {displayDirectly ? totalCapacitySqm : `${MAX_UNITS_TO_DISPLAY_DIRECTLY} of ${totalCapacitySqm}`} units.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/60 border border-primary/80 rounded-sm"></div>
            <span>Occupied ({occupiedCapacitySqm} m²)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/30 border border-border rounded-sm"></div>
            <span>Available ({availableCapacitySqm} m²)</span>
          </div>
        </div>

        {!displayDirectly && (
          <p className="text-sm text-muted-foreground mb-3">
            Displaying a representative sample of {MAX_UNITS_TO_DISPLAY_DIRECTLY} units due to large capacity.
            The proportion of occupied to available space is maintained.
          </p>
        )}

        <div
          className={cn(
            "grid gap-0.5 p-1 border rounded-md bg-background overflow-auto max-h-[400px]",
            "grid-cols-[repeat(auto-fill,minmax(10px,1fr))]" // Responsive columns
          )}
          style={{
             // Try to make it somewhat square-ish for smaller numbers, but cap columns for larger
            gridTemplateColumns: totalCapacitySqm <= 100 ? `repeat(${Math.min(25, Math.ceil(Math.sqrt(totalCapacitySqm)))}, minmax(10px, 1fr))` : `repeat(25, minmax(10px, 1fr))`
          }}
        >
          {displayDirectly ? (
            units.map((unit) => (
              <div
                key={unit.id}
                title={unit.isOccupied ? "Occupied Unit" : "Available Unit"}
                className={cn(
                  "w-[10px] h-[10px] border border-border/50 rounded-xs",
                  unit.isOccupied ? "bg-primary/60" : "bg-muted/30"
                )}
              />
            ))
          ) : (
            // Representative sample for large capacities
            Array.from({ length: MAX_UNITS_TO_DISPLAY_DIRECTLY }).map((_, i) => {
              const isOccupiedRepresentative = (i / MAX_UNITS_TO_DISPLAY_DIRECTLY) < (occupiedCapacitySqm / totalCapacitySqm);
              return (
                <div
                  key={`rep-unit-${i}`}
                  title={isOccupiedRepresentative ? "Occupied Unit (Representative)" : "Available Unit (Representative)"}
                  className={cn(
                    "w-[10px] h-[10px] border border-border/50 rounded-xs",
                    isOccupiedRepresentative ? "bg-primary/60" : "bg-muted/30"
                  )}
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
