
"use client";

import type { DeliveryOption } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Tag, Star, Trash2, UserCircle, Users, Phone } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { deleteDeliveryOption } from "@/lib/data";
import { useRouter } from "next/navigation";

interface DeliveryOptionsListProps {
  bookingId: string;
  options: DeliveryOption[];
}

export function DeliveryOptionsList({ bookingId, options }: DeliveryOptionsListProps) {
  const { toast } = useToast();
  const router = useRouter();

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No delivery options have been added for this booking yet.
      </p>
    );
  }

  const handleDelete = async (optionId: string) => {
    if (confirm("Are you sure you want to delete this delivery option?")) {
      try {
        deleteDeliveryOption(optionId, bookingId);
        toast({
          title: "Delivery Option Deleted",
          description: "The delivery option has been removed.",
        });
        router.refresh(); 
      } catch (error) {
        console.error("Failed to delete delivery option:", error);
        toast({
          title: "Error Deleting Option",
          description: "Could not delete the delivery option. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Card key={option.id} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-base">{option.providerName === 'Other' ? option.otherProviderName : option.providerName}</CardTitle>
                {option.isRecommended && <Badge variant="outline" className="border-accent text-accent-foreground"><Star className="h-3 w-3 mr-1 fill-accent"/>Recommended</Badge>}
            </div>
            <CardDescription className="text-xs">
              Added: {format(parseISO(option.createdAt), "PPp")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Est. Cost: ฿{option.estimatedCost.toFixed(2)}</span>
            </div>
            {option.picPhoneNumber && (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>PIC Phone: {option.picPhoneNumber}</span>
                </div>
            )}
            
            {option.vehicleAssignments && option.vehicleAssignments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Vehicle(s) & Personnel:</h4>
                <ul className="space-y-1.5 pl-1">
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
          <CardFooter className="pt-2 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={() => handleDelete(option.id)}
            >
              <Trash2 className="h-3 w-3 mr-1"/>Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
