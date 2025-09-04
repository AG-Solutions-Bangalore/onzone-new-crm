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

import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import Page from "../dashboard/page";
import { getTodayDate } from "@/utils/currentDate";
import dateyear from "@/utils/DateYear";
import { useFetchFactory } from "@/hooks/useApi";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Textarea } from "@/components/ui/textarea";

// Zod schema for validation
const orderSchema = z.object({
  work_order_rc_year: z.string(),
  work_order_rc_date: z.string().min(1, "Date is required"),
  work_order_rc_factory_no: z.string().min(1, "Factory is required"),
  work_order_rc_id: z.number().min(1, "Work Order ID is required"),
  work_order_rc_dc_no: z.string().min(1, "DC No is required"),
  work_order_rc_dc_date: z.string().min(1, "DC Date is required"),
  work_order_rc_brand: z.string().min(1, "Brand is required"),
  work_order_rc_box: z.string().min(1, "Box count is required"),
  work_order_rc_pcs: z.string().min(1, "Pieces count is required"),
  work_order_rc_received_by: z.string().optional(),
  work_order_rc_fabric_received: z
    .string()
    .min(1, "Fabric received is required"),
  work_order_rc_fabric_count: z.string().optional(),
  work_order_rc_remarks: z.string().optional(),
});

const workReceiveOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const AddOrderReceived = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const { toast } = useToast();
  const [workorder, setWorkorder] = useState({
    work_order_rc_year: dateyear || "",
    work_order_rc_date: getTodayDate() || "",
    work_order_rc_factory_no: "",
    work_order_rc_id: "",
    work_order_no:"", // for ref
    work_order_rc_dc_no: "",
    work_order_rc_dc_date: getTodayDate() || "",
    work_order_rc_brand: "",
    work_order_rc_box: "",
    work_order_rc_pcs: "",
    work_order_rc_received_by: "",
    work_order_rc_fabric_received: "",
    work_order_rc_fabric_count: "",
    work_order_rc_remarks: "",
  });

  const [users, setUsers] = useState([
    { work_order_rc_sub_barcode: "", work_order_rc_sub_box: 1 },
  ]);
  const [duplicateBarcodes, setDuplicateBarcodes] = useState({});
  const { data: factoryData ,isFetching } = useFetchFactory();
 

 
  const { data: workOrders = [] } = useQuery({
    queryKey: ["workOrders", workorder.work_order_rc_factory_no],
    queryFn: async () => {
     
      if (!workorder.work_order_rc_factory_no) return [];
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/fetch-work-order/${workorder.work_order_rc_factory_no}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch work orders");
      const data = await response.json();
    
      return data.workorder || [];
    },
    enabled: !!workorder.work_order_rc_factory_no,
  });
 
  const { data: brandData } = useQuery({
    queryKey: ["brand", workorder.work_order_rc_id],
    queryFn: async () => {
      if (!workorder.work_order_rc_id) return { work_order_brand: "" };
      const token = localStorage.getItem("token");
      console.log("workorder",workorder?.work_order_rc_id)
     
   
      const response = await fetch(
        `${BASE_URL}/api/fetch-work-order-brand/${workorder.work_order_rc_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch brand");
      const data = await response.json();
      return data.workorderbrand || { work_order_brand: "" };
    },
    enabled: !!workorder.work_order_rc_id,
  });

 
  useEffect(() => {
    if (brandData?.work_order_brand) {
      setWorkorder((prev) => ({
        ...prev,
        work_order_rc_brand: brandData.work_order_brand,
      }));
    }
  }, [brandData]);

  
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/create-work-order-received`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order received successfully",
        variant: "default",
      });
      navigate("/order-received");
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

    if (name === "work_order_rc_box") {
      const boxCount = parseInt(value) || 0;
      if (users.length > boxCount) {
        setUsers(users.slice(0, boxCount));
      }
    }
  };

  const calculateDuplicates = (users) => {
    const allBarcodes = [];
    
    users.forEach(user => {
      if (user.work_order_rc_sub_barcode) {
        const codes = user.work_order_rc_sub_barcode.split(',')
          .map(code => code.trim())
          .filter(code => code.length === 6);
        allBarcodes.push(...codes);
      }
    });
    
    const duplicates = {};
    const seen = {};
    
    allBarcodes.forEach(barcode => {
      if (seen[barcode]) {
        duplicates[barcode] = (duplicates[barcode] || 1) + 1;
      } else {
        seen[barcode] = true;
      }
    });
    
    return duplicates;
  };
  useEffect(() => {
    setDuplicateBarcodes(calculateDuplicates(users));
  }, [users]);
  const handleBarcodeChange = (e, index) => {
    const maxPcs = parseInt(workorder.work_order_rc_pcs || 0, 10);
    const inputValue = e.target.value;
    
    
    const currentTotal = users.reduce((total, user) => {
      if (user.work_order_rc_sub_barcode) {
        const codes = user.work_order_rc_sub_barcode.split(',');
        return total + codes.filter(code => code.trim().length === 6).length;
      }
      return total;
    }, 0);
    

    const cleanedInput = inputValue.replace(/,/g, "");
    const newCodes = [];
    for (let i = 0; i < cleanedInput.length; i += 6) {
      newCodes.push(cleanedInput.substring(i, i + 6));
    }
    
    const wouldBeTotal = currentTotal - 
      (users[index].work_order_rc_sub_barcode ? 
        users[index].work_order_rc_sub_barcode.split(',').filter(code => code.trim().length === 6).length : 0) + 
      newCodes.filter(code => code.length === 6).length;
    

    if (wouldBeTotal > maxPcs) {
      toast({
        title: "Limit reached",
        description: `You cannot enter more than ${maxPcs} T-codes total.`,
        variant: "destructive",
      });
      return;
    }
    

    onChange(e, index);
    
    
    if (newCodes.length > 0 && newCodes[newCodes.length - 1].length === 6) {
      CheckBarcode(e, index);
    }
  };
  
  const onChange = (e, index) => {
    const inputValue = e.target.value;
    
    
    const cleanedInput = inputValue.replace(/,/g, "");
    
   
    let formattedInput = "";
    for (let i = 0; i < cleanedInput.length; i += 6) {
      if (i > 0) formattedInput += ",";
      formattedInput += cleanedInput.substring(i, i + 6);
    }
    
    const newUsers = [...users];
    newUsers[index].work_order_rc_sub_barcode = formattedInput;
    setUsers(newUsers);
  };
  
  const addItem = (e) => {
    e.preventDefault();
    const boxCount = parseInt(workorder.work_order_rc_box) || 0;
    if (users.length < boxCount) {
      const newUsers = [
        ...users,
        { work_order_rc_sub_barcode: "", work_order_rc_sub_box: users.length + 1 },
      ];
      setUsers(newUsers);
    }
  };
  
  const removeUser = (index) => {
    const newUsers = users.filter((_, i) => i !== index);
  
    const updatedUsers = newUsers.map((u, i) => ({
      ...u,
      work_order_rc_sub_box: i + 1,
    }));
    setUsers(updatedUsers);
  };
  
  // console.log("sumbit",workorder.work_order_rc_id)
  const onSubmit = async (e) => {
    e.preventDefault();
  
    
  
    const data = {
      ...workorder,
      work_order_rc_year: dateyear,
      work_order_rc_count: users.length,
      workorder_sub_rc_data: users,
      work_order_rc_id: workorder.work_order_no, 
      work_order_rc_brand: brandData?.work_order_brand || "",
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
    const inputValue = e.target.value;
    
   
    const cleanedInput = inputValue.replace(/,/g, "");
    
    let formattedInput = "";
    for (let i = 0; i < cleanedInput.length; i += 6) {
      if (i > 0) formattedInput += ",";
      formattedInput += cleanedInput.substring(i, i + 6);
    }
    
    const barcodes = formattedInput.split(",");
    const lastBarcode = barcodes[barcodes.length - 1];
  
    if (lastBarcode.length === 6) {
      const workId = workorder.work_order_no;
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${BASE_URL}/api/fetch-work-order-finish-check/${workId}/${lastBarcode}`,
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
          const newUsers = [...users];
          newUsers[index].work_order_rc_sub_barcode = formattedInput;
          setUsers(newUsers);
  
         
          const totalTCodes = users.reduce((total, user) => {
            if (user.work_order_rc_sub_barcode) {
              const codes = user.work_order_rc_sub_barcode.split(',');
              return total + codes.filter(code => code.trim().length === 6).length;
            }
            return total;
          }, 0);
          
          const nextIndex = index + 1;
          if (inputRefs.current[nextIndex] && totalTCodes < parseInt(workorder.work_order_rc_pcs || 0, 10)) {
            inputRefs.current[nextIndex].focus();
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
  
    const newUsers = [...users];
    newUsers[index].work_order_rc_sub_barcode = formattedInput;
    setUsers(newUsers);
  };
  
  const isInputDisabled = (index) => {
    const maxPcs = parseInt(workorder.work_order_rc_pcs || 0, 10);
    
   
    const totalTCodes = users.reduce((total, user) => {
      if (user.work_order_rc_sub_barcode) {
        const codes = user.work_order_rc_sub_barcode.split(',');
        return total + codes.filter(code => code.trim().length === 6).length;
      }
      return total;
    }, 0);
    

    return totalTCodes >= maxPcs && !users[index].work_order_rc_sub_barcode;
  };
  const totalTCodes = users.reduce((total, user) => {
    if (user.work_order_rc_sub_barcode) {
      const codes = user.work_order_rc_sub_barcode.split(',');
      return total + codes.filter(code => code.trim().length === 6).length;
    }
    return total;
  }, 0);

 

 
  
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
                Add Order Received
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/order-received" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <form  className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Factory */}
                <div className="space-y-1">
                  <Label htmlFor="factory">
                    Factory <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="work_order_rc_factory_no"
                    value={workorder.work_order_rc_factory_no}
                    onValueChange={(value) => {
                      setWorkorder({
                        ...workorder,
                        work_order_rc_factory_no: value,
                        work_order_rc_id: "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select factory" />
                    </SelectTrigger>
                    <SelectContent>
                      {factoryData?.factory.map((factory) => (
                        <SelectItem
                          key={factory.factory_no}
                          value={factory.factory_no.toString()}
                        >
                          {factory.factory_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Order ID */}
                <div className="space-y-1">
                  <Label htmlFor="workOrderId">
                    Work Order ID <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="work_order_rc_id"
                    value={workorder.work_order_rc_id}
                 
                    onValueChange={(value) => {
                      const selectedWorkOrder = workOrders.find((item) => item.id === value);
                      setWorkorder({
                        ...workorder,
                        work_order_rc_id: selectedWorkOrder?.id, 
                        work_order_no: selectedWorkOrder.work_order_no, 
                      });
                    }}
                  
                    disabled={!workorder.work_order_rc_factory_no}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work order">
                        {workorder.work_order_no || "Select work order"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders.map((workOrder) => (
                        <SelectItem
                          key={workOrder.id}
                          value={workOrder.id}
                        >
                          {workOrder.work_order_no}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <Label htmlFor="brand">Brand (read only)</Label>
                  <Input
                    id="brand"
                    name="work_order_rc_brand"
                    value={workorder.work_order_rc_brand}
                    readOnly
                  />
                </div>

                {/* Receive Date */}
                <div className="space-y-1">
                  <Label htmlFor="receiveDate">
                    Receive Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="receiveDate"
                    name="work_order_rc_date"
                    value={workorder.work_order_rc_date}
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
                    name="work_order_rc_dc_no"
                    value={workorder.work_order_rc_dc_no}
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
                    name="work_order_rc_dc_date"
                    value={workorder.work_order_rc_dc_date}
                    onChange={onInputChange}
                  />
                </div>

                {/* No of Box */}
                <div className="space-y-1">
                  <Label htmlFor="boxCount">
                    No of Box <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="boxCount"
                    name="work_order_rc_box"
                    value={workorder.work_order_rc_box}
                    onChange={onInputChange}
                    min={0}
                  />
                </div>

                {/* Total No of Pcs */}
                <div className="space-y-1">
                  <Label htmlFor="pcsCount">
                    Total No of Pcs <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pcsCount"
                    name="work_order_rc_pcs"
                    value={workorder.work_order_rc_pcs}
                    onChange={onInputChange}
                  />
                </div>

                {/* Fabric Received */}
                <div className="space-y-1">
                  <Label htmlFor="fabricReceived">
                    Fabric Received <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="work_order_rc_fabric_received"
                    value={workorder.work_order_rc_fabric_received}
                    onValueChange={(value) =>
                      setWorkorder({
                        ...workorder,
                        work_order_rc_fabric_received: value,
                        work_order_rc_received_by:
                          value === "Yes"
                            ? workorder.work_order_rc_received_by
                            : "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {workReceiveOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric Received By (conditional) */}
                {workorder.work_order_rc_fabric_received === "Yes" && (
                  <div className="space-y-1">
                    <Label htmlFor="receivedBy">Fabric Received By</Label>
                    <Input
                      id="receivedBy"
                      name="work_order_rc_received_by"
                      value={workorder.work_order_rc_received_by}
                      onChange={onInputChange}
                    />
                  </div>
                )}

                {/* Fabric Leftover */}
                <div
                  className={`space-y-1 ${
                    workorder.work_order_rc_fabric_received === "Yes"
                      ? "col-span-2"
                      : ""
                  }`}
                >
                  <Label htmlFor="fabricLeft">Fabric Leftover</Label>
                  <Input
                    id="fabricLeft"
                    name="work_order_rc_fabric_count"
                    value={workorder.work_order_rc_fabric_count}
                    onChange={onInputChange}
                  />
                </div>

                {/* Remarks */}
                <div className={`space-y-1 ${
                    workorder.work_order_rc_fabric_received === "Yes"
                      ? "col-span-full"
                      : "col-span-2"}`}>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    name="work_order_rc_remarks"
                    value={workorder.work_order_rc_remarks}
                    onChange={onInputChange}
                  />
                </div>
              </div>

              <hr className="my-2" />

              {/* Barcode entries */}
              <div className="space-y-2">
              <Label>
          Barcode Entries (Total Box: {users.length}, Total Barcode: {totalTCodes})
         
        </Label>

           
                  <div className="space-y-1">
                    {users.map((user, index) => {
                       const tCodeCount = user.work_order_rc_sub_barcode 
                       ? user.work_order_rc_sub_barcode.split(',').filter(code => code.trim().length === 6).length 
                       : 0;
                   
            const boxDuplicates = {};
            if (user.work_order_rc_sub_barcode) {
              const codes = user.work_order_rc_sub_barcode.split(',')
                .map(code => code.trim())
                .filter(code => code.length === 6);
              
              const seen = {};
              codes.forEach(barcode => {
                if (seen[barcode]) {
                  boxDuplicates[barcode] = (boxDuplicates[barcode] || 1) + 1;
                } else {
                  seen[barcode] = true;
                }
              });
            }
            
            const formatBoxDuplicates = () => {
              return Object.entries(boxDuplicates).map(([barcode, count]) => (
                `${barcode} × ${count}`
              )).join(', ');
            };
                      return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="grid grid-cols-1  gap-3 w-full">
                        

                 
                          <div className="space-y-2 ">
                            <Label htmlFor={`barcode-${index}`}>     Box {index + 1} — T Code </Label>
                            <div className="flex gap-2">
                              <Textarea
                                id={`barcode-${index}`}
                                ref={(el) => (inputRefs.current[index] = el)}
                                name={`work_order_rc_sub_barcode_${index}`}
                                value={user.work_order_rc_sub_barcode}
                                onChange={(e) => handleBarcodeChange(e, index)}
                               rows={3}
                                className="flex-1"
                                disabled={isInputDisabled(index)}
                              />
                              
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={() => removeUser(index)}
                      className="hover:text-red-800 "
                                disabled={users.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 " />
                              </Button>
                            </div>
                            <span className="text-sm">
                      Total barcode: ({tCodeCount} entered)
                      {Object.keys(boxDuplicates).length > 0 && (
                        <span className="text-amber-600 ml-2">
                          Duplicates: {formatBoxDuplicates()}
                        </span>
                      )}
                    </span>
                          </div>
                          <span>
                         
                              </span>
                        </div>
                      </div>
                 )   })}
                  </div>
        

                <Button
                  variant="outline"
                  onClick={addItem}
                
                  disabled={
                    !workorder.work_order_rc_box ||
                    users.length >= (parseInt(workorder.work_order_rc_box) || 0) ||
                    users.reduce((total, user) => {
                      if (user.work_order_rc_sub_barcode) {
                        const codes = user.work_order_rc_sub_barcode.split(',');
                        return total + codes.filter(code => code.trim().length === 6).length;
                      }
                      return total;
                    }, 0) >= parseInt(workorder.work_order_rc_pcs || 0, 10)
                  }
                >
                  + Add Box
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/order-received">Cancel</Link>
                </Button>
                <Button type="button"
                onClick={onSubmit} disabled={submitMutation.isPending}>
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

export default AddOrderReceived;
