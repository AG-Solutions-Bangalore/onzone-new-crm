import React, { useState, useRef, useEffect } from "react";
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { getTodayDate } from "@/utils/currentDate";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Scan,
  X,
  ScanQrCode,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { useMutation } from "@tanstack/react-query";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useFetchBrand } from "@/hooks/useApi";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  stock_brand: z.string().min(1, "Brand is required"),
  stock_date: z.string().min(1, "Date is required"),
  stock_remarks: z.string().optional(),
});

const CreateStock = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [scanningActive, setScanningActive] = useState(true);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState("");
  const barcodeInputRef = useRef(null);
  const mobileBarcodeInputRef = useRef(null);
  const navigate = useNavigate();
  const [showFormDrawer, setShowFormDrawer] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [barcodes, setBarcodes] = useState([]);

  useEffect(() => {
    if (scanningActive && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [scanningActive]);

  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stock_brand: "",
      stock_date: getTodayDate(),
      stock_remarks: "",
    },
  });
const { data: brandData, isFetching: isBrandLoading, refetch: refetchBrands } = useFetchBrand();
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = e.target.value.trim();
      if (barcode) {
        addBarcode(barcode);
        e.target.value = "";
      }
    }
  };

  // const addBarcode = (barcode) => {
  //   if (!barcodes.includes(barcode)) {
  //     setBarcodes([...barcodes, barcode]);
  //     setHighlightedItem(barcode);
  //     setTimeout(() => {
  //       setHighlightedItem(null);
  //     }, 2000);
      
  //     toast({
  //       title: "Barcode Added",
  //       description: `Added barcode: ${barcode}`,
  //     });
  //   } else {
  //     toast({
  //       title: "Duplicate Barcode",
  //       description: `Barcode ${barcode} already exists`,
  //       variant: "destructive",
  //     });
  //   }
  // };
  const addBarcode = (barcode) => {
   
    setBarcodes([...barcodes, barcode]);
    setHighlightedItem(barcode);
    setTimeout(() => {
      setHighlightedItem(null);
    }, 2000);
    
    toast({
      title: "Barcode Added",
      description: `Added barcode: ${barcode}`,
    });
  };
  const removeBarcode = (barcode) => {
    setBarcodes(barcodes.filter(b => b !== barcode));
    toast({
      title: "Barcode Removed",
      description: `Removed barcode: ${barcode}`,
    });
  };

  const handleBarcodeScanMobile = (result) => {
    if (result) {
      addBarcode(result);
      setShowScanner(false);
    }
  };

  const submitStockMutation = useMutation({
    mutationFn: async (stockData) => {
 
      const response = await fetch(`${BASE_URL}/api/create-stock-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(stockData),
      });
      if (!response.ok) throw new Error("Failed to create stock");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || 'Stock created successfully',
        variant: "default",
      });
      form.reset({
        stock_brand: "",
        stock_date: getTodayDate(),
        stock_remarks: "",
      });
      setBarcodes([]);
      if (window.innerWidth < 1024) {
      setShowFormDrawer(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create stock",
        variant: "destructive",
      });
      if (window.innerWidth < 1024) {
      setShowFormDrawer(true);
      }
    },
  });

  const handleSubmitStock = () => {
    if (barcodes.length === 0) {
      toast({
        title: "No Barcodes",
        description: "Please add at least one barcode to the stock",
        variant: "destructive",
      });
      return;
    }
  
    const stockData = {
      ...form.getValues(),
      stock_data: barcodes.map((barcode) => ({ stock_barcode: barcode })), 
    };
  
    if (window.innerWidth < 1024) {
   
      setShowFormDrawer(true);
    } else {
     
      try {
        submitStockMutation.mutate(stockData);
        console.log("stock large data", stockData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    }
  };
  
  const handleFinalSubmit = () => {
    const stockData = {
      ...form.getValues(),
      stock_data: barcodes.map((barcode) => ({ stock_barcode: barcode })), 
    };
    try {
      submitStockMutation.mutate(stockData);
      console.log("stock mobile data", stockData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };
  
  const totalBarcodes = barcodes.length;
if (isBrandLoading ) {
    return <LoaderComponent name=" Brand Data Fetching" />;
  }
  return (
    <Page>
      <div className="w-full p-0 md:p-0">
      <div className="block lg:hidden overflow-hidden ">
  <div className="sticky top-0 z-10 bg-blue-50 border-b border-gray-200 p-2 mb-2">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/stock')}
          className="h-6 w-6 p-0 mr-1"
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-800 truncate">
            Create Stock
          </h1>
          <p className="text-xs text-gray-600 truncate">
          Create a new stock 
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-blue-800">
              {barcodes.length} items
            </span>
          </div>
          <Badge
            variant={scanningActive ? "default" : "secondary"}
            className="text-xs h-4 mt-1"
          >
            {scanningActive ? (
              <div className="flex items-center">
                <div className="animate-pulse bg-white rounded-full h-1.5 w-1.5 mr-1"></div>
                Active
              </div>
            ) : (
              "Paused"
            )}
          </Badge>
        </div>
      </div>
    </div>

    <div className="bg-white p-1.5 rounded border border-gray-200 mt-1">
      <div className="flex items-center justify-between mb-1">
        <Label className="text-xs font-medium text-gray-700">
          Barcode Scanner
        </Label>
        <div className="flex space-x-1">
          <Button
            variant={scanningActive ? "outline" : "default"}
            size="sm"
            onClick={() => setScanningActive(!scanningActive)}
            className="h-6 px-1"
          >
            {scanningActive ? (
              <X className="h-3 w-3" />
            ) : (
              <Scan className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <Input
        ref={mobileBarcodeInputRef}
        placeholder="Scan or enter barcode..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const barcode = e.target.value.trim();
            if (barcode) {
              addBarcode(barcode);
              e.target.value = "";
            }
          }
        }}
        className="h-7 text-xs"
        disabled={!scanningActive}
      />

      <p className="text-[10px] text-muted-foreground mt-1 truncate">
        {scanningActive
          ? "Scan or type barcode and press Enter"
          : "Activate scanning to add barcodes"}
      </p>
    </div>
  </div>

  <div className="mb-1">
    <div className="flex justify-between items-center mb-2 px-2">
      <h3 className="text-sm font-medium text-blue-800">
        Barcodes
      </h3>
      {barcodes.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBarcodes([])}
          className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      )}
    </div>

    {
    
    barcodes.length > 0 ? (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {barcodes
        .slice()
        .reverse()
        .map((barcode, index) => (
          <div
            key={`${barcode}-${index}`}
            className={`relative bg-white p-1 rounded-lg border border-gray-200 shadow-sm transition-colors duration-200 ${
              highlightedItem === barcode
                ? "bg-blue-50 border-2 border-blue-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between  ">
       
              <span className="text-[10px] text-gray-400 w-4  text-right shrink-0">
                {barcodes.length - index}.
              </span>
    
              <span
                className="text-[11px] font-mono truncate  max-w-[70px]"
                title={barcode}
              >
                {barcode}
              </span>
    
            <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBarcode(barcode)}
                className=" absolute -top-1.5 right-0 h-3 w-3 text-white rounded-sm bg-red-400  shrink-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
    </div>
    
    ) : (
      <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-lg bg-gray-50 mx-2">
        <div className="bg-gray-100 p-2 rounded-full mb-2">
          <Scan className="h-4 w-4 text-gray-500" />
        </div>
        <p className="text-xs text-gray-500 mb-2">
          No barcodes added yet
        </p>
        <p className="text-xs text-gray-400 text-center px-4">
          Scan or type barcodes to add them to your stock
        </p>
      </div>
    )}
  </div>

  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between">
    <Button
      type="button"
      variant="outline"
      onClick={() => navigate('/stock')}
      className="border-gray-300 hover:bg-gray-100 text-xs h-9"
    >
      Back
    </Button>
    <Button
      variant="default"
      onClick={() => setShowScanner(true)}
      disabled={!scanningActive}
      className={`border-gray-300 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-xs h-9`}
    >
      <ScanQrCode className="h-3 w-3" />
    </Button>

    <Button
  onClick={() => {
    if (barcodes.length === 0) {
      toast({
        title: "No Barcodes",
        description: "Please add at least one barcode to the stock",
        variant: "destructive",
      });
      return;
    }
    setShowFormDrawer(true);
  }}
  disabled={barcodes.length === 0}
  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} disabled:bg-gray-400 text-xs h-9`}
>
  Next
</Button>
  </div>
</div>
      <div className="hidden lg:block">
      <Card className="shadow-sm">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <div className="flex items-center">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/stock')}
                className="mr-2 h-7"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button> */}
              <div>
                <CardTitle className="text-base">Create Stock</CardTitle>
                <CardDescription>
                  Create a new stock by filling out the form below
                </CardDescription>
              </div>
            
            </div>
          </CardHeader>

          <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)]">
           
            <div className="lg:w-1/3 border-r p-3 bg-blue-50 flex flex-col">
              <div className="space-y-4 flex-grow">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_brand">Brand <span className="text-red-700">*</span></Label>
                    <Select
  onValueChange={(value) =>
    form.setValue("stock_brand", value, { shouldValidate: true })
  }
  defaultValue={form.getValues("stock_brand")}
  value={form.getValues("stock_brand")}
>
  <SelectTrigger className="bg-white">
    <SelectValue placeholder="Select brand" />
  </SelectTrigger>
  <SelectContent>
    {brandData?.brand?.map((brand) => (
      <SelectItem
        key={brand.fabric_brand_brands}
        value={String(brand.fabric_brand_brands)}
      >
        {brand.fabric_brand_brands}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                    {form.formState.errors.stock_brand && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.stock_brand.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_date">Date</Label>
                    <Input
                      id="stock_date"
                      type="date"
                      className="bg-white"
                      {...form.register("stock_date")}
                    />
                    {form.formState.errors.stock_date && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.stock_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_remarks">Remarks</Label>
                    <Textarea
                      id="stock_remarks"
                      rows={3}
                      className="bg-white"
                      placeholder="Any special instructions"
                      {...form.register("stock_remarks")}
                    />
                  </div>
                </form>

                <div className="pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-medium">Barcode Scanner</h3>
                    <div className="flex items-center gap-1">
                      <Badge variant={scanningActive ? "default" : "secondary"} className="text-xs h-5">
                        {scanningActive ? (
                          <div className="flex items-center">
                            <div className="animate-pulse bg-white rounded-full h-1.5 w-1.5 mr-1"></div>
                            Active
                          </div>
                        ) : (
                          "Paused"
                        )}
                      </Badge>

                      <Button
                        variant={scanningActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => setScanningActive(!scanningActive)}
                        className={`h-5 px-2 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                      >
                        {scanningActive ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <Scan className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-red-100/50 p-2 rounded-md">
                    <Label className="text-xs font-medium">Barcode Scanner</Label>
                      
                    <div className="flex gap-1 mt-1">
                      <Input
                        ref={barcodeInputRef}
                        placeholder="Scan or enter barcode..."
                        onKeyDown={handleBarcodeScan}
                        className="flex-1 h-7 text-xs"
                        disabled={!scanningActive}
                      />
                      <Button
                        onClick={() => {
                          if (barcodeInputRef.current) {
                            barcodeInputRef.current.focus();
                          }
                        }}
                        disabled={!scanningActive}
                        className={`h-7 px-2 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                      >
                        <Scan className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {scanningActive
                        ? "Scan barcode or type and press Enter"
                        : "Activate scanning to add barcodes"}
                    </p>
                  </div>
                </div>
              </div>

             
              <Card className="mt-3">
                <CardHeader className="py-2 px-3 bg-blue-100">
                  <CardTitle className="text-xs">Stock Summary</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Total Barcodes</span>
                      <span className="text-xs font-medium">{totalBarcodes}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="py-2 px-3">
                  <Button
                    onClick={handleSubmitStock}
                    disabled={barcodes.length === 0 || submitStockMutation.isPending}
                    className={`w-full h-7 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} disabled:bg-gray-400`}
                  >
                    {submitStockMutation.isPending ? "Submitting..." : "Submit Stock"}
                  </Button>
                
                </CardFooter>
              </Card>
            </div>

         
            <div className="lg:w-2/3 p-3 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <CardTitle className="text-base">Barcodes</CardTitle>
                {barcodes.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBarcodes([])}
                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {barcodes.length > 0 ? (
                <div className="flex-grow overflow-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {barcodes.slice()
        .reverse().map((barcode, index) => (
                      <div
                        key={index}
                        className={`bg-white p-2 rounded-md border border-gray-200 transition-colors duration-200 flex items-center justify-between ${
                          highlightedItem === barcode ? 'bg-blue-100 border-2 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-xs text-gray-500 mr-2 w-5 text-right shrink-0">
                          {barcodes.length - index}.
                          </span>
                          <span className="text-xs font-mono truncate" title={barcode}>
                            {barcode}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBarcode(barcode)}
                          className="h-5 w-5 hover:bg-red-100 text-red-500 ml-2 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border border-dashed rounded-lg bg-gray-50 p-4">
                  <div className="bg-gray-100 p-2 rounded-full mb-2">
                    <Scan className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mb-2 text-center">No barcodes added yet</p>
                  <p className="text-xs text-gray-400 text-center">
                    Scan or type barcodes to add them to your stock
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
       

    
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle>Scan Barcode</DialogTitle>
              <DialogDescription>
                Point your camera at a barcode to scan
              </DialogDescription>
            </DialogHeader>
            <div className="h-64 relative">
              <Scanner
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    const result = detectedCodes[0].rawValue;
                    setTimeout(() => {
                      handleBarcodeScanMobile(result);
                    }, 100);
                  }
                }}
                onError={(error) => {
                  console.log(error?.message);
                  toast({
                    title: "Scan Error",
                    description: error?.message || "Failed to scan barcode",
                    variant: "destructive",
                  });
                }}
                formats={[
                  "qr_code",
                  "code_128",
                  "code_39",
                  "code_93",
                  "codabar",
                  "ean_13",
                  "ean_8",
                  "upc_a",
                  "upc_e",
                  "itf",
                ]}
                constraints={{
                  facingMode: "environment",
                  aspectRatio: 1,
                }}
                styles={{
                  container: {
                    borderRadius: '8px',
                    overflow: 'hidden'
                  },
                  video: {
                    objectFit: 'cover'
                  }
                }}
              />
            </div>
            <DialogFooter className="px-4 pb-4">
              <Button variant="secondary" onClick={() => setShowScanner(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Drawer open={showFormDrawer} onOpenChange={setShowFormDrawer}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="text-left">
        <DrawerTitle>Stock Details</DrawerTitle>
        <DrawerDescription>
          Complete the stock information before submitting
        </DrawerDescription>
      </DrawerHeader>
      
      <div className="px-4 overflow-y-auto">
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="text-xs font-medium text-center">
         Total   {barcodes.length} barcode(s) scanned
          </p>
        </div>
        
        <form className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="mobile_stock_brand">Brand <span className="text-red-700">*</span></Label>
            <Select
    onValueChange={(value) =>
      form.setValue("stock_brand", value, { shouldValidate: true })
    }
    defaultValue={form.getValues("stock_brand")}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select brand" />
    </SelectTrigger>
    <SelectContent>
      {brandData?.brand?.map((brand) => (
        <SelectItem
          key={brand.fabric_brand_brands}
          value={String(brand.fabric_brand_brands)}
        >
          {brand.fabric_brand_brands}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
            
            {form.formState.errors.stock_brand && (
              <p className="text-sm text-destructive">
                {form.formState.errors.stock_brand.message}
              </p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="mobile_stock_date">Date</Label>
            <Input
              id="mobile_stock_date"
              type="date"
              {...form.register("stock_date")}
            />
            {form.formState.errors.stock_date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.stock_date.message}
              </p>
            )}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="mobile_stock_remarks">Remarks</Label>
            <Textarea
              id="mobile_stock_remarks"
              rows={3}
              placeholder="Any special instructions"
              {...form.register("stock_remarks")}
            />
          </div>
        </form>
      </div>
      
      <DrawerFooter className="pt-2">
        <Button
          onClick={handleFinalSubmit}
          disabled={!form.formState.isValid || barcodes.length === 0 || submitStockMutation.isPending}
          className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        >
          {submitStockMutation.isPending ? "Submitting..." : "Submit Stock"}
        </Button>
        
        <Button variant="outline" onClick={() => setShowFormDrawer(false)}>
          Cancel
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
      </div>
    </Page>
  );
};

export default CreateStock;