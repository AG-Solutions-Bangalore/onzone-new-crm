import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Trash2, ChevronLeft } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
  const inputRefs = useRef([]);
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

  const [users, setUsers] = useState([{ work_order_sa_sub_barcode: "" }]);

 
 const { data: retailerData ,isFetching } = useFetchRetailer();


  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/create-work-order-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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

    if (name === "work_order_sa_pcs") {
      const boxCount = parseInt(value) || 0;
      if (users.length > boxCount) {
        setUsers(users.slice(0, boxCount));
      }
    }
  };

  const onChange = (e, index) => {
    const newUsers = [...users];
    newUsers[index].work_order_sa_sub_barcode = e.target.value.toUpperCase();
    setUsers(newUsers);
  };

  const addItem = (e) => {
    e.preventDefault();
    const boxCount = parseInt(workorder.work_order_sa_pcs) || 0;
    if (users.length < boxCount) {
      const newUsers = [...users, { work_order_sa_sub_barcode: "" }];
      setUsers(newUsers);
      
     
      const newIndex = newUsers.length - 1;
      if (inputRefs.current[newIndex]) {
        inputRefs.current[newIndex].focus();
      }
    }
  };

  const removeUser = (index, e) => {
    e.preventDefault(); 
    const newUsers = users.filter((_, i) => i !== index);
    setUsers(newUsers);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...workorder,
      work_order_sa_year: dateyear,
      work_order_sa_count: users.length,
      workorder_sub_sa_data: users,
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

      submitMutation.mutate(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during validation",
      });
    }
  };

  const CheckBarcode = async (e, index) => {
    const barcodeId = e.target.value;
    if (barcodeId.length === 6) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${BASE_URL}/api/fetch-work-order-receive-check/${barcodeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Barcode validation failed");
        const data = await response.json();

        if (data?.code === 200) {
          toast({
            title: "Success",
            description: "Barcode found",
            variant: "default",
          });
          
          if (users.length < parseInt(workorder.work_order_sa_pcs)) {
            const newUsers = [...users, { work_order_sa_sub_barcode: "" }];
            setUsers(newUsers);
            
            setTimeout(() => {
              const nextIndex = index + 1;
              if (inputRefs.current[nextIndex]) {
                inputRefs.current[nextIndex].focus();
              }
            }, 0);
          }
        } else {
          toast({
            title: "Error",
            description: "Barcode not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error validating barcode",
          variant: "destructive",
        });
      }
    }
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
              <div className="space-y-2">
                <Label>T Code Entries (Total: {users.length})</Label>

                {/* <ScrollArea className="h-64 rounded-md border p-4"> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {users.map((user, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <Label htmlFor={`barcode-${index}`}>
                            T Code {index + 1}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`barcode-${index}`}
                              ref={(el) => (inputRefs.current[index] = el)}
                              name={`work_order_sa_sub_barcode_${index}`}
                              value={user.work_order_sa_sub_barcode}
                              onChange={(e) => {
                                onChange(e, index);
                                CheckBarcode(e, index);
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => removeUser(index, e)}
                              disabled={users.length <= 1}
                              type="button" 
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                {/* </ScrollArea> */}

                <Button
                  variant="outline"
                  onClick={addItem}
                  disabled={
                    !workorder.work_order_sa_pcs ||
                    users.length >= (parseInt(workorder.work_order_sa_pcs) || 0)
                  }
                >
                  + Add T Code
                </Button>
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
      <Toaster />
    </Page>
  );
};

export default CreateSales;