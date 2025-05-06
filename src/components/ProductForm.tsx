
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, Category } from "@/types";
import { useCategories } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";

const productSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  description: z.string().min(5, {
    message: "A descrição deve ter pelo menos 5 caracteres",
  }),
  price: z.coerce
    .number()
    .min(0.01, { message: "O preço deve ser maior que zero" }),
  image: z.string().url({
    message: "Por favor, insira um URL válido para a imagem",
  }),
  categoryId: z.string().min(1, {
    message: "Por favor, selecione uma categoria",
  }),
});

type FormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSubmit, onCancel }: ProductFormProps) => {
  const { categories, loading: loadingCategories } = useCategories();
  const [previewImage, setPreviewImage] = useState<string>("");

  // Initialize form with default values or editing product values
  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: product.categoryId,
        }
      : {
          name: "",
          description: "",
          price: 0,
          image: "https://placeholder.pics/svg/300x200/DEDEDE/555555/Imagem%20do%20Produto",
          categoryId: "",
        },
  });

  // Update preview when image URL changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "image") {
        setPreviewImage(value.image as string);
      }
    });
    
    // Set initial preview
    setPreviewImage(form.getValues("image"));
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      id: product?.id || "",
      name: values.name,
      description: values.description,
      price: values.price,
      image: values.image,
      categoryId: values.categoryId,
      outOfStock: product?.outOfStock || false,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-6">
          {product ? "Editar Produto" : "Novo Produto"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: X-Burguer Especial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os ingredientes e características do produto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">{product ? "Salvar" : "Adicionar"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
