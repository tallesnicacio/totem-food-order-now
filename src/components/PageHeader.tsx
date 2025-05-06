
import { Link } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
  currentPage: string;
}

export function PageHeader({ title, description, breadcrumbs = [], currentPage }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mr-1 h-8 w-8 p-0"
        >
          <Link to="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
