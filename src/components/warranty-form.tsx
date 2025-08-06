
'use client';

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Car,
  User,
  Store,
  Loader2,
  Calendar as CalendarIcon,
  Disc3,
} from "lucide-react";

import { handleWarrantyClaim } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { WarrantyResult, type PolicyData } from "./warranty-result";
import { Checkbox } from "./ui/checkbox";


const FormSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Invalid email address." }),
  customerPhone: z
    .string()
    .min(10, { message: "A valid phone number is required." }),
  customerStreet: z.string().min(5, { message: "Street address is required." }),
  customerCity: z.string().min(2, { message: "City is required." }),
  customerState: z.string().min(2, { message: "State is required." }),
  customerZip: z.string().min(5, { message: "Valid ZIP code is required." }),
  vehicleYear: z.coerce
    .number()
    .min(1900, { message: "Vehicle year must be 1900 or newer." })
    .max(new Date().getFullYear() + 1, {
      message: "Vehicle year cannot be in the future.",
    }),
  vehicleMake: z.string().min(2, { message: "Vehicle make is required." }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required." }),
  vehicleSubmodel: z.string().optional(),
  vehicleMileage: z.coerce
    .number({invalid_type_error: "Mileage must be a number."})
    .min(0, { message: "Mileage must be a positive number." }),
  isCommercial: z.boolean().default(false),
  tireBrand: z.string().min(2, { message: "Tire brand is required." }),
  tireModel: z.string().min(1, { message: "Tire model is required." }),
  tireSize: z.string().min(5, {
    message: "Please enter a valid tire size (e.g., 225/45R17).",
  }),
  tireQuantity: z.coerce.number().min(1, { message: "Quantity must be at least 1."}).max(6, { message: "You can add a maximum of 6 tires."}),
  pricePerTire: z.coerce.number().min(0, { message: "Price must be a positive number."}),
  roadHazardPrice: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  tireDot1: z.string().min(7, { message: "Please enter a valid DOT number (7-13 characters)." }).max(13, { message: "Please enter a valid DOT number (7-13 characters)." }),
  tireDot2: z.string().optional(),
  tireDot3: z.string().optional(),
  tireDot4: z.string().optional(),
  tireDot5: z.string().optional(),
  tireDot6: z.string().optional(),
  purchaseDate: z.date({
    required_error: "A purchase date is required.",
  }),
  dealerName: z.string().min(2, { message: "Dealer name is required." }),
});

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


export default function WarrantyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PolicyData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      invoiceNumber: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerStreet: "",
      customerCity: "",
      customerState: "",
      customerZip: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleSubmodel: "",
      vehicleMileage: undefined,
      isCommercial: false,
      tireBrand: "",
      tireModel: "",
      tireSize: "",
      tireQuantity: 1,
      pricePerTire: undefined,
      roadHazardPrice: undefined,
      tireDot1: "",
      tireDot2: "",
      tireDot3: "",
      tireDot4: "",
      tireDot5: "",
      tireDot6: "",
      dealerName: "",
      vehicleYear: new Date().getFullYear(),
    },
  });
  
  const tireQuantity = form.watch('tireQuantity');
  const tireDot1Value = form.watch('tireDot1');
  const prevTireDot1Value = useRef<string>();

  useEffect(() => {
    const updateOtherDots = () => {
        if (tireDot1Value && tireDot1Value !== prevTireDot1Value.current) {
            for (let i = 2; i <= tireQuantity; i++) {
                const fieldName = `tireDot${i}` as const;
                const currentValue = form.getValues(fieldName);
                // Only update if the field is empty or was previously synced
                if (!currentValue || currentValue === prevTireDot1Value.current) {
                    form.setValue(fieldName, tireDot1Value, { shouldValidate: true, shouldDirty: true });
                }
            }
        }
        prevTireDot1Value.current = tireDot1Value;
    };
    updateOtherDots();
  }, [tireDot1Value, tireQuantity, form]);


  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);

    let receiptData = null;
    const receiptFile = fileInputRef.current?.files?.[0];
    if (receiptFile) {
        const buffer = await toBase64(receiptFile);
        receiptData = {
            buffer,
            contentType: receiptFile.type,
            fileName: receiptFile.name
        }
    }

    const response = await handleWarrantyClaim(values, receiptData);
    if (response.success && response.data) {
      setResult({...response.data, formData: values});
    } else {
      setError(response.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  }

  const resetForm = () => {
    setResult(null);
    form.reset();
  }

  if (result) {
    return <WarrantyResult result={result} onReset={resetForm} />;
  }

  return (
    <>
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Warranty Registration
        </CardTitle>
        <CardDescription>
          Complete the form below to activate your tire warranty.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Information */}
            <fieldset className="space-y-4">
              <legend className="font-headline text-xl font-semibold flex items-center gap-2 mb-4">
                <User className="text-primary" />
                Customer Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerStreet"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
                    <FormField
                    control={form.control}
                    name="customerCity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input placeholder="City/Town" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="customerState"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                            <Input placeholder="CA" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="customerZip"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                            <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>
            </fieldset>

            {/* Vehicle Information */}
            <fieldset className="space-y-4">
              <legend className="font-headline text-xl font-semibold flex items-center gap-2 mb-4">
                <Car className="text-primary" />
                Vehicle Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                       <FormControl>
                        <Input placeholder="e.g. Ford" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                       <FormControl>
                        <Input placeholder="e.g. F-150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleSubmodel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submodel (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lariat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 54000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isCommercial"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 pb-2">
                       <FormControl>
                         <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                       </FormControl>
                       <div className="space-y-1 leading-none">
                        <FormLabel>
                          Commercial Vehicle
                        </FormLabel>
                        <FormDescription>
                          Check this box if the vehicle is used for commercial purposes.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            {/* Tire Information */}
            <fieldset className="space-y-4">
              <legend className="font-headline text-xl font-semibold flex items-center gap-2 mb-4">
                <Disc3 className="text-primary" />
                Tire Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tireBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Michelin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tireModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Pilot Sport 4S" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tireSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                       <FormControl>
                        <Input placeholder="e.g. 225/45R17" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tireQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (Max 6)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 4" {...field} min={1} max={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerTire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Tire</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 { tireQuantity > 0 && <FormField
                  control={form.control}
                  name="tireDot1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 1</FormLabel>
                      <FormControl>
                        <Input placeholder="DOT B3RV Y8C 4223" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                 { tireQuantity > 1 && <FormField
                  control={form.control}
                  name="tireDot2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                 { tireQuantity > 2 && <FormField
                  control={form.control}
                  name="tireDot3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 3</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                 { tireQuantity > 3 && <FormField
                  control={form.control}
                  name="tireDot4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 4</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                { tireQuantity > 4 && <FormField
                  control={form.control}
                  name="tireDot5"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 5</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
                { tireQuantity > 5 && <FormField
                  control={form.control}
                  name="tireDot6"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number 6</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
              </div>
            </fieldset>

            {/* Purchase Information */}
            <fieldset className="space-y-4">
              <legend className="font-headline text-xl font-semibold flex items-center gap-2 mb-4">
                <Store className="text-primary" />
                Purchase Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dealerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dealer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="City Tire Center" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. INV-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roadHazardPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Road Hazard Price</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="md:col-span-2">
                    <FormLabel>Upload Receipt (Optional)</FormLabel>
                    <FormControl>
                    <Input type="file" ref={fileInputRef} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              </div>
            </fieldset>

            <div className="mt-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Policy...
                  </>
                ) : (
                  "Register Warranty"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          By submitting this form, you agree to the terms and conditions of the
          TireSafe Road Hazard Warranty.
        </p>
      </CardFooter>
    </Card>
    </>
  );
}

    
    

    