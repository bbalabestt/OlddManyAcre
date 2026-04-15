
"use client"; 

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { getBookingById, getClientById, getDeliveryOptionById } from "@/lib/data"; 
import type { Booking, Client, DeliveryOption } from "@/types"; 
import { AlertTriangle, QrCode, Upload, Landmark, Banknote, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
// Removed RadioGroup and Label imports as they are no longer used for payment type selection
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

export default function ManualCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  const [client, setClient] = useState<Client | null | undefined>(undefined); 
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const [calculatedStorageFee, setCalculatedStorageFee] = useState(0);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [billingMonths, setBillingMonths] = useState(0);
  const [displayTotalAmount, setDisplayTotalAmount] = useState(0);
  const [showQr, setShowQr] = useState(false); 

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
    // Manual checkout always assumes full amount
    setDisplayTotalAmount(calculatedStorageFee + calculatedDeliveryFee);
  }, [calculatedStorageFee, calculatedDeliveryFee]);


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


  const handlePaymentSubmitted = () => {
    toast({
        title: "Payment Proof Submitted (Simulated)",
        description: `Our team will verify your payment of THB ${displayTotalAmount.toFixed(2)} shortly. Thank you!`,
        className: "bg-blue-500 text-white",
        duration: 5000,
    });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Manual Payment Instructions</CardTitle>
        <CardDescription>
          Booking ID: {booking.id.substring(0,8)}...
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
        
        <div className="p-4 border rounded-lg bg-background">
          <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
          <div className="space-y-1 text-sm">
             { (booking.bookingType === 'Pick-up' && calculatedStorageFee > 0) && (
              <div className="flex justify-between">
                <span>Storage Service Fee:</span>
                <span>THB {calculatedStorageFee.toFixed(2)}</span>
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
            <h3 className="font-semibold text-md">Bank Transfer Details:</h3>
            <div className="p-3 border rounded-md bg-muted/50 text-sm space-y-1">
                <p><Landmark className="inline h-4 w-4 mr-1.5 text-muted-foreground"/><strong>Bank:</strong> Kasikorn Bank</p>
                <p><Banknote className="inline h-4 w-4 mr-1.5 text-muted-foreground"/><strong>Account Name:</strong> Many Acre Company</p>
                <p><QrCode className="inline h-4 w-4 mr-1.5 text-muted-foreground"/><strong>Account Number:</strong> 123-4-56789-0</p>
            </div>
        </div>


        {!showQr && (
          <Button variant="outline" onClick={() => setShowQr(true)} className="w-full">
            <QrCode className="mr-2 h-4 w-4" /> Show QR Code for Payment
          </Button>
        )}

        {showQr && (
          <div className="text-center p-4 border-dashed border-2 rounded-md">
            <h3 className="font-semibold mb-2">Scan Bank QR to Pay</h3>
            <div className="flex justify-center my-4" data-ai-hint="qr code payment bank">
              <Image 
                src={`https://placehold.co/200x200.png?text=Mock+Bank+QR+${displayTotalAmount.toFixed(2)}`} 
                alt="Mock Bank QR Code" 
                width={200} 
                height={200}
                className="rounded-md shadow-md" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan this QR code with your mobile banking app to transfer THB {displayTotalAmount.toFixed(2)} to our Kasikorn account.
            </p>
          </div>
        )}
        
        <Separator />

        <div className="space-y-2">
            <h3 className="font-semibold text-md">After Payment:</h3>
            <p className="text-sm text-muted-foreground">
                Please upload a screenshot or slip of your payment confirmation. Our team will verify it and update your booking status.
            </p>
            <Button variant="default" className="w-full" disabled> 
                <Upload className="mr-2 h-4 w-4" /> Upload Proof of Payment (Not Implemented)
            </Button>
        </div>

      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button onClick={handlePaymentSubmitted} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
            <CheckCircle className="mr-2 h-5 w-5" /> I Have Transferred &amp; Will Upload Proof (Simulated)
        </Button>
         <p className="text-xs text-muted-foreground text-center">
            This is a simulated checkout page. No real payment will be processed or proof uploaded.
        </p>
      </CardFooter>
    </Card>
  );
}


    