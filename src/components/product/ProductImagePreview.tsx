
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/hooks/useProductForm";

interface ProductImagePreviewProps {
  form: UseFormReturn<ProductFormValues>;
  previewImage: string;
}

export const ProductImagePreview = ({ form, previewImage }: ProductImagePreviewProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da Imagem</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-md overflow-hidden">
        <p className="text-sm text-muted-foreground p-2 bg-muted">
          Pré-visualização da imagem:
        </p>
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 
                  "https://placeholder.pics/svg/300x200/DEDEDE/555555/Imagem%20inválida";
              }}
            />
          ) : (
            <p className="text-muted-foreground">
              Insira uma URL para visualizar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
