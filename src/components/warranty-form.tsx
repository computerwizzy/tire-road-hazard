"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Car,
  User,
  Store,
  FileText,
  Loader2,
  Calendar as CalendarIcon,
  Disc3,
  Mail,
  Send,
} from "lucide-react";

import { handleWarrantyClaim, handleSendEmail } from "@/app/actions";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TIRE_BRANDS, VEHICLE_MAKES, VEHICLE_MODELS, COMMON_TIRE_SIZES } from "@/lib/constants";
import { Invoice } from "./invoice";


const FormSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Invalid email address." }),
  customerPhone: z
    .string()
    .min(10, { message: "A valid phone number is required." }),
  customerAddress: z
    .string()
    .min(10, { message: "A complete address is required." }),
  vehicleYear: z.coerce
    .number()
    .min(1980, { message: "Vehicle year must be 1980 or newer." })
    .max(new Date().getFullYear() + 1, {
      message: "Vehicle year cannot be in the future.",
    }),
  vehicleMake: z.string().min(2, { message: "Vehicle make is required." }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required." }),
  tireBrand: z.string().min(2, { message: "Tire brand is required." }),
  tireModel: z.string().min(1, { message: "Tire model is required." }),
  tireSize: z.string().min(5, {
    message: "Please enter a valid tire size (e.g., 225/45R17).",
  }),
  tireDot: z
    .string()
    .min(7, { message: "Please enter a valid DOT number (7-13 characters)." })
    .max(13, { message: "Please enter a valid DOT number (7-13 characters)." }),
  purchaseDate: z.date({
    required_error: "A purchase date is required.",
  }),
  dealerName: z.string().min(2, { message: "Dealer name is required." }),
  receipt: z.any().optional(),
});

type PolicyData = {
  policyDocument: string;
  customerName: string;
  customerEmail: string;
  policyNumber: string;
  formData: z.infer<typeof FormSchema>;
};

export default function WarrantyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PolicyData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      vehicleMake: "",
      vehicleModel: "",
      tireBrand: "",
      tireModel: "",
      tireSize: "",
      tireDot: "",
      dealerName: "",
      vehicleYear: new Date().getFullYear(),
    },
  });

  const selectedMake = form.watch("vehicleMake");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (selectedMake && VEHICLE_MODELS[selectedMake]) {
      setAvailableModels(VEHICLE_MODELS[selectedMake]);
      form.setValue('vehicleModel', ''); // Reset model when make changes
    } else {
      setAvailableModels([]);
    }
  }, [selectedMake, form]);

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    const response = await handleWarrantyClaim(values);
    if (response.success && response.data) {
      setResult({...response.data, formData: values});
    } else {
      setError(response.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  }

  async function onSendEmail() {
    if (!result) return;
    setIsSendingEmail(true);
    const response = await handleSendEmail({
        customerName: result.customerName,
        customerEmail: result.customerEmail,
        policyDocument: result.policyDocument,
    });
    if (response.success) {
        toast({
            title: "Email Sent",
            description: `The warranty policy has been sent to ${result.customerEmail}.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: response.error || "Failed to send email.",
        });
    }
    setIsSendingEmail(false);
  }

  const resetForm = () => {
    setResult(null);
    form.reset();
  }

  if (result) {
    return (
      <div className="space-y-8">
        <Invoice data={result} />
        <Card className="w-full shadow-lg print-hidden">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <FileText className="text-primary" />
              Your Warranty Policy is Ready
            </CardTitle>
            <CardDescription>
              Thank you for registering, {result.customerName}. You can email or print the policy document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-body text-sm leading-relaxed">
              {result.policyDocument}
            </pre>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-4">
                  <Button onClick={onSendEmail} disabled={isSendingEmail}>
                      {isSendingEmail ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                          </>
                      ) : (
                          <>
                              <Mail className="mr-2 h-4 w-4" />
                              Email to Customer
                          </>
                      )}
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>Print Invoice & Policy</Button>
              </div>
            <Button variant="secondary" onClick={resetForm}>Create New Warranty</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
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
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            {/* Vehicle Information */}
            <fieldset className="space-y-4">
              <legend className="font-headline text-xl font-semibold flex items-center gap-2 mb-4">
                <Car className="text-primary" />
                Vehicle Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2023"
                          {...field}
                          value={field.value || ""}
                        />
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
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_MAKES.map((make) => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMake}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableModels.length > 0 ? (
                            availableModels.map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>First select a make</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIRE_BRANDS.map((brand) => (
                             <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {COMMON_TIRE_SIZES.map((size) => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tireDot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="DOT B3RV Y8C 4223" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="receipt"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Upload Receipt (Optional)</FormLabel>
                      <FormControl>
                        <Input type="file" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
  );
}
