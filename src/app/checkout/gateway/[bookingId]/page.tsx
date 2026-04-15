
"use client"; 

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { getBookingById, getClientById, getDeliveryOptionById } from "@/lib/data"; // Added getClientById
import type { Booking, Client, DeliveryOption } from "@/types"; // Added Client
import { AlertTriangle, QrCode, CheckCircle, Loader2, CreditCard, Landmark } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, parseISO, intervalToDuration, isValid, isAfter } from "date-fns";

function calculateBillingMonths(startTimeISO?: string, endTimeISO?: string): number {
  if (!startTimeISO || !endTimeISO) return 0;

  const startDate = parseISO(startTimeISO);
  const endDate = parseISO(endTimeISO);

  if (!isValid(startDate) || !isValid(endDate) || !isAfter(endDate, startDate)) {
    return 1; 
  }

  const duration = intervalToDuration({ start: startDate, end: endDate });
  
  let billingMonths = (duration.years || 0) * 12 + (duration.months || 0);
  
  if (duration.days && duration.days > 0) {
    billingMonths += 1;
  } else if (billingMonths === 0 && startDate.getTime() !== endDate.getTime()) {
    billingMonths = 1;
  } else if (billingMonths === 0 && startDate.getTime() === endDate.getTime()) {
    billingMonths = 1;
  }
  
  return Math.max(billingMonths, 1); 
}

export default function GatewayCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  const [client, setClient] = useState<Client | null | undefined>(undefined); // Added client state
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'subscription'>('full');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'creditCard' | 'bankTransfer'>('creditCard');

  const [calculatedStorageFee, setCalculatedStorageFee] = useState(0);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [billingMonths, setBillingMonths] = useState(0);
  const [displayTotalAmount, setDisplayTotalAmount] = useState(0);
  const [displayStorageFeeComponent, setDisplayStorageFeeComponent] = useState(0);
  const [storageFeeLabel, setStorageFeeLabel] = useState("Storage Service Fee:");


  useEffect(() => {
    if (bookingId) {
      const fetchedBooking = getBookingById(bookingId);
      setBooking(fetchedBooking);
      
      let fetchedClient: Client | null | undefined = null;
      if (fetchedBooking && fetchedBooking.clientId) {
        fetchedClient = getClientById(fetchedBooking.clientId);
        setClient(fetchedClient);
      }
      
      let option: DeliveryOption | null | undefined = null;
      if (fetchedBooking && fetchedBooking.chosenDeliveryOptionId) {
        option = getDeliveryOptionById(fetchedBooking.chosenDeliveryOptionId);
        setDeliveryOption(option);
      }
      
      setIsLoading(false); 

      if (fetchedBooking) {
        const months = calculateBillingMonths(fetchedBooking.startTime, fetchedBooking.endTime);
        setBillingMonths(months);

        let baseStorageFee = 0;
        if (fetchedBooking.bookingType === 'Pick-up' && fetchedBooking.desiredWidthSqm && fetchedBooking.desiredLengthSqm && months > 0) {
          baseStorageFee = fetchedBooking.desiredWidthSqm * fetchedBooking.desiredLengthSqm * 700 * months;
        }
        setCalculatedStorageFee(baseStorageFee);

        const originalDeliveryFee = option?.estimatedCost || 0;
        setCalculatedDeliveryFee(originalDeliveryFee * 1.10); 
      }
    }
  }, [bookingId]);

  useEffect(() => {
    let currentStorageFeeComponent = 0;
    let currentStorageLabel = "Storage Service Fee:";

    if (selectedPaymentType === 'full') {
      currentStorageFeeComponent = calculatedStorageFee;
    } else { 
      currentStorageFeeComponent = billingMonths > 0 ? calculatedStorageFee / billingMonths : 0;
      currentStorageLabel = `First Month's Storage:`;
    }
    
    setDisplayStorageFeeComponent(currentStorageFeeComponent);
    setStorageFeeLabel(currentStorageLabel);
    setDisplayTotalAmount(currentStorageFeeComponent + calculatedDeliveryFee);

  }, [selectedPaymentType, calculatedStorageFee, calculatedDeliveryFee, billingMonths]);


  if (isLoading && booking === undefined) { 
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Error Loading Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't find the details for this booking (ID: {bookingId}). Please check the link or contact support.
          </p>
        </CardContent>
        <CardFooter>
            <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </CardFooter>
      </Card>
    );
  }


  const handlePaymentConfirmed = () => {
    toast({
        title: "Payment Successful (Simulated)",
        description: `Your payment of THB ${displayTotalAmount.toFixed(2)} has been processed via ${selectedPaymentMethod === 'creditCard' ? 'Credit Card' : 'Bank Transfer'}. Thank you!`,
        className: "bg-green-500 text-white",
        duration: 5000,
    });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Secure online payment for Booking ID: {booking.id.substring(0,8)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {booking && client && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/20 space-y-2 text-sm">
            <h3 className="font-semibold text-md mb-2">Booking Summary</h3>
            <p><strong>Branch:</strong> {booking.branchName || 'N/A'}</p>
            <Separator className="my-1" />
            <p><strong>Origin Location ({client.originLocationType}):</strong></p>
            <p className="pl-2">{client.originStreetAddress || 'N/A'}</p>
            <p className="pl-2 text-xs">
              {client.originSubDistrict && `${client.originSubDistrict}, `}
              {client.originDistrict && `${client.originDistrict}, `}
              {client.originProvince && `${client.originProvince} `}
              {client.originPostcode}
            </p>
            <Separator className="my-1" />
            {booking.bookingType === 'Pick-up' ? (
              <>
                <p><strong>Storage Duration:</strong> {billingMonths > 0 ? `${billingMonths} billing month(s)` : 'N/A'}</p>
                {booking.desiredWidthSqm && booking.desiredLengthSqm && (
                  <p><strong>Requested Space:</strong> {booking.desiredWidthSqm}m (W) x {booking.desiredLengthSqm}m (L) = {(booking.desiredWidthSqm * booking.desiredLengthSqm).toFixed(2)} sq m</p>
                )}
                <p><strong>Start Date:</strong> {format(parseISO(booking.startTime), "PPP")}</p>
                {booking.endTime && <p><strong>End Date:</strong> {format(parseISO(booking.endTime), "PPP")}</p>}
              </>
            ) : ( 
                 <p><strong>Return Service Date:</strong> {format(parseISO(booking.startTime), "PPP")}</p>
            )}
             <Separator className="my-1" />
          </div>
        )}
        
        <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Type</Label>
            <RadioGroup value={selectedPaymentType} onValueChange={(value) => setSelectedPaymentType(value as 'full' | 'subscription')} className="flex space-x-4">
                <div>
                    <RadioGroupItem value="full" id="paymentTypeFull" />
                    <Label htmlFor="paymentTypeFull" className="ml-2 cursor-pointer">Full Amount</Label>
                </div>
                {booking.bookingType === 'Pick-up' && billingMonths > 0 && (
                    <div>
                        <RadioGroupItem value="subscription" id="paymentTypeSubscription" />
                        <Label htmlFor="paymentTypeSubscription" className="ml-2 cursor-pointer">Subscription (First Month + Delivery)</Label>
                    </div>
                )}
            </RadioGroup>
        </div>

        <div className="p-4 border rounded-lg bg-background">
          <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
          <div className="space-y-1 text-sm">
            { (booking.bookingType === 'Pick-up' && displayStorageFeeComponent > 0) && (
              <div className="flex justify-between">
                <span>{storageFeeLabel}</span>
                <span>THB {displayStorageFeeComponent.toFixed(2)}</span>
              </div>
            )}
            {calculatedDeliveryFee > 0 && (
                <div className="flex justify-between">
                <span>Delivery Service:</span>
                <span>THB {calculatedDeliveryFee.toFixed(2)}</span>
                </div>
            )}
            <Separator className="my-1"/>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total Amount Due:</span>
              <span>THB {displayTotalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <Separator />

        <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Method</Label>
            <RadioGroup value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as 'creditCard' | 'bankTransfer')} className="flex space-x-4">
                <div>
                    <RadioGroupItem value="creditCard" id="paymentMethodCC" />
                    <Label htmlFor="paymentMethodCC" className="ml-2 cursor-pointer">Credit Card</Label>
                </div>
                <div>
                    <RadioGroupItem value="bankTransfer" id="paymentMethodBank" />
                    <Label htmlFor="paymentMethodBank" className="ml-2 cursor-pointer">Bank Transfer / QR</Label>
                </div>
            </RadioGroup>
        </div>

        {selectedPaymentMethod === 'creditCard' && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <h4 className="font-medium text-md">Enter Credit Card Details (Mock)</h4>
            <div className="space-y-2">
              <Label htmlFor="ccNumber">Card Number</Label>
              <Input id="ccNumber" placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ccExpiry">Expiry (MM/YY)</Label>
                <Input id="ccExpiry" placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="ccCvv">CVV</Label>
                <Input id="ccCvv" placeholder="•••" />
              </div>
            </div>
          </div>
        )}

        {selectedPaymentMethod === 'bankTransfer' && (
          <div className="text-center p-4 border-dashed border-2 rounded-md">
            <h3 className="font-semibold mb-1">Scan QR to Pay with Mobile Banking</h3>
             <div className="flex justify-center my-3" data-ai-hint="qr code payment bank">
              <Image 
                src={`https://placehold.co/200x200.png?text=Mock+QR+${displayTotalAmount.toFixed(2)}`} 
                alt="Mock QR Code" 
                width={200} 
                height={200}
                className="rounded-md shadow-md" 
              />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Amount: THB {displayTotalAmount.toFixed(2)}
            </p>
            <Separator className="my-3"/>
            <p className="text-xs text-muted-foreground">Or transfer to:</p>
            <p className="text-sm mt-1">
                <Landmark className="inline h-3.5 w-3.5 mr-1 text-muted-foreground"/> Kasikorn Bank <br />
                Many Acre Company <br />
                Account: 123-4-56789-0
            </p>
          </div>
        )}
        
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button onClick={handlePaymentConfirmed} className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
            <CheckCircle className="mr-2 h-5 w-5" /> Confirm Payment (Simulated)
        </Button>
        <p className="text-xs text-muted-foreground text-center">
            This is a simulated checkout page. No real payment will be processed.
        </p>
      </CardFooter>
    </Card>
  );
}

