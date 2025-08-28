import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



// eslint-disable-next-line react/prop-types
export default function Page({ children }) {
  const navigate = useNavigate();

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };


  
  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="w-full">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 p-2 md:p-4 pt-2">
        <div className="mx-auto w-full max-w-[calc(100vw-1rem)] ">
          <div className="rounded-lg   ">
            <div className="w-full overflow-x-auto">
              {children}
            </div>
          </div>
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
  );
}
