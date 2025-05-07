
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/types";

// Schema definition moved to the hook
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
  outOfStock: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = (product: Product | null, onSubmit: (product: Product) => void) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  // Initialize form with default values or editing product values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: product.categoryId || product.category_id,
          outOfStock: product.outOfStock || false,
        }
      : {
          name: "",
          description: "",
          price: 0,
          image: "https://placeholder.pics/svg/300x200/DEDEDE/555555/Imagem%20do%20Produto",
          categoryId: "",
          outOfStock: false,
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

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit({
      id: product?.id || "",
      name: values.name,
      description: values.description,
      price: values.price,
      image: values.image,
      category_id: values.categoryId,
      categoryId: values.categoryId,
      outOfStock: values.outOfStock,
    });
  };

  return {
    form,
    previewImage,
    handleSubmit,
    isEditing: !!product
  };
};
