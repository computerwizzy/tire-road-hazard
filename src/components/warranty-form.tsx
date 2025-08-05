
"use client";

import { useState, useEffect, useRef } from "react";
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

import { handleWarrantyClaim, getInitialFormData, getModelsForMake, getSubmodelsForModel } from "@/app/actions";
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
import type { DataForForm } from "@/data/db-actions";
import { WarrantyResult, type PolicyData } from "./warranty-result";


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
    .min(1900, { message: "Vehicle year must be 1900 or newer." })
    .max(new Date().getFullYear() + 1, {
      message: "Vehicle year cannot be in the future.",
    }),
  vehicleMake: z.string().min(2, { message: "Vehicle make is required." }),
  vehicleModel: z.string().min(1, { message: "Vehicle model is required." }),
  vehicleSubmodel: z.string().optional(),
  vehicleMileage: z.coerce
    .number()
    .min(0, { message: "Mileage must be a positive number." }),
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
  const [formData, setFormData] = useState<DataForForm | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [availableSubmodels, setAvailableSubmodels] = useState<string[]>([]);
  const [isSubmodelsLoading, setIsSubmodelsLoading] = useState(false);
  const [vehicleYears, setVehicleYears] = useState<(number | string)[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleSubmodel: "",
      vehicleMileage: 0,
      tireBrand: "",
      tireModel: "",
      tireSize: "",
      tireDot: "",
      dealerName: "",
      vehicleYear: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
        const data = await getInitialFormData();
        setFormData(data);
    }
    const currentYear = new Date().getFullYear();
    const years: (number | string)[] = [];
    for (let year = currentYear; year >= 1995; year--) {
      years.push(year);
    }
    setVehicleYears(years);
    loadInitialData();
  }, []);

  const selectedMake = form.watch("vehicleMake");
  const selectedModel = form.watch("vehicleModel");

  useEffect(() => {
    async function fetchModels() {
        if (selectedMake) {
            setIsModelsLoading(true);
            const models = await getModelsForMake(selectedMake);
            setAvailableModels(models);
            setIsModelsLoading(false);
        }
    }
    form.setValue('vehicleModel', ''); 
    form.setValue('vehicleSubmodel', '');
    setAvailableModels([]);
    setAvailableSubmodels([]);
    fetchModels();
  }, [selectedMake, form]);
  
  useEffect(() => {
    async function fetchSubmodels() {
        if (selectedMake && selectedModel) {
            setIsSubmodelsLoading(true);
            const submodels = await getSubmodelsForModel(selectedMake, selectedModel);
            setAvailableSubmodels(submodels);
            setIsSubmodelsLoading(false);
        }
    }
    form.setValue('vehicleSubmodel', '');
    setAvailableSubmodels([]);
    fetchSubmodels();
  }, [selectedMake, selectedModel, form]);

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
  
  if (!formData) {
      return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleYears.map((year) => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <div className="flex gap-2">
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formData.vehicleMakes.map((make) => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
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
                      <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!selectedMake || isModelsLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isModelsLoading ? "Loading..." : (!selectedMake ? "Select make first" : "Select a model")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isModelsLoading ? (
                            <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : availableModels.length > 0 ? (
                            availableModels.map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>Select a make first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleSubmodel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submodel</FormLabel>
                      <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!selectedModel || availableSubmodels.length === 0 || isSubmodelsLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isSubmodelsLoading ? "Loading..." : (!selectedModel ? "Select model first" : "Select a submodel")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {isSubmodelsLoading ? (
                             <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                           ) : availableSubmodels.length > 0 ? (
                            availableSubmodels.map((submodel) => (
                              <SelectItem key={submodel} value={submodel}>{submodel}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No submodels available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      </div>
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
                        <Input type="number" placeholder="e.g. 54000" {...field} />
                      </FormControl>
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
                      <div className="flex gap-2">
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
                          {formData.tireBrands.map((brand) => (
                             <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
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
                      <div className="flex gap-2">
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {formData.commonTireSizes.map((size) => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
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
