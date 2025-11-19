import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Package,
  Calendar,
  Factory,
  ChevronLeft,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import {
  LoaderComponent,
  ErrorComponent,
} from "@/components/LoaderComponent/LoaderComponent";
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
  work_order_rc_fabric_received: z
    .string()
    .min(1, "Fabric received status is required"),
  work_order_rc_fabric_count: z.string().optional(),
  work_order_rc_remarks: z.string().optional(),
  work_order_rc_count: z.number().optional(),
});

const EditOrderReceived = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRefs = useRef([]);
  
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
    work_order_rc_ref: "",
  });

  const [users, setUsers] = useState([
    { id: "", work_order_rc_sub_box: 1, barcodes: [], dbIds: [] }
  ]);
  
  const [loadingStates, setLoadingStates] = useState({});
  const [duplicateBarcodes, setDuplicateBarcodes] = useState({});
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [highlightedItem, setHighlightedItem] = useState(null);

  // Alert Dialog States
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    data: null,
    message: ""
  });

  // Fetch work order received data
  const {
    data: workOrderData,
    isFetching,
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

  // Transform API data to match our state structure
  useEffect(() => {
    if (workOrderData) {
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
          work_order_rc_fabric_received:
            workorderrc.work_order_rc_fabric_received || "",
          work_order_rc_received_by:
            workorderrc.work_order_rc_received_by || "",
          work_order_rc_fabric_count:
            workorderrc.work_order_rc_fabric_count || "",
          work_order_rc_count: workorderrc.work_order_rc_count || "",
          work_order_rc_remarks: workorderrc.work_order_rc_remarks || "",
          work_order_rc_ref: workorderrc.work_order_rc_ref || "",
        });
      }

      // Transform workorderrcsub data to match our users state structure
      if (workorderrcsub && workorderrcsub.length > 0) {
        // Group by box number
        const boxGroups = workorderrcsub.reduce((acc, item) => {
          const boxNo = item.work_order_rc_sub_box || "1";
          if (!acc[boxNo]) {
            acc[boxNo] = {
              id: `box-${boxNo}`,
              work_order_rc_sub_box: parseInt(boxNo),
              barcodes: [],
              dbIds: []
            };
          }
          if (item.work_order_rc_sub_barcode) {
            acc[boxNo].barcodes.push(item.work_order_rc_sub_barcode);
            acc[boxNo].dbIds.push(item.id);
          }
          return acc;
        }, {});

        // Convert to array and sort by box number
        const usersArray = Object.values(boxGroups)
          .sort((a, b) => a.work_order_rc_sub_box - b.work_order_rc_sub_box)
          .map((box, index) => ({
            ...box,
            id: box.id || `box-${index + 1}`
          }));

        setUsers(usersArray);
      } else {
        setUsers([{ id: "box-1", work_order_rc_sub_box: 1, barcodes: [], dbIds: [] }]);
      }
    }
  }, [workOrderData]);

  // Calculate and update box and pieces count whenever users state changes
  useEffect(() => {
    const totalBoxes = users.length;
    const totalPieces = users.reduce((total, user) => total + user.barcodes.length, 0);
    
    setWorkOrderReceive(prev => ({
      ...prev,
      work_order_rc_box: totalBoxes.toString(),
      work_order_rc_pcs: totalPieces.toString()
    }));
  }, [users]);

  // Calculate duplicate barcodes
  const calculateDuplicates = useCallback((users) => {
    const allBarcodes = [];
    
    users.forEach(user => {
      user.barcodes.forEach(barcode => {
        if (barcode) {
          allBarcodes.push(barcode);
        }
      });
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
  }, []);

  useEffect(() => {
    setDuplicateBarcodes(calculateDuplicates(users));
  }, [users, calculateDuplicates]);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow manual changes to box and pcs fields since they're auto-calculated
    if (name === "work_order_rc_box" || name === "work_order_rc_pcs") {
      toast({
        title: "Auto-calculated Field",
        description: "This field is automatically calculated from barcode entries",
        variant: "default",
      });
      return;
    }
    
    setWorkOrderReceive((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBarcodeInputChange = (e, index) => {
    setCurrentInputValue(e.target.value);
  };

  const addBarcodeToBox = async (index) => {
    if (!currentInputValue.trim()) return;
    setLoadingStates((prev) => ({ ...prev, [index]: true }));

    try {
      // Validate barcode format (6 characters)
      const barcode = currentInputValue.trim().toUpperCase();
      if (barcode.length !== 6) {
        toast({
          title: "Invalid format",
          description: "Barcode must be exactly 6 characters",
          variant: "destructive",
        });
        return;
      }

      // Add the barcode to the box (without dbId for new barcodes)
      const newUsers = [...users];
      newUsers[index].barcodes.push(barcode);
      newUsers[index].dbIds.push(null);
      setUsers(newUsers);
      setCurrentInputValue("");
      
      toast({
        title: "Success",
        description: "Barcode added successfully",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding barcode",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBarcodeToBox(index);
    }
  };

  // Show confirmation dialog for box deletion
  const confirmBoxDelete = (index) => {
    const boxNumber = users[index].work_order_rc_sub_box;
    const barcodeCount = users[index].barcodes.length;
    const hasDbEntries = users[index].dbIds.some(id => id !== null);
    
    setDeleteDialog({
      isOpen: true,
      data: { index, boxNumber, barcodeCount, hasDbEntries },
      message: hasDbEntries 
        ? `Are you sure you want to delete Box ${boxNumber}? This will remove ${barcodeCount} barcode(s) from the database.`
        : `Are you sure you want to remove Box ${boxNumber}? This will remove ${barcodeCount} barcode(s).`
    });
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    const { index, boxNumber, hasDbEntries } = deleteDialog.data;

    // If this box has existing database IDs, delete them via API
    if (hasDbEntries) {
      const success = await deleteBoxFromDB(boxNumber);
      if (!success) return;
    }
    
    // Remove from local state
    await removeUser(index);

    setDeleteDialog({ isOpen: false, data: null, message: "" });
  };

  // Delete entire box from database
  const deleteBoxFromDB = async (boxNumber) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/delete-work-order-received-box-sub`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            work_order_rc_ref: workorder.work_order_rc_ref,
            work_order_rc_sub_box: boxNumber.toString()
          }
        }
      );
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete box from database",
      });
      return false;
    }
  };

  // Actual box removal function
  const removeUser = async (index) => {
    // Remove from local state
    const newUsers = users.filter((_, i) => i !== index);
    const updatedUsers = newUsers.map((u, i) => ({
      ...u,
      work_order_rc_sub_box: i + 1,
    }));
    setUsers(updatedUsers);

    toast({
      title: "Success",
      description: "Box removed successfully",
      variant: "default",
    });
  };

  const addItem = (e) => {
    e.preventDefault();
    const newUsers = [
      ...users,
      { 
        id: `box-${users.length + 1}`, 
        work_order_rc_sub_box: users.length + 1, 
        barcodes: [],
        dbIds: []
      },
    ];
    setUsers(newUsers);
  };

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
    
    // Prepare data for submission
    const submissionData = {
      work_order_rc_dc_no: workorder.work_order_rc_dc_no,
      work_order_rc_dc_date: workorder.work_order_rc_dc_date,
      work_order_rc_box: parseInt(workorder.work_order_rc_box),
      work_order_rc_pcs: parseInt(workorder.work_order_rc_pcs),
      work_order_rc_fabric_received: workorder.work_order_rc_fabric_received,
      work_order_rc_fabric_count: workorder.work_order_rc_fabric_count,
      work_order_rc_remarks: workorder.work_order_rc_remarks,
      work_order_rc_count: parseInt(workorder.work_order_rc_pcs),
      workorder_sub_rc_data: users.flatMap(user => 
        user.barcodes.map((barcode, barcodeIndex) => ({
          id: user.dbIds[barcodeIndex] || null,
          work_order_rc_sub_box: user.work_order_rc_sub_box.toString(),
          work_order_rc_sub_barcode: barcode
        }))
      )
    };
  
    // Validation
    const validation = formSchema.safeParse(submissionData);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Please fix the following:",
        description: (
          <div className="grid gap-1">
            {validation.error.errors.map((error, i) => {
              const field = error.path[0].toString().replace(/_/g, " ");
              const label = field.charAt(0).toUpperCase() + field.slice(1);
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex items-center justify-center h-4 w-4 mt-0.5 flex-shrink-0 rounded-full bg-red-100 text-red-700 text-xs">
                    {i + 1}
                  </div>
                  <p className="text-xs">
                    <span className="font-medium">{label}:</span>{" "}
                    {error.message}
                  </p>
                </div>
              );
            })}
          </div>
        ),
      });
      return;
    }
  
    // Additional validations - minimum requirements
    const totalBoxes = users.length;
    const totalBarcodes = users.reduce((total, user) => total + user.barcodes.length, 0);
    
    if (totalBoxes === 0) {
      toast({
        variant: "destructive",
        title: "No Boxes Added",
        description: "Please add at least one box with barcodes",
      });
      return;
    }
    
    if (totalBarcodes === 0) {
      toast({
        variant: "destructive",
        title: "No Barcodes Added",
        description: "Please add at least one barcode",
      });
      return;
    }
  
    updateOrderReceivedMutation.mutate(submissionData);
  };

  const totalTCodes = users.reduce((total, user) => total + user.barcodes.length, 0);

  if (isFetching) {
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
            <form className="space-y-1">
              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                <div className="">
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
                <div className="">
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
                <div className="">
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
                <div className="">
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
                <div className="">
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
                <div className="">
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
                <div className="">
                  <Label htmlFor="work_order_rc_box">
                    No of Box <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="work_order_rc_box"
                    name="work_order_rc_box"
                    value={workorder.work_order_rc_box}
                    onChange={onInputChange}
                    required
                    disabled
                    className="bg-gray-100 font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from boxes below</p>
                </div>
                <div className="">
                  <Label htmlFor="work_order_rc_pcs">
                    Total No of Pcs <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="work_order_rc_pcs"
                    name="work_order_rc_pcs"
                    value={workorder.work_order_rc_pcs}
                    onChange={onInputChange}
                    required
                    disabled
                    className="bg-gray-100 font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from barcodes below</p>
                </div>
                <div className="">
                  <Label htmlFor="work_order_rc_fabric_received">
                    Fabric Received <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="work_order_rc_fabric_received"
                    value={workorder.work_order_rc_fabric_received}
                    onValueChange={(value) =>
                      setWorkOrderReceive((prev) => ({
                        ...prev,
                        work_order_rc_fabric_received: value,
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
                  <div className="">
                    <Label htmlFor="work_order_rc_received_by">
                      Fabric Received By
                    </Label>
                    <Input
                      id="work_order_rc_received_by"
                      name="work_order_rc_received_by"
                      value={workorder.work_order_rc_received_by}
                      onChange={onInputChange}
                    />
                  </div>
                )}
                <div
                  className={` ${
                    workorder.work_order_rc_fabric_received === "Yes"
                      ? "xl:col-span-2"
                      : "xl:col-span-1"
                  }`}
                >
                  <Label htmlFor="work_order_rc_fabric_count">
                    Fabric Left Over
                  </Label>
                  <Input
                    id="work_order_rc_fabric_count"
                    name="work_order_rc_fabric_count"
                    value={workorder.work_order_rc_fabric_count}
                    onChange={onInputChange}
                  />
                </div>
                <div
                  className={` ${
                    workorder.work_order_rc_fabric_received === "Yes"
                      ? "xl:col-span-4"
                      : "xl:col-span-2"
                  }`}
                >
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

              {/* Barcode entries */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Barcode Entries (Total Box: {users.length}, Total Barcode: {totalTCodes})
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Add boxes and barcodes below. The "No of Box" and "Total No of Pcs" fields above will be automatically updated.
                </p>
                <div className="space-y-2">
                  {users.map((user, index) => {
                    // Group barcodes by value and count duplicates
                    const barcodeGroups = user.barcodes.reduce((acc, barcode) => {
                      if (!acc[barcode]) {
                        acc[barcode] = { barcode, count: 1 };
                      } else {
                        acc[barcode].count += 1;
                      }
                      return acc;
                    }, {});

                    const uniqueBarcodes = Object.values(barcodeGroups);

                    return (
                      <div key={user.id} className="border rounded p-2 bg-gray-50">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Label className="text-xs font-medium">Box {user.work_order_rc_sub_box}</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              ref={(el) => (inputRefs.current[index] = el)}
                              value={activeInputIndex === index ? currentInputValue : ""}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase().replace(/\s/g, '');
                                handleBarcodeInputChange({ target: { value } }, index);
                              }}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              onFocus={() => {
                                setActiveInputIndex(index);
                                setCurrentInputValue("");
                              }}
                              onPaste={(e) => {
                                const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/\s/g, '');
                                e.preventDefault();
                                document.execCommand('insertText', false, pastedText);
                                handleBarcodeInputChange({ target: { value: pastedText } }, index);
                              }}
                              placeholder="6-digit barcode"
                              className="h-8 text-xs p-1 uppercase bg-blue-200 text-black"
                              maxLength={6}
                            />

                            <Button
                              type="button"
                              onClick={() => addBarcodeToBox(index)}
                              disabled={
                                !currentInputValue.trim() ||
                                activeInputIndex !== index
                              }
                              size="sm"
                              className="h-8 w-8 p-1"
                            >
                              {loadingStates[index] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              onClick={() => confirmBoxDelete(index)}
                              className="h-8 w-8 hover:text-red-800 p-1"
                              disabled={users.length <= 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-1">
                          {uniqueBarcodes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                              {uniqueBarcodes.map((barcodeGroup, barcodeIndex) => (
                                <div
                                  key={`${index}-${barcodeGroup.barcode}-${barcodeIndex}`}
                                  className={`bg-white p-1 rounded border border-gray-200 text-xs flex items-center justify-between ${
                                    highlightedItem === barcodeGroup.barcode ? 'bg-blue-100 border-2 border-blue-600' : ''
                                  } ${
                                    barcodeGroup.count > 1 ? 'bg-amber-50 border-amber-200' : ''
                                  }`}
                                >
                                  <div className="flex items-center min-w-0 flex-1">
                                    <span className="text-gray-500 mr-1 w-4 text-right shrink-0">
                                      {barcodeIndex + 1}.
                                    </span>
                                    <span className="font-mono truncate" title={barcodeGroup.barcode}>
                                      {barcodeGroup.barcode}
                                      {barcodeGroup.count > 1 && (
                                        <span className="text-amber-600 ml-1">× {barcodeGroup.count}</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">No barcodes added yet</p>
                          )}
                          
                          {/* Show duplicate warning if any barcode appears more than once in this box */}
                          {uniqueBarcodes.some(bg => bg.count > 1) && (
                            <div className="mt-1 text-amber-600 text-xs">
                              Duplicate barcodes in this box
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {user.barcodes.length} barcode(s) total
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={addItem}
                  size="sm"
                  className="mt-1 h-8"
                >
                  + Add Box
                </Button>
              </div>

              <Separator />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, data: null, message: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Box
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default EditOrderReceived;