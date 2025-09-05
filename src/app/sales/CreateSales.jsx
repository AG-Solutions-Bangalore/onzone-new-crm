import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Trash2, ChevronLeft, Plus, Minus, Loader2 } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import Page from "../dashboard/page";
import { getTodayDate } from "@/utils/currentDate";
import dateyear from "@/utils/DateYear";
import { useFetchRetailer } from "@/hooks/useApi";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";

// Zod schema for validation
const orderSchema = z.object({
  work_order_sa_year: z.string(),
  work_order_sa_date: z.string().min(1, "Date is required"),
  work_order_sa_retailer_id: z.string().min(1, "Retailer is required"),
  work_order_sa_dc_no: z.string().min(1, "DC No is required"),
  work_order_sa_dc_date: z.string().min(1, "DC Date is required"),
  work_order_sa_box: z.string().optional(),
  work_order_sa_pcs: z.string().min(1, "Pieces count is required"),
  work_order_sa_fabric_sale: z.string().min(1, "Fabric sale is required"),
  work_order_sa_count: z.number().min(1, "Count is required"),
  work_order_sa_remarks: z.string().optional(),
});

const CreateSales = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { toast } = useToast();
  const [workorder, setWorkorder] = useState({
    work_order_sa_year: dateyear || "",
    work_order_sa_date: getTodayDate() || "",
    work_order_sa_retailer_id: "",
    work_order_sa_dc_no: "",
    work_order_sa_dc_date: getTodayDate() || "",
    work_order_sa_box: "",
    work_order_sa_pcs: "",
    work_order_sa_fabric_sale: "",
    work_order_sa_count: 1,
    work_order_sa_remarks: "",
  });

  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duplicateBarcodes, setDuplicateBarcodes] = useState({});
  const [currentInputValue, setCurrentInputValue] = useState("");

  const { data: retailerData, isFetching } = useFetchRetailer();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      
      const submissionData = {
        ...data,
        workorder_sub_sa_data: data.barcodes.map(barcode => ({
          work_order_sa_sub_barcode: barcode
        }))
      };
      
      const response = await fetch(`${BASE_URL}/api/create-work-order-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });
      if (!response.ok) throw new Error("Failed to create sales order");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sales order created successfully",
        variant: "default",
      });
      navigate("/sales");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    },
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setWorkorder({
      ...workorder,
      [name]: value,
    });

    // Clear barcodes if pcs count is reduced below current barcode count
    if (name === "work_order_sa_pcs") {
      const pcsCount = parseInt(value) || 0;
      if (barcodes.length > pcsCount) {
        setBarcodes(barcodes.slice(0, pcsCount));
      }
    }
  };

  const calculateDuplicates = (barcodes) => {
    const duplicates = {};
    const seen = {};
    
    barcodes.forEach(barcode => {
      if (seen[barcode]) {
        duplicates[barcode] = (duplicates[barcode] || 1) + 1;
      } else {
        seen[barcode] = true;
      }
    });
    
    return duplicates;
  };
  
  useEffect(() => {
    setDuplicateBarcodes(calculateDuplicates(barcodes));
  }, [barcodes]);

  const handleBarcodeInputChange = (e) => {
    setCurrentInputValue(e.target.value);
  };

  const addBarcode = async () => {
    if (!currentInputValue.trim()) return;
    
    const maxPcs = parseInt(workorder.work_order_sa_pcs || 0, 10);
    if (barcodes.length >= maxPcs) {
      toast({
        title: "Limit reached",
        description: `You cannot enter more than ${maxPcs} T-codes.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate barcode format (6 digits)
    const barcode = currentInputValue.trim();
    if (barcode.length !== 6) {
      toast({
        title: "Invalid format",
        description: "Barcode must be exactly 6 digits",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if barcode exists in received orders
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/fetch-work-order-receive-check/${barcode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Barcode validation failed");
      const data = await response.json();

      if (data?.code === 200) {
        // Add the barcode
        setBarcodes([...barcodes, barcode]);
        setCurrentInputValue("");
        
        toast({
          title: "Success",
          description: "Barcode added successfully",
          variant: "default",
        });
        
        // Keep focus on input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        toast({
          title: "Error",
          description: data?.msg || 'Barcode not found in received orders',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error validating barcode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBarcode();
    }
  };

  const removeBarcode = useCallback((index) => {
    const newBarcodes = [...barcodes];
    newBarcodes.splice(index, 1);
    setBarcodes(newBarcodes);
  }, [barcodes]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...workorder,
      work_order_sa_year: dateyear,
      work_order_sa_count: barcodes.length,
      barcodes: barcodes,
    };

    try {
      const validation = orderSchema.safeParse(data);
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Please fix the following:",
          description: (
            <div className="grid gap-1">
              {validation.error.errors.map((error, i) => {
                const field = error.path[0].replace(/_/g, ' ');
                const label = field.charAt(0).toUpperCase() + field.slice(1);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex items-center justify-center h-4 w-4 mt-0.5 flex-shrink-0 rounded-full bg-red-100 text-red-700 text-xs">
                      {i + 1}
                    </div>
                    <p className="text-xs">
                      <span className="font-medium">{label}:</span> {error.message}
                    </p>
                  </div>
                );
              })}
            </div>
          ),
        });
        return;
      }

      const expectedPcsCount = parseInt(workorder.work_order_sa_pcs, 10) || 0;
      if (barcodes.length !== expectedPcsCount) {
        toast({
          variant: "destructive",
          title: "Pieces Count Mismatch",
          description: `You specified ${expectedPcsCount} pieces, but ${barcodes.length} barcodes are entered.`,
        });
        return;
      }

      submitMutation.mutate(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during validation",
      });
    }
  };

  const isInputDisabled = () => {
    const maxPcs = parseInt(workorder.work_order_sa_pcs || 0, 10);
    return barcodes.length >= maxPcs;
  };

  if (isFetching) {
    return <LoaderComponent name=" Data" />;
  }

  return (
    <Page>
      <div className="max-w-full mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Create Work Order Sales
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/sales" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <form className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Retailer */}
                <div className="space-y-1">
                  <Label htmlFor="retailer">
                    Retailer <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="work_order_sa_retailer_id"
                    value={workorder.work_order_sa_retailer_id}
                    onValueChange={(value) => {
                      setWorkorder({
                        ...workorder,
                        work_order_sa_retailer_id: value,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select retailer" />
                    </SelectTrigger>
                    <SelectContent>
                      {retailerData?.customer?.map((retailer) => (
                        <SelectItem key={retailer.id} value={retailer.id.toString()}>
                          {retailer.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sales Date */}
                <div className="space-y-1">
                  <Label htmlFor="salesDate">
                    Sales Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="salesDate"
                    name="work_order_sa_date"
                    value={workorder.work_order_sa_date}
                    onChange={onInputChange}
                  />
                </div>

                {/* Total No of Pcs */}
                <div className="space-y-1">
                  <Label htmlFor="pcsCount">
                    Total No of Pcs <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pcsCount"
                    name="work_order_sa_pcs"
                    value={workorder.work_order_sa_pcs}
                    onChange={onInputChange}
                  />
                </div>

                {/* DC No */}
                <div className="space-y-1">
                  <Label htmlFor="dcNo">
                    DC No <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dcNo"
                    name="work_order_sa_dc_no"
                    value={workorder.work_order_sa_dc_no}
                    onChange={onInputChange}
                  />
                </div>

                {/* DC Date */}
                <div className="space-y-1">
                  <Label htmlFor="dcDate">
                    DC Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="dcDate"
                    name="work_order_sa_dc_date"
                    value={workorder.work_order_sa_dc_date}
                    onChange={onInputChange}
                  />
                </div>

                {/* Fabric Sales */}
                <div className="space-y-1">
                  <Label htmlFor="fabricSale">
                    Fabric Sales <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fabricSale"
                    name="work_order_sa_fabric_sale"
                    value={workorder.work_order_sa_fabric_sale}
                    onChange={onInputChange}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1 col-span-full">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    name="work_order_sa_remarks"
                    value={workorder.work_order_sa_remarks}
                    onChange={onInputChange}
                  />
                </div>
              </div>

              <hr className="my-2" />

              {/* Barcode entries */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  T Code Entries (Total: {barcodes.length} / {workorder.work_order_sa_pcs || 0})
                </Label>
                
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    ref={inputRef}
                    value={currentInputValue}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/\s/g, '');
                      handleBarcodeInputChange({ target: { value } });
                    }}
                    onKeyPress={handleKeyPress}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/\s/g, '');
                      e.preventDefault();
                      document.execCommand('insertText', false, pastedText);
                      handleBarcodeInputChange({ target: { value: pastedText } });
                    }}
                    placeholder="Enter 6-digit barcode"
                    className="h-8 text-xs p-1 uppercase"
                    disabled={isInputDisabled()}
                    maxLength={6}
                  />

                  <Button
                    type="button"
                    onClick={addBarcode}
                    disabled={isInputDisabled() || !currentInputValue.trim()}
                    size="sm"
                    className="h-8"
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Add
                  </Button>
                </div>

                <div className="border rounded p-2 bg-gray-50">
                  {barcodes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                    {barcodes.reduce((uniqueBarcodes, barcode, index) => {
                      // Only show the first occurrence of each barcode
                      const firstIndex = barcodes.findIndex(b => b === barcode);
                      if (firstIndex === index) {
                        const count = barcodes.filter(b => b === barcode).length;
                        const isDuplicate = count > 1;
                        
                        uniqueBarcodes.push(
                          <div
                            key={`${index}-${barcode}`}
                            className={`bg-white p-1 rounded border border-gray-200 text-xs flex items-center justify-between ${
                              isDuplicate ? 'bg-amber-100 border-amber-300' : ''
                            }`}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <span className="text-gray-500 mr-1 w-4 text-right shrink-0">
                                {index + 1}.
                              </span>
                              <span className="font-mono truncate" title={barcode}>
                                {barcode}
                              </span>
                            </div>
                  
                            <div className="flex items-center gap-0.5">
                              {isDuplicate && (
                                <span className="text-xs text-amber-600">{count}</span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => removeBarcode(index)}
                                className="h-5 w-5 hover:bg-red-100 text-red-500 shrink-0 p-0.5"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      return uniqueBarcodes;
                    }, [])}
                  </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No barcodes added yet</p>
                  )}
                  
                  {Object.keys(duplicateBarcodes).length > 0 && (
                    <div className="mt-2 text-amber-600 text-xs">
                      Duplicate barcodes detected: {Object.entries(duplicateBarcodes)
                        .map(([barcode, count]) => `${barcode} (${count} times)`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/sales">Cancel</Link>
                </Button>
                <Button 
                  type="button"
                  onClick={onSubmit} 
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default CreateSales;