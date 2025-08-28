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

  const addBarcode = (barcode) => {
    if (!barcodes.includes(barcode)) {
      setBarcodes([...barcodes, barcode]);
      setHighlightedItem(barcode);
      setTimeout(() => {
        setHighlightedItem(null);
      }, 2000);
      
      toast({
        title: "Barcode Added",
        description: `Added barcode: ${barcode}`,
      });
    } else {
      toast({
        title: "Duplicate Barcode",
        description: `Barcode ${barcode} already exists`,
        variant: "destructive",
      });
    }
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

//   const submitStockMutation = useMutation({
//     mutationFn: async (stockData) => {
//       const response = await fetch(`${BASE_URL}/api/create-stock`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(stockData),
//       });
//       if (!response.ok) throw new Error("Failed to create stock");
//       return response.json();
//     },
//     onSuccess: (data) => {
//       toast({
//         title: "Success",
//         description: data.msg || 'Stock created successfully',
//         variant: "default",
//       });
//       navigate(`/stock/view-stock/${data.latest_id}`); 
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to create stock",
//         variant: "destructive",
//       });
//     },
//   });

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
      stock_data: barcodes.join(","),
    };

    try {
    //   submitStockMutation.mutate(stockData);
    console.log("stock data",stockData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  const totalBarcodes = barcodes.length;

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
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
              <Button
                                          variant="default"
                                          onClick={() => setShowScanner(true)}
                                          disabled={!scanningActive}
                                          className={`border-gray-300 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-xs h-9`}
                                        >
                                          <ScanQrCode className="h-3 w-3" />
                                        </Button>
            </div>
          </CardHeader>

          <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)]">
           
            <div className="lg:w-1/3 border-r p-3 bg-blue-50 flex flex-col">
              <div className="space-y-4 flex-grow">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_brand">Brand <span className="text-red-700">*</span></Label>
                    <Input
                      id="stock_brand"
                      placeholder="Enter brand name"
                      {...form.register("stock_brand")}
                    />
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
                  {/* <Button
                    onClick={handleSubmitStock}
                    disabled={barcodes.length === 0 || submitStockMutation.isPending}
                    className={`w-full h-7 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} disabled:bg-gray-400`}
                  >
                    {submitStockMutation.isPending ? "Submitting..." : "Submit Stock"}
                  </Button> */}
                  <Button
                    onClick={handleSubmitStock}
                    disabled={barcodes.length === 0 }
                    className={`w-full h-7 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} disabled:bg-gray-400`}
                  >
             Sumbit Stock
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
                    {barcodes.map((barcode, index) => (
                      <div
                        key={index}
                        className={`bg-white p-2 rounded-md border border-gray-200 transition-colors duration-200 flex items-center justify-between ${
                          highlightedItem === barcode ? 'bg-blue-100 border-2 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-xs text-gray-500 mr-2 w-5 text-right shrink-0">
                            {index + 1}.
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
      </div>
    </Page>
  );
};

export default CreateStock;