import React, { useState, useRef, useEffect } from 'react';
import Page from '../dashboard/page';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { getTodayDate } from '@/utils/currentDate';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Trash2, Barcode, Keyboard, ArrowLeft, Scan, X, ScanQrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  order_form_retailer: z.string().optional(),
  order_form_date: z.string().min(1, "Date is required"),
  order_form_remark: z.string().optional(),
  order_form_ref: z.string().optional(),
});

const OrderForm = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState([]);
  const [scanningActive, setScanningActive] = useState(true);
 const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const barcodeInputRef = useRef(null);
  const mobileBarcodeInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const navigate = useNavigate()
  const [showScanner, setShowScanner] = useState(false);
  useEffect(() => {
    if (showResults && scanningActive && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [showResults, scanningActive]);
  useEffect(() => {
    if (barcodeModalOpen && quantityInputRef.current) {
      setTimeout(() => {
        quantityInputRef.current.focus();
        // const length = quantityInputRef.current.value.length;
        // quantityInputRef.current.setSelectionRange(length, length);
      }, 100);
    }
  }, [barcodeModalOpen]);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_form_retailer: "",
      order_form_date: getTodayDate(),
      order_form_remark: "",
      order_form_ref: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
        toast({
          title: "Same search parameters",
          description: "You're already viewing results for these search criteria",
        });
        return;
      }
      setSearchParams(data);
      
      setTimeout(() => {
        setShowResults(true);
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), barcode: '', quantity: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // const handleBarcodeScan = (e) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
      
  //     const barcode = e.target.value.trim();
  //     if (barcode) {
      
  //       const existingItemIndex = items.findIndex(item => item.barcode === barcode);
        
  //       if (existingItemIndex >= 0) {
        
  //         const updatedItems = [...items];
  //         updatedItems[existingItemIndex].quantity += 1;
  //         setItems(updatedItems);
          
  //         toast({
  //           title: "Quantity Updated",
  //           description: `Increased quantity for barcode: ${barcode}`,
  //         });
  //       } else {
     
  //         setItems([...items, { id: Date.now(), barcode, quantity: 1 }]);
          
  //         toast({
  //           title: "Item Added",
  //           description: `Added new item with barcode: ${barcode}`,
  //         });
  //       }
        
   
  //       e.target.value = '';
  //     }
  //   }
  // };

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const barcode = e.target.value.trim();
      if (barcode) {
        setCurrentBarcode(barcode);
        
    
        const existingItem = items.find(item => item.barcode === barcode);
        
        if (existingItem) {
    
          setQuantity(existingItem.quantity + 1);
        } else {
          setQuantity(1);
        }
        
  
        setBarcodeModalOpen(true);
        
  
        e.target.value = '';
      }
    }
  };

  const handleQuantitySubmit = () => {
    if (!currentBarcode || quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid barcode and quantity",
        variant: "destructive",
      });
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.barcode === currentBarcode);
    
    if (existingItemIndex >= 0) {
   
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity = quantity;
      setItems(updatedItems);
      
      toast({
        title: "Quantity Updated",
        description: `Updated quantity for barcode: ${currentBarcode}`,
      });
    } else {
      // Add new item
      setItems([...items, { id: Date.now(), barcode: currentBarcode, quantity }]);
      
      toast({
        title: "Item Added",
        description: `Added new item with barcode: ${currentBarcode}`,
      });
    }
    
    
    setBarcodeModalOpen(false);
    setCurrentBarcode('');
    setQuantity(1);
    
    
    if (barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current.focus();
      }, 100);
    }
  };
  const handleBarcodeScanMobile = (result) => {
    if (result) {
      setCurrentBarcode(result);
      
      const existingItem = items.find(item => item.barcode === result);
      
      if (existingItem) {
        setQuantity(existingItem.quantity + 1);
      } else {
        setQuantity(1);
      }
      
      setBarcodeModalOpen(true);
      setShowScanner(false);
    }
  };
const handleNumberClick = (num) => {
  if (quantity === '' || quantity === 0) {
    setQuantity(num);
  } else {
    const newValue = parseInt(quantity.toString() + num.toString());
    setQuantity(newValue);
  }
  

  // setTimeout(() => {
  //   if (quantityInputRef.current) {
  //     quantityInputRef.current.focus();
  //   }
  // }, 10);
};

const handleQuantityChange = (value) => {

  if (typeof value === 'string') {
    if (value === '') {
      setQuantity('');
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setQuantity(numValue);
    }
  } else {
   
    setQuantity(value);
  }
};

const handleBackspace = () => {
  if (quantity === '' || quantity === 0) {
    setQuantity('');
  } else {
    const currentStr = quantity.toString();
    if (currentStr.length === 1) {
      setQuantity('');
    } else {
      const newValue = parseInt(currentStr.slice(0, -1));
      setQuantity(newValue);
    }
  }
  

  // setTimeout(() => {
  //   if (quantityInputRef.current) {
  //     quantityInputRef.current.focus();
  //   }
  // }, 10);
};

const handleClear = () => {
  setQuantity('');
 
  // setTimeout(() => {
  //   if (quantityInputRef.current) {
  //     quantityInputRef.current.focus();
  //   }
  // }, 10);
};

const incrementQuantity = () => {
  if (quantity === '' || quantity === 0) {
    setQuantity(1);
  } else {
    setQuantity(prev => parseInt(prev) + 1);
  }
};

const decrementQuantity = () => {
  if (quantity > 1) {
    setQuantity(prev => parseInt(prev) - 1);
  } else {
    setQuantity(1);
  }
};

  const handleSubmitOrder = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }
    
  
    const orderData = {
      ...form.getValues(),
      items: items,
    };
    

    navigate('/order-form-view', { state: { orderData } });
    
    toast({
      title: "Order Submitted",
      description: "Your order has been successfully submitted",
    });
  };
  const handleBackToForm = () => {
    setShowResults(false);
    setTimeout(() => {
      setSearchParams(null);
      setItems([]);
      setScanningActive(false);
    }, 500);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItems = items.length;

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className="lg:hidden">
         
          {!showResults ? (
            <div className="bg-blue-50 border border-gray-200 rounded-lg p-4 mb-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-gray-800">Order Form</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Create a new order by filling out the form below
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="order_form_retailer" className="text-xs font-medium">Retailer</Label>
                  <Input
                    id="order_form_retailer"
                    placeholder="Enter retailer name"
                    {...form.register("order_form_retailer")}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_form_date" className="text-xs font-medium">Date</Label>
                  <Input
                    id="order_form_date"
                    type="date"
                    {...form.register("order_form_date")}
                    className="h-9 text-sm"
                  />
                  {form.formState.errors.order_form_date && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.order_form_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_form_ref" className="text-xs font-medium">Reference Number</Label>
                  <Input
                    id="order_form_ref"
                    placeholder="Enter reference number"
                    {...form.register("order_form_ref")}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_form_remark" className="text-xs font-medium">Remarks</Label>
                  <Input
                    id="order_form_remark"
                    placeholder="Any special instructions"
                    {...form.register("order_form_remark")}
                    className="h-9 text-sm"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 h-9 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Order...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Generate Order
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-3 mb-3">
                <div className="flex items-center mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackToForm}
                    className="mr-2 h-7 w-7 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-base font-bold text-gray-800">Order Details</h1>
                    <p className="text-xs text-gray-600">
                      {searchParams.order_form_date} • {searchParams.order_form_ref || 'No reference'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-2">
                    <p className="text-xs text-blue-800 font-medium">Total sets</p>
                    <p className="text-sm font-bold">{uniqueItems}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-md p-2">
                    <p className="text-xs text-green-800 font-medium">Total Items</p>
                    <p className="text-sm font-bold">{totalItems}</p>
                  </div>
                
                </div>
              </div>
              
              <div className="mb-14">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-blue-800">SKU Scanning</h3>
                  <Badge variant={scanningActive ? "default" : "secondary"} className="text-xs">
                    {scanningActive ? (
                      <div className="flex items-center">
                        <div className="animate-pulse bg-white rounded-full h-2 w-2 mr-1"></div>
                        Active
                      </div>
                    ) : 'Paused'}
                  </Badge>
                </div>
                
                <div className="bg-muted p-3 rounded-lg mb-4">
                  <Label className="text-xs font-medium">SKU Scanner</Label>
                  <div className="flex gap-2 mt-2">
                  <Input
  ref={mobileBarcodeInputRef}
  placeholder="Scan sku or enter manually..."
  onKeyDown={handleBarcodeScanMobile}
  className="flex-1 h-8 text-sm"
  disabled={!scanningActive}
/>
{/* for open the scanner  */}
<Button
 onClick={() => setShowScanner(true)}
 disabled={!scanningActive}
className="h-8 px-2"
>

  <ScanQrCode className='h-3 w-3 text-yellow-700'/>
</Button>
                 <Button 
  onClick={() => {
    if (mobileBarcodeInputRef.current) {
      mobileBarcodeInputRef.current.focus();
    }
  }}
  disabled={!scanningActive}
  className="h-8 px-2"
>
  <Scan className="h-3 w-3 text-blue-500" />
</Button>
                    <Button
                      variant={scanningActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => setScanningActive(!scanningActive)}
                      className="h-8 px-2"
                    >
                      {scanningActive ? <X className='text-red-500' size={14} /> : <Scan className='text-red-500' size={14} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {scanningActive 
                      ? "Scan sku or type and press Enter to add items" 
                      : "Click Scan to activate sku scanning"}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-blue-800">Order Items</h3>
                  <Button onClick={addItem} size="sm" className="h-7 text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                
                {items.length > 0 ? (
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={item.id} className="bg-white p-2 rounded-md border border-gray-200">
                        <div className="grid grid-cols-12 gap-1 items-center">
                          <div className="col-span-1 text-xs text-gray-500 text-center">
                            {index + 1}
                          </div>
                          <div className="col-span-7">
                            <Input
                              value={item.barcode}
                              onChange={(e) => updateItem(item.id, 'barcode', e.target.value)}
                              placeholder="SKU"
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="tel"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 hover:bg-red-100 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-lg bg-gray-50">
                    <div className="bg-gray-100 p-2 rounded-full mb-2">
                      <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">No items added yet</p>
                    <Button onClick={addItem} size="sm" className="h-7 text-xs">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>
              
              
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToForm}
                  className="border-gray-300 hover:bg-gray-100 text-xs h-9"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={items.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9"
                >
                  Submit Order
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
   
          <Card className="shadow-sm">
            {!showResults ? (
              <>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle>Order Form</CardTitle>
                  <CardDescription>
                    Create a new order by filling out the form below
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="order_form_retailer">Retailer</Label>
                        <Input
                          id="order_form_retailer"
                          placeholder="Enter retailer name"
                          {...form.register("order_form_retailer")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="order_form_date">Date</Label>
                        <Input
                          id="order_form_date"
                          type="date"
                          {...form.register("order_form_date")}
                        />
                        {form.formState.errors.order_form_date && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.order_form_date.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="order_form_ref">Reference Number</Label>
                        <Input
                          id="order_form_ref"
                          placeholder="Enter reference number"
                          {...form.register("order_form_ref")}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="order_form_remark">Remarks</Label>
                        <Input
                          id="order_form_remark"
                          placeholder="Any special instructions"
                          {...form.register("order_form_remark")}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Order...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Generate Order
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="overflow-hidden">
                <CardHeader className="pb-3 bg-blue-50 rounded-t-lg">
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBackToForm}
                      className="mr-3"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle>Order Details</CardTitle>
                      <CardDescription>
                        {searchParams.order_form_date} • {searchParams.order_form_ref || 'No reference'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <div className="flex flex-col lg:flex-row">
                
                  <div className="lg:w-1/3 border-r p-6 bg-blue-50">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Retailer</h3>
                        <p className="text-sm">{searchParams.order_form_retailer || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                        <p className="text-sm">{searchParams.order_form_date}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
                        <p className="text-sm">{searchParams.order_form_ref || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                        <p className="text-sm">{searchParams.order_form_remark || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <Card className="mt-6">
                      <CardHeader className="py-3 bg-blue-100">
                        <CardTitle className="text-sm">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Sets</span>
                            <span className="font-medium">{uniqueItems}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Items</span>
                            <span className="font-medium">{totalItems}</span>
                          </div>
                       
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={handleSubmitOrder} 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={items.length === 0}
                        >
                          Submit Order
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="lg:w-2/3 p-6 ">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <CardTitle>
                          {'SKU Scanning'}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={scanningActive ? "default" : "secondary"}>
                            {scanningActive ? (
                              <div className="flex items-center">
                                <div className="animate-pulse bg-white rounded-full h-2 w-2 mr-2"></div>
                                Scanning Active
                              </div>
                            ) : 'Scanning Paused'}
                          </Badge>
                          
                          <Button
                            variant={scanningActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => setScanningActive(!scanningActive)}
                            className="flex items-center gap-2"
                          >
                            {scanningActive ? <X size={16} /> : <Scan size={16} />}
                            {scanningActive ? 'Stop' : 'Scan'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <Label className="text-sm font-medium">SKU Scanner</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            ref={barcodeInputRef}
                            placeholder="Scan sku or enter manually..."
                            onKeyDown={handleBarcodeScan}
                            className="flex-1"
                            disabled={!scanningActive}
                          />
                          <Button 
                            onClick={() => {
                              if (barcodeInputRef.current) {
                                barcodeInputRef.current.focus();
                              }
                            }}
                            disabled={!scanningActive}
                          >
                            <Scan className="mr-2 h-4 w-4" />
                            Focus
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {scanningActive 
                            ? "Scan sku or type and press Enter to add items" 
                            : "Click Scan to activate sku scanning"}
                        </p>
                      </div>
                    
                      <Card>
                        <CardHeader className="py-3 bg-blue-100">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Order Items</CardTitle>
                            <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Item
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          {items.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-blue-50 hover:bg-blue-50">
                                  <TableHead className="w-12">#</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead className="w-32">Quantity</TableHead>
                                  <TableHead className="w-16"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {items.map((item, index) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                      <Input
                                        value={item.barcode}
                                        onChange={(e) => updateItem(item.id, 'barcode', e.target.value)}
                                        placeholder="Enter sku"
                                        className="w-full"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="tel"
                                        min="0"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                        className="w-full"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="hover:bg-red-100 text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg">
                              <div className="bg-muted p-3 rounded-full mb-3">
                                <Search className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground mb-4">No items added yet</p>
                              <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Item
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Dialog open={barcodeModalOpen} onOpenChange={setBarcodeModalOpen}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Enter Quantity</DialogTitle>
        <DialogDescription>
          Please specify the quantity for sku: <span className="font-semibold">{currentBarcode}</span>
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={decrementQuantity}
          className="h-12 w-12 text-xl"
          disabled={quantity <= 1}
        >
          -
        </Button>
        
        <div className="flex flex-col items-center">
        <Input
  ref={quantityInputRef}
  type="text"  
  value={quantity}
  onChange={(e) => handleQuantityChange(e.target.value)}
  className="w-24 h-12 text-center text-xl"
  readOnly={true}  
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit();
    }
   
  }}
/>
          <span className="text-xs text-muted-foreground mt-1">Quantity</span>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={incrementQuantity}
          className="h-12 w-12 text-xl"
        >
          +
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            variant="outline"
            onClick={() => handleNumberClick(num)}
            className="h-10"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => handleNumberClick(0)}
          className="h-10"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={handleBackspace}
          className="h-10"
        >
          ⌫
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="h-10"
        >
          Clear
        </Button>
      </div>
      
      <DialogFooter className="sm:justify-between">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => setBarcodeModalOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleQuantitySubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add to Order
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

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
            handleBarcodeScan(result);
          }
        }}
        onError={(error) => console.log(error?.message)}
        formats={['code_128', 'ean_13', 'upc_a', 'qr_code']}
      />
    </div>
    <DialogFooter className="px-4 pb-4">
      <Button 
        variant="secondary" 
        onClick={() => setShowScanner(false)}
      >
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </Page>
  );
};

export default OrderForm;