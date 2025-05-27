import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Send, ArrowLeft, Package, Calendar, Factory, ChevronLeft } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import axios from "axios";
import BASE_URL from "@/config/BaseUrl";

import { useToast } from "@/hooks/use-toast";
import { LoaderComponent, ErrorComponent } from "@/components/LoaderComponent/LoaderComponent";
import Page from "../dashboard/page";

const work_receive = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const formSchema = z.object({
  work_order_rc_dc_no: z.string().min(1, "DC No is required"),
  work_order_rc_dc_date: z.string().min(1, "DC Date is required"),
  work_order_rc_box: z.number().min(1, "Box count is required"),
  work_order_rc_pcs: z.number().min(1, "Pieces count is required"),
  work_order_rc_fabric_received: z.string().min(1, "Fabric received status is required"),
  work_order_rc_fabric_count: z.string().optional(),
  work_order_rc_remarks: z.string().optional(),
  work_order_rc_count: z.number().optional(),
  workorder_sub_rc_data: z.array(
    z.object({
      id: z.number().optional(),
      work_order_rc_sub_barcode: z.string().min(1, "T Code is required"),
      work_order_rc_sub_box: z.string().min(1, "Box is required"),
    })
  ),
});

const EditOrderReceived = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [workorder, setWorkOrderReceive] = useState({
    work_order_rc_factory_no: "",
    work_order_rc_id: "",
    work_order_rc_date: "",
    work_order_rc_dc_no: "",
    work_order_rc_dc_date: "",
    work_order_rc_brand: "",
    work_order_rc_box: "",
    work_order_rc_pcs: "",
    work_order_rc_fabric_received: "",
    work_order_rc_received_by: "",
    work_order_rc_fabric_count: "",
    work_order_rc_count: "",
    work_order_rc_remarks: "",
  });

  const useTemplate = {
    id: "",
    work_order_rc_sub_barcode: "",
    work_order_rc_sub_box: "",
  };

  const [users, setUsers] = useState([useTemplate]);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // Fetch work order received data
  const {
    data: workOrderData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["workOrderReceived", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-received-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (workOrderData && !isInitialDataLoaded) {
      const { workorderrc, workorderrcsub } = workOrderData;
      
      if (workorderrc) {
        setWorkOrderReceive({
          work_order_rc_factory_no: workorderrc.work_order_rc_factory_no || "",
          work_order_rc_id: workorderrc.work_order_rc_id || "",
          work_order_rc_date: workorderrc.work_order_rc_date || "",
          work_order_rc_dc_no: workorderrc.work_order_rc_dc_no || "",
          work_order_rc_dc_date: workorderrc.work_order_rc_dc_date || "",
          work_order_rc_brand: workorderrc.work_order_rc_brand || "",
          work_order_rc_box: workorderrc.work_order_rc_box || "",
          work_order_rc_pcs: workorderrc.work_order_rc_pcs || "",
          work_order_rc_fabric_received: workorderrc.work_order_rc_fabric_received || "",
          work_order_rc_received_by: workorderrc.work_order_rc_received_by || "",
          work_order_rc_fabric_count: workorderrc.work_order_rc_fabric_count || "",
          work_order_rc_count: workorderrc.work_order_rc_count || "",
          work_order_rc_remarks: workorderrc.work_order_rc_remarks || "",
        });
      }

      if (workorderrcsub && workorderrcsub.length > 0) {
        setUsers(workorderrcsub.map(item => ({
          id: item.id || "",
          work_order_rc_sub_barcode: item.work_order_rc_sub_barcode || "",
          work_order_rc_sub_box: item.work_order_rc_sub_box || "",
        })));
      } else {
        setUsers([useTemplate]);
      }
      
      setIsInitialDataLoaded(true);
    }
  }, [workOrderData, isInitialDataLoaded]);

  const validateOnlyDigits = (inputtxt) => {
    const phoneno = /^\d+$/;
    return phoneno.test(inputtxt) || inputtxt.length === 0;
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "work_order_rc_box" || name === "work_order_rc_pcs") {
      if (validateOnlyDigits(value)) {
        setWorkOrderReceive((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setWorkOrderReceive((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onChange = (e, index) => {
    const { name, value } = e.target;
    setUsers((prev) =>
      prev.map((user, i) => (i === index ? { ...user, [name]: value } : user))
    );
  };

  // Update mutation
  const updateOrderReceivedMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/update-work-orders-received/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.code === "200" || data?.code === 200) {
        toast({
          title: "Success",
          description: "Work Order Receive Updated Successfully",
        });
        navigate("/order-received");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error while editing the order received",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "API Error occurred",
      });
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      work_order_rc_dc_no: workorder.work_order_rc_dc_no,
      work_order_rc_dc_date: workorder.work_order_rc_dc_date,
      work_order_rc_box: workorder.work_order_rc_box,
      work_order_rc_pcs: workorder.work_order_rc_pcs,
      work_order_rc_fabric_received: workorder.work_order_rc_fabric_received,
      work_order_rc_fabric_count: workorder.work_order_rc_fabric_count,
      work_order_rc_remarks: workorder.work_order_rc_remarks,
      workorder_sub_rc_data: users,
      work_order_rc_count: workorder.work_order_rc_count,
    };

    const validation = formSchema.safeParse(data);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Please fix the following:",
        description: (
          <div className="grid gap-1">
            {validation.error.errors.map((error, i) => {
              const field = error.path[0].toString().replace(/_/g, ' ');
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

    updateOrderReceivedMutation.mutate(data);
  };

  if (isLoading || !isInitialDataLoaded) {
    return <LoaderComponent name="Work Order Received Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Work Order Received Data"
        refetch={refetch}
      />
    );
  }

  return (
    <Page>
     <div className="max-w-full mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                  Update Work Order Receive
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
                              {/* Basic Information Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_factory_no">Factory</Label>
                                  <Input
                                    id="work_order_rc_factory_no"
                                    name="work_order_rc_factory_no"
                                    value={workorder.work_order_rc_factory_no}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_id">Work Order ID</Label>
                                  <Input
                                    id="work_order_rc_id"
                                    name="work_order_rc_id"
                                    value={workorder.work_order_rc_id}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_date">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Receive Date
                                  </Label>
                                  <Input
                                    id="work_order_rc_date"
                                    type="date"
                                    name="work_order_rc_date"
                                    value={workorder.work_order_rc_date}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_dc_no">DC No</Label>
                                  <Input
                                    id="work_order_rc_dc_no"
                                    name="work_order_rc_dc_no"
                                    value={workorder.work_order_rc_dc_no}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_dc_date">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    DC Date
                                  </Label>
                                  <Input
                                    id="work_order_rc_dc_date"
                                    type="date"
                                    name="work_order_rc_dc_date"
                                    value={workorder.work_order_rc_dc_date}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_brand">Brand</Label>
                                  <Input
                                    id="work_order_rc_brand"
                                    name="work_order_rc_brand"
                                    value={workorder.work_order_rc_brand}
                                    onChange={onInputChange}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_box">
                                    No of Box <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="work_order_rc_box"
                                    name="work_order_rc_box"
                                    value={workorder.work_order_rc_box}
                                    onChange={onInputChange}
                                    required
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_pcs">
                                    Total No of Pcs <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="work_order_rc_pcs"
                                    name="work_order_rc_pcs"
                                    value={workorder.work_order_rc_pcs}
                                    onChange={onInputChange}
                                    required
                                  />
                                </div>
                
                                <div className="space-y-1">
                                  <Label htmlFor="work_order_rc_fabric_received">
                                    Fabric Received <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    name="work_order_rc_fabric_received"
                                    value={workorder.work_order_rc_fabric_received}
                                    onValueChange={(value) =>
                                      setWorkOrderReceive(prev => ({
                                        ...prev,
                                        work_order_rc_fabric_received: value
                                      }))
                                    }
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {work_receive.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                
                                {workorder.work_order_rc_fabric_received === "Yes" && (
                                  <div className="space-y-1">
                                    <Label htmlFor="work_order_rc_received_by">Fabric Received By</Label>
                                    <Input
                                      id="work_order_rc_received_by"
                                      name="work_order_rc_received_by"
                                      value={workorder.work_order_rc_received_by}
                                      onChange={onInputChange}
                                    />
                                  </div>
                                )}
                
                                <div className={`space-y-1 ${
                                  workorder.work_order_rc_fabric_received === "Yes"
                                    ? "xl:col-span-2"
                                    : "xl:col-span-1"
                                }`}>
                                  <Label htmlFor="work_order_rc_fabric_count">Fabric Left Over</Label>
                                  <Input
                                    id="work_order_rc_fabric_count"
                                    name="work_order_rc_fabric_count"
                                    value={workorder.work_order_rc_fabric_count}
                                    onChange={onInputChange}
                                  />
                                </div>
                
                                <div className={`space-y-1 ${
                                  workorder.work_order_rc_fabric_received === "Yes"
                                    ? "xl:col-span-4"
                                    : "xl:col-span-2"
                                }`}>
                                  <Label htmlFor="work_order_rc_remarks">Remarks</Label>
                                  <Textarea
                                    id="work_order_rc_remarks"
                                    name="work_order_rc_remarks"
                                    value={workorder.work_order_rc_remarks}
                                    onChange={onInputChange}
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </div>
                
                              <Separator />
                
                              {/* Sub Items Section */}
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">Item Details</h4>
                                <div className="grid gap-4">
                                  {users.map((user, index) => (
                                    <div key={index} className="border-l-4 border-l-blue-500 px-2">
                                     
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <Input
                                            type="hidden"
                                            name="id"
                                            value={user.id}
                                            onChange={(e) => onChange(e, index)}
                                          />
                                          
                                          <div className="space-y-1">
                                            <Label htmlFor={`box_${index}`}>
                                              Box <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id={`box_${index}`}
                                              name="work_order_rc_sub_box"
                                              value={user.work_order_rc_sub_box}
                                              onChange={(e) => onChange(e, index)}
                                              required
                                            />
                                          </div>
                
                                          <div className="space-y-1">
                                            <Label htmlFor={`tcode_${index}`}>
                                              T Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id={`tcode_${index}`}
                                              name="work_order_rc_sub_barcode"
                                              value={user.work_order_rc_sub_barcode}
                                              onChange={(e) => onChange(e, index)}
                                              required
                                            />
                                          </div>
                                        </div>
                                    
                                    </div>
                                  ))}
                                </div>
                              </div>
                
                              <Separator />
                
                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {/* <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => navigate("/work-order-receive")}
                                  className="flex items-center gap-2"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  Back
                                </Button> */}
                
                                <Button
                                   type="button"
                                   onClick={onSubmit}
                                  disabled={updateOrderReceivedMutation.isPending}
                                  className="flex items-center gap-2"
                                >
                                  {updateOrderReceivedMutation.isPending ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      Update
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
              </CardContent>
            </Card>
          </div>
    </Page>
  );
};

export default EditOrderReceived;