
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/hooks/useProductForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductImagePreviewProps {
  form: UseFormReturn<ProductFormValues>;
  previewImage: string;
}

export const ProductImagePreview = ({ form, previewImage }: ProductImagePreviewProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // size in MB
    
    if (fileSize > 2) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Gere um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // Faça upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });
        
      if (error) throw error;
      
      // Obtenha a URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
        
      // Atualize o formulário com a URL da imagem
      form.setValue('image', urlData.publicUrl);
      
      toast({
        title: "Upload concluído",
        description: "Imagem carregada com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem do Produto</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input placeholder="https://..." {...field} />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      id="product-image" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span>Enviando...</span>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Fazer upload
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ou cole uma URL
                  </div>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-md overflow-hidden">
        <p className="text-sm text-muted-foreground p-2 bg-muted flex items-center">
          <Image className="h-4 w-4 mr-1" /> Pré-visualização da imagem:
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
              Insira uma URL ou faça upload de uma imagem
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
