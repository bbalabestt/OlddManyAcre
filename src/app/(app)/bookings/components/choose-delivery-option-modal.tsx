
"use client";

import type { DeliveryOption } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Truck, Tag, UserCircle, Users, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChooseDeliveryOptionModalProps {
  bookingId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deliveryOptions: DeliveryOption[];
  onSelectOption: (option: DeliveryOption) => void;
}

export function ChooseDeliveryOptionModal({
  bookingId,
  isOpen,
  onOpenChange,
  deliveryOptions,
  onSelectOption,
}: ChooseDeliveryOptionModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleConfirmSelection = () => {
    const selected = deliveryOptions.find(opt => opt.id === selectedOptionId);
    if (selected) {
      onSelectOption(selected);
    }
    onOpenChange(false); // Close modal after selection or if no option is selected
    setSelectedOptionId(null); // Reset selection
  };

  if (deliveryOptions.length === 0) {
    // This case is handled by a separate inline message in BookingDetailSidePanel
    // but providing a fallback here if modal is somehow opened without options.
    return (
         <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setSelectedOptionId(null);
            onOpenChange(open);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>No Delivery Options</DialogTitle>
                    <DialogDescription>
                        There are no delivery options proposed for this booking yet. Please coordinate with the delivery team.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) setSelectedOptionId(null); // Reset selection on close
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Delivery Option for Booking {bookingId.substring(0,8)}</DialogTitle>
          <DialogDescription>
            Select one of the delivery options proposed by the delivery team.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-3 -mr-3 my-4">
          <div className="space-y-3">
            {deliveryOptions.map((option) => (
              <Card
                key={option.id}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-shadow",
                  selectedOptionId === option.id && "ring-2 ring-primary border-primary shadow-lg"
                )}
                onClick={() => setSelectedOptionId(option.id)}
              >
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{option.providerName}</CardTitle>
                        {selectedOptionId === option.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Est. Cost: ฿{option.estimatedCost.toFixed(2)}</span>
                  </div>
                  {option.vehicleAssignments && option.vehicleAssignments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Vehicle(s) & Personnel:</h4>
                      <ul className="space-y-1 pl-1">
                        {option.vehicleAssignments.map((va, index) => (
                          <li key={va.id || index} className="text-xs border-l-2 pl-2 border-border/70">
                            <div className="flex items-center gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span>{va.quantity}x {va.vehicleType === 'Other' && va.otherVehicleType ? va.otherVehicleType : va.vehicleType}</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-1">
                              <UserCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span>{va.numberOfDrivers} Driver(s)</span>
                              {va.numberOfAssistants > 0 && (
                                <span className="ml-1 flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  {va.numberOfAssistants} Assistant(s)
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 mt-auto">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirmSelection} disabled={!selectedOptionId}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
