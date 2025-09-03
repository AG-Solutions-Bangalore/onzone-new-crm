import React, { useRef, useState } from "react";
import Page from "../dashboard/page";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import ReactToPrint from "react-to-print";
import { Printer } from "lucide-react";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";

const DcReceiptReceived = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const componentRef = useRef(null);
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteWorkOrderId, setDeleteWorkOrderId] = useState(null);
  const location = useLocation();

  const { orderReceivedStatus } = location.state || {};

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dcreceipt", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-received-view-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return {
        workOrder: response.data.workorderrc || {},
        workOrderSub: response.data.workorderrcsub || [],
        workOrderFooter: response.data.workorderfooter || {},
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (workOrderId) => {
      const token = localStorage.getItem("token");
      return await axios.put(
        `${BASE_URL}/api/update-work-order-received-finish-by-id/${workOrderId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const confirmCloseWorkOrder = () => {
    if (deleteWorkOrderId) {
      updateMutation.mutate(deleteWorkOrderId);
      setDeleteWorkOrderId(null);
    }
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
  // const splitBarcodeData = (data, chunkSize = 9) => {
  //   const barcodes = data.split(",").map((b) => b.trim());
  //   const chunks = [];

  //   for (let i = 0; i < barcodes.length; i += chunkSize) {
  //     chunks.push(barcodes.slice(i, i + chunkSize).join(", "));
  //   }

  //   return chunks.map((chunk, index) => <div key={index}>{chunk}</div>);
  // };
  const splitBarcodeData = (data) => {
    const barcodes = data.split(",").map((b) => b.trim());
    
 
    const barcodeCounts = {};
    barcodes.forEach(barcode => {
      barcodeCounts[barcode] = (barcodeCounts[barcode] || 0) + 1;
    });
  
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(barcodeCounts).map(([barcode, count], index) => (
          <span key={index} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
            {barcode}
            {count > 1 && (
              <span className="ml-1 text-gray-600">(×{count})</span>
            )}
          </span>
        ))}
      </div>
    );
  };
  const { workOrder, workOrderSub } = data;

  const groupedBoxes = workOrderSub.reduce((acc, item) => {
    const boxNumber = item.work_order_rc_sub_box;
    if (!acc[boxNumber]) {
      acc[boxNumber] = {
        barcodes: [],
        totalPcs: 0,
      };
    }
    acc[boxNumber].barcodes.push(item.work_order_rc_sub_barcode);
    acc[boxNumber].totalPcs++;
    return acc;
  }, {});

  // Render box content dynamically
  const renderDynamicBoxContent = () => {
    return Object.entries(groupedBoxes).map(([boxNumber, boxData], index) =>
      renderBoxContent(
        boxNumber,
        boxData.totalPcs,
        boxData.barcodes.join(","),
        index
      )
    );
  };
  // Render box content with dynamic box number and piece count
  const renderBoxContent = (boxNumber, totalPcs, barcodeData, index) => (
    <div key={`box-${boxNumber}-${index}`} className=" mb-4 break-inside-avoid">
      {/* Box Details */}

      {/* Barcode Section */}
      <div className="border border-black p-1  ">
        <div className="flex flex-row items-center justify-between border  border-black p-2 mb-2">
          <span>Box: {boxNumber}</span>
          <span>Total No of Pcs: {totalPcs}</span>
        </div>
        <div className="p-1">{splitBarcodeData(barcodeData)}</div>
      </div>
    </div>
  );


 
  return (
    <Page>
      <div className="max-w-full mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Dc Receipt
              </CardTitle>
              {/* {orderReceivedStatus} */}
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
          </CardHeader>

          <CardContent className="p-4">
            <div ref={componentRef} className="bg-white rounded-lg print:p-4">
              {/* Main Details Table with Single Border */}
              <table className="w-full mb-1 border-collapse text-sm">
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
                        "DD-MM-YYYY"
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
                        "DD-MM-YYYY"
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
              {/* Render 3 boxes */}
              <div className="mt-4 space-y-4 ">{renderDynamicBoxContent()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
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
