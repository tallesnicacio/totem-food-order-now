
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useProductForm } from "@/hooks/useProductForm";
import { ProductBasicInfo } from "@/components/product/ProductBasicInfo";
import { ProductCategorySelector } from "@/components/product/ProductCategorySelector";
import { ProductImagePreview } from "@/components/product/ProductImagePreview";
import { ProductAvailabilityToggle } from "@/components/product/ProductAvailabilityToggle";

interface ProductFormProps {
  product: Product | null;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSubmit, onCancel }: ProductFormProps) => {
  const { form, previewImage, handleSubmit, isEditing } = useProductForm(product, onSubmit);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Editar Produto" : "Novo Produto"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ProductBasicInfo form={form} />
                <ProductCategorySelector form={form} />
                <ProductAvailabilityToggle form={form} />
              </div>

              <ProductImagePreview form={form} previewImage={previewImage} />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">{isEditing ? "Salvar" : "Adicionar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
