
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/hooks/useProductForm";

interface ProductAvailabilityToggleProps {
  form: UseFormReturn<ProductFormValues>;
}

export const ProductAvailabilityToggle = ({ form }: ProductAvailabilityToggleProps) => {
  return (
    <FormField
      control={form.control}
      name="outOfStock"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>Disponibilidade</FormLabel>
            <FormDescription>
              {field.value ? "Produto indisponível no catálogo" : "Produto disponível no catálogo"}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
