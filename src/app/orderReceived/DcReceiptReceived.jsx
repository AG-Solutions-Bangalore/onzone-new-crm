import React, { useRef, useState, useEffect, useMemo } from "react";
import Page from "../dashboard/page";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import ReactToPrint from "react-to-print";
import {
  Printer,
  BarcodeIcon,
  Plus,
  Minus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import Barcode from "react-barcode";

const DcReceiptReceived = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const componentRef = useRef(null);
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteWorkOrderId, setDeleteWorkOrderId] = useState(null);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [loadingStates, setLoadingStates] = useState({});
  const [validationStatus, setValidationStatus] = useState(null);
  const location = useLocation();

  const [checkedBoxes, setCheckedBoxes] = useState(new Set());

  const { orderReceivedStatus } = location.state || {};

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dcreceipt", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-received-view-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return {
        workOrder: response.data.workorderrc || {},
        workOrderSub: response.data.workorderrcsub || [],
        workOrderFooter: response.data.workorderfooter || {},
      };
    },
  });

  const { workOrder = {}, workOrderSub = [] } = data || {};

  // --- Build table rows (aggregated by box, barcode, size, rate) ---
  const tableRows = useMemo(() => {
    const rows = [];
    workOrderSub.forEach((item) => {
      const box = item.work_order_rc_sub_box || "1";
      const barcodeStr = item.work_order_rc_sub_barcode || "";
      const barcodes = barcodeStr.split(",").filter((b) => b.trim());
      if (barcodes.length === 0) return;

      const size = item.finished_stock_size || "N/A";
      const amount = item.finished_stock_amount || "N/A";

      barcodes.forEach((barcode) => {
        rows.push({
          box,
          barcode: barcode.trim(),
          size,
          amount,
        });
      });
    });

    const aggregated = {};
    rows.forEach((row) => {
      const key = `${row.box}|${row.barcode}|${row.size}|${row.amount}`;
      if (!aggregated[key]) {
        aggregated[key] = { ...row, quantity: 0 };
      }
      aggregated[key].quantity += 1;
    });

    return Object.values(aggregated);
  }, [workOrderSub]);

  // Group by box for rendering
  const groupedRows = useMemo(() => {
    return tableRows.reduce((acc, row) => {
      if (!acc[row.box]) acc[row.box] = [];
      acc[row.box].push(row);
      return acc;
    }, {});
  }, [tableRows]);

  // Build grouped boxes for barcode dialog
  const groupedBoxesForDialog = useMemo(() => {
    return workOrderSub.reduce((acc, item) => {
      const boxNumber = item.work_order_rc_sub_box;
      if (!acc[boxNumber]) {
        acc[boxNumber] = {
          barcodes: [],
          totalPcs: 0,
        };
      }

      if (item.work_order_rc_sub_barcode) {
        const barcodes = item.work_order_rc_sub_barcode
          .split(",")
          .filter((b) => b.trim());
        acc[boxNumber].barcodes.push(...barcodes);
        acc[boxNumber].totalPcs += barcodes.length;
      }
      return acc;
    }, {});
  }, [workOrderSub]);

  // Sort box numbers numerically
  const sortedBoxes = useMemo(
    () => Object.keys(groupedRows).sort((a, b) => Number(a) - Number(b)),
    [groupedRows],
  );

  // Checkboxes are kept unchecked by default on load as per requirements

  const generateFactoryCode = (factoryName) => {
    if (!factoryName) return "";
    return factoryName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatBoxNumber = (boxNumber) => {
    const factoryCode = generateFactoryCode(workOrder.work_order_rc_factory);
    return `${factoryCode}${id}${boxNumber}`;
  };

  const updateMutation = useMutation({
    mutationFn: async (workOrderId) => {
      const token = localStorage.getItem("token");
      return await axios.put(
        `${BASE_URL}/api/update-work-order-received-finish-by-id/${workOrderId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    },
    onSuccess: (response) => {
      refetch();
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: `${response?.data?.msg}`,
      });
      navigate("/order-received");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error closing dc receipt order",
      });
    },
  });

  const updateOrderReceivedMutation = useMutation({
    mutationFn: async (submissionData) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/update-work-orders-received/${id}`,
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.code === "200" || data?.code === 200) {
        toast({
          title: "Success",
          description: "Work Order Receive Updated Successfully",
        });
        refetch();
        setBarcodeDialogOpen(false);
        setValidationStatus(null);
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

  const confirmCloseWorkOrder = () => {
    if (deleteWorkOrderId) {
      updateMutation.mutate(deleteWorkOrderId);
      setDeleteWorkOrderId(null);
    }
  };

  const openBarcodeDialog = (boxNumber, boxData) => {
    setSelectedBox({
      boxNumber,
      originalBarcodes: [...boxData.barcodes],
      currentBarcodes: [...boxData.barcodes],
    });
    setBarcodeDialogOpen(true);
    setCurrentInputValue("");
    setValidationStatus(null);
  };

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCurrentInputValue(value);
    if (value.length === 0) {
      setValidationStatus(null);
    }
  };

  const validateBarcode = async (barcode) => {
    if (!barcode || barcode.length !== 6) {
      return {
        valid: false,
        message: "Barcode must be exactly 6 digits",
      };
    }

    try {
      const workId = workOrder.work_order_rc_id;
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-finish-check/${workId}/${barcode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data?.code === 200) {
        return {
          valid: true,
          message: "Barcode validated successfully",
          data: response.data,
        };
      } else {
        return {
          valid: false,
          message: response.data?.msg || "Barcode not found in work order",
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: "Error validating barcode",
      };
    }
  };

  const addBarcodeToBox = async () => {
    if (!currentInputValue.trim() || !selectedBox) return;

    const barcode = currentInputValue.trim().toUpperCase();

    if (barcode.length !== 6) {
      setValidationStatus({
        type: "error",
        message: "Barcode must be exactly 6 digits",
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [selectedBox.boxNumber]: true }));
    setValidationStatus({
      type: "validating",
      message: "Validating barcode...",
    });

    try {
      const validationResult = await validateBarcode(barcode);

      if (validationResult.valid) {
        setSelectedBox((prev) => ({
          ...prev,
          currentBarcodes: [...prev.currentBarcodes, barcode],
        }));
        setCurrentInputValue("");
        setValidationStatus({
          type: "success",
          message: "Barcode added successfully",
        });

        toast({
          title: "Success",
          description: "Barcode validated and added to box",
          variant: "default",
        });
      } else {
        setValidationStatus({
          type: "error",
          message: validationResult.message,
        });

        toast({
          title: "Validation Failed",
          description: validationResult.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidationStatus({
        type: "error",
        message: "Error validating barcode",
      });

      toast({
        title: "Error",
        description: "Error validating barcode",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [selectedBox.boxNumber]: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBarcodeToBox();
    }
  };

  const removeBarcode = (barcodeIndex) => {
    if (!selectedBox) return;

    setSelectedBox((prev) => ({
      ...prev,
      currentBarcodes: prev.currentBarcodes.filter(
        (_, index) => index !== barcodeIndex,
      ),
    }));

    setValidationStatus(null);
  };

  const updateBoxBarcodes = () => {
    if (!selectedBox) return;
    const groupedBoxes = workOrderSub.reduce((acc, item) => {
      const boxNumber = item.work_order_rc_sub_box;
      if (!acc[boxNumber]) {
        acc[boxNumber] = {
          barcodes: [],
        };
      }
      if (boxNumber === selectedBox.boxNumber) {
        acc[boxNumber].barcodes = [...new Set(selectedBox.currentBarcodes)];
      } else {
        if (item.work_order_rc_sub_barcode) {
          const barcodes = item.work_order_rc_sub_barcode
            .split(",")
            .filter((b) => b.trim());
          acc[boxNumber].barcodes.push(...barcodes);
        }
      }
      return acc;
    }, {});

    const workorder_sub_rc_data = Object.entries(groupedBoxes).map(
      ([boxNumber, boxData]) => ({
        work_order_rc_sub_box: boxNumber,
        work_order_rc_sub_barcode: boxData.barcodes.join(","),
      }),
    );

    const totalPcs = workorder_sub_rc_data.reduce((total, box) => {
      const barcodes = box.work_order_rc_sub_barcode
        .split(",")
        .filter((b) => b.trim());
      return total + barcodes.length;
    }, 0);

    const submissionData = {
      work_order_rc_dc_no: workOrder.work_order_rc_dc_no,
      work_order_rc_dc_date: workOrder.work_order_rc_dc_date,
      work_order_rc_box: Object.keys(groupedBoxes).length.toString(),
      work_order_rc_pcs: totalPcs.toString(),
      work_order_rc_fabric_received:
        workOrder.work_order_rc_fabric_received || "No",
      work_order_rc_fabric_count: workOrder.work_order_rc_fabric_count || "",
      work_order_rc_remarks: workOrder.work_order_rc_remarks || "",
      workorder_sub_rc_data: workorder_sub_rc_data,
      work_order_rc_count: Object.keys(groupedBoxes).length,
    };

    updateOrderReceivedMutation.mutate(submissionData);
  };

  const calculateBoxDuplicates = (barcodes) => {
    const duplicates = {};
    barcodes.forEach((barcode) => {
      duplicates[barcode] = (duplicates[barcode] || 0) + 1;
    });
    return duplicates;
  };

  const getBarcodeMatchStatus = (barcode) => {
    if (!selectedBox) return "missing";

    const originalCount = selectedBox.originalBarcodes.filter(
      (b) => b === barcode,
    ).length;
    const currentCount = selectedBox.currentBarcodes.filter(
      (b) => b === barcode,
    ).length;

    if (currentCount === 0) return "missing";
    if (currentCount === originalCount) return "matched";
    if (currentCount > originalCount) return "extra";
    if (currentCount < originalCount) return "partial";

    return "matched";
  };

  const toggleBox = (box) => {
    setCheckedBoxes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(box)) {
        newSet.delete(box);
      } else {
        newSet.add(box);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <LoaderComponent name="Work Order Dc Receipt Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Work Order Dc Receipt Data"
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
                Dc Receipt
              </CardTitle>
              {orderReceivedStatus?.toLowerCase() !== "received" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeleteWorkOrderId(id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    All Received
                  </div>
                </Button>
              )}

              <div className={checkedBoxes.size > 0 ? "visible" : "invisible"}>
                <ReactToPrint
                  trigger={() => (
                    <Button variant="outline" size="sm" asChild>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Printer className="h-4 w-4" />
                        Print
                      </div>
                    </Button>
                  )}
                  content={() => componentRef.current}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div ref={componentRef} className="bg-white rounded-lg print:p-4">
              <style>{`
                @media print {
                  .print-hidden-custom {
                    display: none !important;
                  }
                  .print-visible-table-custom {
                    display: table !important;
                  }
                  .print-box-container {
                    display: block !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .print-page-break {
                    break-after: page !important;
                    page-break-after: always !important;
                  }
                }
                @media screen {
                  .print-visible-table-custom {
                    display: none !important;
                  }
                }
              `}</style>
              {/* Header Table - hidden when printing since each box will print its own header */}
              <table className="w-full mb-4 border-collapse text-sm print-hidden-custom">
                <tbody>
                  <tr className="border-t border-l border-r border-black">
                    <td className="font-semibold p-1 w-[8rem] border-r">
                      Factory
                    </td>
                    <td className="p-1 w-[16rem] border-r">
                      : {workOrder.work_order_rc_factory}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      Date
                    </td>
                    <td className="p-1 w-[8rem]">
                      :{" "}
                      {moment(workOrder.work_order_rc_date).format(
                        "DD-MM-YYYY",
                      )}
                    </td>
                  </tr>
                  <tr className="border-l border-r border-black">
                    <td className="font-semibold p-1 w-[8rem] border-r">
                      Brand
                    </td>
                    <td className="p-1 w-[16rem] border-r">
                      : {workOrder.work_order_rc_brand}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      DC No
                    </td>
                    <td className="p-1 w-[8rem]">
                      : {workOrder.work_order_rc_dc_no}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      DC Date
                    </td>
                    <td className="p-1 w-[8rem]">
                      :{" "}
                      {moment(workOrder.work_order_rc_dc_date).format(
                        "DD-MM-YYYY",
                      )}
                    </td>
                  </tr>
                  <tr className="border-l border-r border-black">
                    <td className="font-semibold p-1 w-[8rem] border-r">
                      No of Box
                    </td>
                    <td className="p-1 w-[16rem] border-r">
                      : {workOrder.work_order_rc_box}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      Total Pcs
                    </td>
                    <td className="p-1 w-[8rem] border-r">
                      : {workOrder.work_order_rc_pcs}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      Received By
                    </td>
                    <td className="p-1 w-[8rem]">
                      : {workOrder.work_order_rc_received_by}
                    </td>
                  </tr>
                  <tr className="border-l border-r border-b border-black">
                    <td className="font-semibold p-1 w-[8rem] border-r">
                      Work Order No
                    </td>
                    <td className="p-1 w-[16rem] border-r">
                      : {workOrder.work_order_rc_id}
                    </td>
                    <td className="font-semibold p-1 w-[6rem] text-right border-r">
                      Remarks
                    </td>
                    <td colSpan="3" className="p-1 break-words">
                      : {workOrder.work_order_rc_remarks}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Table grouped by box – all boxes visible on screen, only checked printed */}
              <div className="mt-4 space-y-6">
                {sortedBoxes.map((box) => {
                  const isChecked = checkedBoxes.has(box);
                  const rows = groupedRows[box];
                  const boxData = groupedBoxesForDialog[box] || {
                    barcodes: [],
                    totalPcs: 0,
                  };
                  const totalAmount = rows.reduce(
                    (sum, row) =>
                      sum + (parseFloat(row.amount) || 0) * row.quantity,
                    0,
                  );
                  // Determine if this is the last checked box to avoid a trailing blank page when printing
                  const checkedBoxesArray = sortedBoxes.filter((b) =>
                    checkedBoxes.has(b),
                  );
                  const isLastChecked =
                    checkedBoxesArray[checkedBoxesArray.length - 1] === box;

                  return (
                    <React.Fragment key={`box-frag-${box}`}>
                      <div
                        className={`border border-black p-3 ${
                          isChecked
                            ? "print-box-container"
                            : "print-hidden-custom"
                        }`}
                      >
                        {/* Header Table for print only - shows before every box */}
                        <table className="w-full mb-4 border-collapse text-sm print-visible-table-custom">
                          <tbody>
                            <tr className="border-t border-l border-r border-black">
                              <td className="font-semibold p-1 w-[8rem] border-r">
                                Factory
                              </td>
                              <td className="p-1 w-[16rem] border-r">
                                : {workOrder.work_order_rc_factory}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                Date
                              </td>
                              <td className="p-1 w-[8rem]">
                                :{" "}
                                {moment(workOrder.work_order_rc_date).format(
                                  "DD-MM-YYYY",
                                )}
                              </td>
                            </tr>
                            <tr className="border-l border-r border-black">
                              <td className="font-semibold p-1 w-[8rem] border-r">
                                Brand
                              </td>
                              <td className="p-1 w-[16rem] border-r">
                                : {workOrder.work_order_rc_brand}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                DC No
                              </td>
                              <td className="p-1 w-[8rem]">
                                : {workOrder.work_order_rc_dc_no}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                DC Date
                              </td>
                              <td className="p-1 w-[8rem]">
                                :{" "}
                                {moment(workOrder.work_order_rc_dc_date).format(
                                  "DD-MM-YYYY",
                                )}
                              </td>
                            </tr>
                            <tr className="border-l border-r border-black">
                              <td className="font-semibold p-1 w-[8rem] border-r">
                                No of Box
                              </td>
                              <td className="p-1 w-[16rem] border-r">
                                : {workOrder.work_order_rc_box}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                Total Pcs
                              </td>
                              <td className="p-1 w-[8rem]">
                                : {workOrder.work_order_rc_pcs}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                Received By
                              </td>
                              <td className="p-1 w-[8rem]">
                                : {workOrder.work_order_rc_received_by}
                              </td>
                            </tr>
                            <tr className="border-l border-r border-b border-black">
                              <td className="font-semibold p-1 w-[8rem] border-r">
                                Work Order No
                              </td>
                              <td className="p-1 w-[16rem] border-r">
                                : {workOrder.work_order_rc_id}
                              </td>
                              <td className="font-semibold p-1 w-[6rem] text-right border-r">
                                Remarks
                              </td>
                              <td colSpan="3" className="p-1 break-words">
                                : {workOrder.work_order_rc_remarks}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            {/* Checkbox – hidden when printing */}
                            <div className="print-hidden-custom">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBox(box)}
                                className="w-4 h-4"
                              />
                            </div>
                            <h3 className="text-lg font-semibold">
                              Box (Total Pcs: {boxData.totalPcs})
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              Total Amount: ₹{totalAmount.toFixed(2)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/order-received/edit-order-received/${id}`,
                                )
                              }
                              className="h-8 w-8 p-0 print-hidden-custom"
                            >
                              <BarcodeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <table className="w-full border-collapse border border-black text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-black p-1 text-left">
                                Barcode
                              </th>
                              <th className="border border-black p-1 text-left">
                                Size
                              </th>
                              <th className="border border-black p-1 text-left">
                                Amount (₹)
                              </th>
                              <th className="border border-black p-1 text-right">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, idx) => (
                              <tr key={idx}>
                                <td className="border border-black p-1">
                                  {row.barcode}
                                </td>
                                <td className="border border-black p-1">
                                  {row.size}
                                </td>
                                <td className="border border-black p-1">
                                  {row.amount}
                                </td>
                                <td className="border border-black p-1 text-right">
                                  {row.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Page break element - only in print, between boxes */}
                      {/* {isChecked && !isLastChecked && (
                        <div className="print-page-break" />
                      )} */}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barcode Dialog */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Barcode Management - Box {selectedBox?.boxNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
            <div className="border rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Original Barcodes</h3>
                <div className="text-sm">
                  <span className="font-semibold">
                    Box: {selectedBox && formatBoxNumber(selectedBox.boxNumber)}
                  </span>
                  <span className="mx-2">/</span>
                  <span>Total Pcs: {selectedBox?.originalBarcodes.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {selectedBox?.originalBarcodes.map((barcode, index) => {
                    const matchStatus = getBarcodeMatchStatus(barcode);
                    const statusConfig = {
                      matched: {
                        bg: "bg-green-100",
                        border: "border-green-500",
                        text: "text-green-800",
                        icon: CheckCircle,
                      },
                      partial: {
                        bg: "bg-yellow-100",
                        border: "border-yellow-500",
                        text: "text-yellow-800",
                        icon: CheckCircle,
                      },
                      extra: {
                        bg: "bg-orange-100",
                        border: "border-orange-500",
                        text: "text-orange-800",
                        icon: XCircle,
                      },
                      missing: {
                        bg: "bg-red-100",
                        border: "border-red-500",
                        text: "text-red-800",
                        icon: XCircle,
                      },
                    };

                    const config = statusConfig[matchStatus];
                    const StatusIcon = config.icon;

                    return (
                      <div
                        key={`original-${barcode}-${index}`}
                        className={`p-3 rounded border text-sm font-mono ${config.bg} ${config.border} ${config.text}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span>
                              {index + 1}. {barcode}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded capitalize ${config.bg} ${config.text}`}
                          >
                            {matchStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">
                Scan & Add Barcodes
              </h3>

              {validationStatus && (
                <div
                  className={`p-3 rounded mb-4 ${
                    validationStatus.type === "success"
                      ? "bg-green-100 border border-green-500 text-green-800"
                      : validationStatus.type === "error"
                        ? "bg-red-100 border border-red-500 text-red-800"
                        : "bg-blue-100 border border-blue-500 text-blue-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validationStatus.type === "success" && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {validationStatus.type === "error" && (
                      <XCircle className="h-4 w-4" />
                    )}
                    {validationStatus.type === "validating" && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span className="text-sm">{validationStatus.message}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Input
                  value={currentInputValue}
                  onChange={handleBarcodeInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter barcode digit"
                  className="flex-1 uppercase font-mono"
                  disabled={loadingStates[selectedBox?.boxNumber]}
                />
                <Button
                  onClick={addBarcodeToBox}
                  disabled={
                    !currentInputValue.trim() ||
                    loadingStates[selectedBox?.boxNumber]
                  }
                  size="sm"
                >
                  {loadingStates[selectedBox?.boxNumber] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedBox?.currentBarcodes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedBox.currentBarcodes.map(
                      (barcode, barcodeIndex) => {
                        const duplicates = calculateBoxDuplicates(
                          selectedBox.currentBarcodes,
                        );
                        const isDuplicate = duplicates[barcode] > 1;
                        const matchStatus = getBarcodeMatchStatus(barcode);

                        return (
                          <div
                            key={`current-${barcode}-${barcodeIndex}`}
                            className={`bg-white p-2 rounded border text-sm flex items-center justify-between ${
                              isDuplicate
                                ? "border-amber-300 bg-amber-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <span className="text-gray-500 mr-2 w-6 text-right shrink-0">
                                {barcodeIndex + 1}.
                              </span>
                              <span
                                className="font-mono truncate"
                                title={barcode}
                              >
                                {barcode}
                              </span>
                              {isDuplicate && (
                                <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                                  Duplicate
                                </span>
                              )}
                              <span
                                className={`ml-2 text-xs px-2 py-1 rounded capitalize ${
                                  matchStatus === "matched"
                                    ? "bg-green-100 text-green-800"
                                    : matchStatus === "partial"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : matchStatus === "extra"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {matchStatus}
                              </span>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeBarcode(barcodeIndex)}
                              className="h-6 w-6 hover:bg-red-100 text-red-500 shrink-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-8">
                    No barcodes added yet
                  </p>
                )}

                {selectedBox &&
                  (() => {
                    const duplicates = calculateBoxDuplicates(
                      selectedBox.currentBarcodes,
                    );
                    const duplicateEntries = Object.entries(duplicates).filter(
                      ([_, count]) => count > 1,
                    );

                    if (duplicateEntries.length > 0) {
                      return (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <div className="font-medium text-amber-800 mb-1">
                            Duplicates Detected:
                          </div>
                          <div className="text-amber-700">
                            {duplicateEntries.map(([barcode, count]) => (
                              <span key={barcode} className="mr-2">
                                {barcode} × {count}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setBarcodeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={updateBoxBarcodes}
              disabled={updateOrderReceivedMutation.isPending}
            >
              {updateOrderReceivedMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Barcodes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this{" "}
              <span className="text-red-500">DC Receipt</span> and mark all
              materials as received?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCloseWorkOrder}
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.textColor} text-black hover:bg-red-600`}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default DcReceiptReceived;
