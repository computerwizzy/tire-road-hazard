
'use client';

import { useState, useEffect } from 'react';
import { fetchFormData, handleAddOption, handleDeleteOption, handleAddVehicleModel, handleDeleteVehicleModel, handleAddVehicleSubmodel, handleDeleteVehicleSubmodel } from '@/app/actions';
import type { DataForForm } from '@/data/db-actions';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Car, Disc3, Settings } from 'lucide-react';
import { AddItemDialog } from '@/components/add-item-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


type ListKey = 'vehicleMakes' | 'tireBrands' | 'commonTireSizes';
type DialogState = {
    open: boolean;
    listKey: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes' | 'vehicleModels' | 'vehicleSubmodels';
    listName: string;
    make?: string;
    model?: string;
}

function ListManager({ title, list, listKey, onAdd, onDelete }: { title: string, list: string[], listKey: ListKey, onAdd: () => void, onDelete: (item: string) => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Manage the {title.toLowerCase()} list.</CardDescription>
                </div>
                <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <ul className="divide-y">
                        {list.map(item => (
                            <li key={item} className="flex items-center justify-between p-3">
                                <span className="text-sm font-medium">{item}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete "{item}" from the list.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(item)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                </div>
                 {list.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No items in this list yet.</p>
                 )}
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
    const [formData, setFormData] = useState<DataForForm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogState, setDialogState] = useState<DialogState>({ open: false, listKey: 'vehicleMakes', listName: '' });
    const { toast } = useToast();

    const loadFormData = async () => {
        setIsLoading(true);
        const data = await fetchFormData();
        setFormData(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadFormData();
    }, []);

    const openDialog = (listKey: DialogState['listKey'], listName: DialogState['listName'], context?: {make?: string, model?: string}) => {
        setDialogState({ open: true, listKey, listName, ...context });
    }

    const handleDelete = async (listKey: ListKey, item: string) => {
        const result = await handleDeleteOption({ list: listKey, value: item });
        if (result.success) {
            toast({ title: "Item Deleted", description: `"${item}" has been removed.` });
            loadFormData();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const handleDeleteModel = async (make: string, model: string) => {
        const result = await handleDeleteVehicleModel({ make, model });
        if (result.success) {
            toast({ title: "Model Deleted", description: `"${model}" has been removed from "${make}".` });
            loadFormData();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const handleDeleteSubmodel = async (make: string, model: string, submodel: string) => {
        const result = await handleDeleteVehicleSubmodel({ make, model, submodel });
        if (result.success) {
            toast({ title: "Submodel Deleted", description: `"${submodel}" has been removed.` });
            loadFormData();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    if (isLoading || !formData) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }
    
    const sortedMakes = Object.keys(formData.vehicleModels).sort();

    return (
        <AdminLayout>
            <AddItemDialog 
                open={dialogState.open}
                onOpenChange={(open) => setDialogState({...dialogState, open})}
                listKey={dialogState.listKey}
                listName={dialogState.listName}
                onSuccess={loadFormData}
                make={dialogState.make}
                model={dialogState.model}
            />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings /> Admin Settings
                    </h2>
                </div>
                <Tabs defaultValue="general">
                    <TabsList>
                        <TabsTrigger value="general"><Disc3 className="mr-2 h-4 w-4"/>General Lists</TabsTrigger>
                        <TabsTrigger value="vehicles"><Car className="mr-2 h-4 w-4"/>Vehicle Models</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="space-y-4">
                        <ListManager 
                            title="Tire Brands" 
                            list={formData.tireBrands} 
                            listKey="tireBrands"
                            onAdd={() => openDialog('tireBrands', 'Tire Brand')}
                            onDelete={(item) => handleDelete('tireBrands', item)}
                        />
                         <ListManager 
                            title="Common Tire Sizes" 
                            list={formData.commonTireSizes} 
                            listKey="commonTireSizes"
                            onAdd={() => openDialog('commonTireSizes', 'Tire Size')}
                            onDelete={(item) => handleDelete('commonTireSizes', item)}
                        />
                    </TabsContent>
                    <TabsContent value="vehicles">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Vehicle Makes, Models, and Submodels</CardTitle>
                                    <CardDescription>Manage the vehicle hierarchy.</CardDescription>
                                </div>
                                 <Button onClick={() => openDialog('vehicleMakes', 'Vehicle Make')}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Make
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="multiple" className="w-full">
                                   {sortedMakes.map(make => (
                                        <AccordionItem value={make} key={make}>
                                            <AccordionTrigger>
                                                <div className="flex items-center justify-between w-full pr-4">
                                                    <span className="font-medium">{make}</span>
                                                    <div className="flex items-center gap-2">
                                                         <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDialog('vehicleModels', 'Vehicle Model', { make }); }}>
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Model
                                                        </Button>
                                                        <AlertDialog onOpenChange={(open) => {if(open) { e.stopPropagation();}}}>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Delete "{make}"?</AlertDialogTitle><AlertDialogDescription>This will delete the make and all its associated models and submodels.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('vehicleMakes', make)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-4">
                                                {Object.keys(formData.vehicleModels[make]).sort().map(model => (
                                                    <Accordion type="multiple" className="w-full" key={model}>
                                                        <AccordionItem value={model}>
                                                             <AccordionTrigger>
                                                                <div className="flex items-center justify-between w-full pr-4">
                                                                     <span className="font-normal text-sm">{model}</span>
                                                                     <div className="flex items-center gap-2">
                                                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openDialog('vehicleSubmodels', 'Vehicle Submodel', { make, model }); }}>
                                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Submodel
                                                                        </Button>
                                                                        <AlertDialog onOpenChange={(open) => {if(open) { e.stopPropagation();}}}>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader><AlertDialogTitle>Delete "{model}"?</AlertDialogTitle><AlertDialogDescription>This will delete the model and all its submodels.</AlertDialogDescription></AlertDialogHeader>
                                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteModel(make, model)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </div>
                                                             </AccordionTrigger>
                                                             <AccordionContent className="pl-8">
                                                                <ul className="divide-y">
                                                                    {formData.vehicleModels[make][model].map(submodel => (
                                                                        <li key={submodel} className="flex items-center justify-between p-2">
                                                                            <span className="text-xs">{submodel}</span>
                                                                             <AlertDialog onOpenChange={(open) => {if(open) { e.stopPropagation();}}}>
                                                                                <AlertDialogTrigger asChild>
                                                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                                    </Button>
                                                                                </AlertDialogTrigger>
                                                                                <AlertDialogContent>
                                                                                    <AlertDialogHeader><AlertDialogTitle>Delete "{submodel}"?</AlertDialogTitle><AlertDialogDescription>This action is irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSubmodel(make, model, submodel)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                                                </AlertDialogContent>
                                                                            </AlertDialog>
                                                                        </li>
                                                                    ))}
                                                                     {formData.vehicleModels[make][model].length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No submodels defined.</p>}
                                                                </ul>
                                                             </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                                {Object.keys(formData.vehicleModels[make]).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No models defined for this make.</p>}
                                            </AccordionContent>
                                        </AccordionItem>
                                   ))}
                                </Accordion>
                            </CardContent>
                         </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
