import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { ChevronLeft, Printer, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";

import { Button } from "@/components/ui/button";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import {
  LoaderComponent,
  ErrorComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useToast } from "@/hooks/use-toast";

const FairOrderFormView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderRef = useRef(null);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["fairOrderFormById", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/fairOrderFormById/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const handlePrint = useReactToPrint({
    content: () => orderRef.current,
    documentTitle: `Order_Form_${id}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .print-hide {
          display: none !important;
        }
      }
    `,
  });

  const handleDownloadPdf = () => {
    const element = orderRef.current;
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `Order_Form_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save().catch((err) => {
      toast({
        title: "PDF Generation Failed",
        description: err?.message || "Could not generate PDF",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return <LoaderComponent name="Fair Order Details" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error fetching order details"
        refetch={refetch}
      />
    );
  }

  // Extract nested properties flexibly
  const orderHeader =
    responseData?.fairOrderForm ||
    responseData?.data?.fairOrderForm ||
    responseData?.data ||
    responseData ||
    {};

  const subItems =
    responseData?.fairOrderSub ||
    responseData?.subs ||
    responseData?.data?.fairOrderSub ||
    responseData?.data?.subs ||
    orderHeader?.subs ||
    orderHeader?.fairOrderSub ||
    [];

  const orderDate = orderHeader?.fair_order_date
    ? moment(orderHeader.fair_order_date).format("DD-MMM-YYYY")
    : orderHeader?.created_at
    ? moment(orderHeader.created_at).format("DD-MMM-YYYY")
    : "-";

  const refNo =
    orderHeader?.fair_order_no ||
    orderHeader?.fair_order_ref_no ||
    `ORD/${id}/2024-25`;

  const totalSets = subItems.length;
  const totalItems = subItems.reduce((acc, item) => {
    const qty = parseFloat(item?.fair_order_sub_quantity || item?.quantity || 0);
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0);

  return (
    <Page>
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between print-hide pb-2 border-b">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Order Details</span>
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 text-xs"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
          </div>
        </div>

        {/* Printable Order Details Card Container */}
        <div
          ref={orderRef}
          className="bg-white border border-gray-300 rounded-sm p-0 shadow-sm text-gray-900 font-sans"
        >
          {/* Header */}
          <div className="border-b border-gray-300 py-3 text-center">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              ORDER FORM
            </h1>
          </div>

          {/* Date & Ref No row */}
          <div className="grid grid-cols-2 border-b border-gray-300 text-sm">
            <div className="p-2.5 border-r border-gray-300 text-center sm:text-left sm:pl-8">
              <span className="font-semibold">Date: </span>
              <span>{orderDate}</span>
            </div>
            <div className="p-2.5 text-center sm:text-left sm:pl-8">
              <span className="font-semibold">Ref No: </span>
              <span>{refNo}</span>
            </div>
          </div>

          {/* Retailer Info */}
          <div className="p-2.5 border-b border-gray-300 text-sm sm:pl-4">
            <span className="font-bold">Retailer: </span>
            <span>{orderHeader?.fair_order_retailer || "-"}</span>
            {orderHeader?.fair_order_gst_no && (
              <span className="ml-4 text-xs text-gray-600">
                (GST: {orderHeader.fair_order_gst_no})
              </span>
            )}
            {orderHeader?.fair_order_retailer_mobile && (
              <span className="ml-4 text-xs text-gray-600">
                (Mobile: {orderHeader.fair_order_retailer_mobile})
              </span>
            )}
          </div>

          {/* Remarks */}
          <div className="p-2.5 border-b border-gray-300 text-sm sm:pl-4">
            <span className="font-bold">Remarks: </span>
            <span>{orderHeader?.fair_order_remarks || "-"}</span>
          </div>

          {/* Items Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50/50">
                  <th className="py-2 px-4 text-center font-bold border-r border-gray-300 w-24">
                    Sl No
                  </th>
                  <th className="py-2 px-4 text-center font-bold border-r border-gray-300">
                    SKU
                  </th>
                  <th className="py-2 px-4 text-center font-bold w-32">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {subItems.length > 0 ? (
                  subItems.map((item, index) => {
                    const sku =
                      item?.fair_order_sub_barcode ||
                      item?.fair_order_sub_barcode_main ||
                      item?.fair_order_sub_dress_type ||
                      item?.barcode ||
                      item?.sku ||
                      "-";
                    const qty =
                      item?.fair_order_sub_quantity ?? item?.quantity ?? 0;
                    return (
                      <tr
                        key={item?.id || index}
                        className="border-b border-gray-300"
                      >
                        <td className="py-2 px-4 text-center border-r border-gray-300">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4 text-center border-r border-gray-300 font-medium">
                          {sku}
                        </td>
                        <td className="py-2 px-4 text-center">{qty}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="border-b border-gray-300">
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-b border-gray-300">
                  <td
                    colSpan={2}
                    className="py-2 px-4 text-right font-semibold border-r border-gray-300"
                  >
                    Total Sets
                  </td>
                  <td className="py-2 px-4 text-right font-bold pr-6">
                    {totalSets}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="py-2 px-4 text-right font-semibold border-r border-gray-300"
                  >
                    Total Items
                  </td>
                  <td className="py-2 px-4 text-right font-bold pr-6">
                    {totalItems}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default FairOrderFormView;
