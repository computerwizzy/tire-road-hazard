
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleAddOption } from '@/app/actions';
import { Loader2 } from 'lucide-react';

const AddItemSchema = z.object({
  value: z.string().min(1, { message: 'Please enter a value.' }),
});

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listKey: 'vehicleMakes' | 'tireBrands' | 'commonTireSizes';
  listName: string;
  onSuccess: () => void;
}

export function AddItemDialog({ open, onOpenChange, listKey, listName, onSuccess }: AddItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof AddItemSchema>>({
    resolver: zodResolver(AddItemSchema),
    defaultValues: { value: '' },
  });

  async function onSubmit(values: z.infer<typeof AddItemSchema>) {
    setIsLoading(true);
    const result = await handleAddOption({ list: listKey, value: values.value });
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: `"${values.value}" has been added to the ${listName} list.`,
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || `Failed to add new ${listName}.`,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {listName}</DialogTitle>
          <DialogDescription>
            This new option will be saved and available for future use.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New {listName} Name</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter a new ${listName.toLowerCase()}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
