import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { ChevronLeft, Barcode } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const OrderFormView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.orderData) {
      setOrderData(location.state.orderData);
      setIsLoading(false);
    } else {
      toast({
        title: "No Order Data",
        description: "No order data found. Please create an order first.",
        variant: "destructive",
      });
      navigate("/order-form");
    }
  }, [location, navigate, toast]);

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Page>
    );
  }

  const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItems = orderData.items.length;

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className="sm:hidden">
          <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-0 mb-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => navigate("/order-form")}
                    className="rounded-full p-1"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h1 className="text-base font-bold text-gray-800">
                    Order Details
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {orderData && (
            <div className="p-2">
              <div className="text-center font-semibold text-sm mb-2">
                ORDER FORM
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex justify-center border p-1">
                  <span className="font-medium">Date:</span>{" "}
                  <span className="ml-1">
                    {moment(orderData.order_form_date).format("DD-MMM-YYYY")}
                  </span>
                </div>
                <div className="flex justify-center border p-1">
                  <span className="font-medium">Reference No:</span>{" "}
                  <span className="ml-1">
                    {orderData.order_form_ref || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="border p-2 text-xs mb-3">
                <span className="font-semibold">Retailer:</span>{" "}
                <span>{orderData.order_form_retailer || 'Not specified'}</span>
              </div>

              <div className="border p-2 text-xs mb-3">
                <span className="font-semibold">Remarks:</span>{" "}
                <span>{orderData.order_form_remark || 'Not specified'}</span>
              </div>

              <table className="w-full border-collapse text-xs mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-left">Sl No</th>
                    <th className="border p-1 text-left">SKU</th>
                    <th className="border p-1 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border p-1 text-left">{index + 1}</td>
                      <td className="border p-1 text-left">
                        <div className="flex items-center">
                        
                          {item.barcode}
                        </div>
                      </td>
                      <td className="border p-1 text-right">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Table */}
              <table className="w-full border-collapse text-xs">
                <tbody>
                
                  <tr className="font-bold">
                    <td className="border p-1 text-right">Total Sets</td>
                    <td className="border p-1 text-right">{uniqueItems}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="border p-1 text-right">Total Items</td>
                    <td className="border p-1 text-right">{totalItems}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="hidden sm:block">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/order-form")}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-xl">Order Details</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <div className="text-center border-l border-t border-r p-4 space-y-1">
                  <h3 className="text-2xl font-semibold">ORDER FORM</h3>
                </div>

                <div className="grid grid-cols-2 border m-0">
                  <div className="flex items-center justify-center border-r border-gray-300 py-2 px-3">
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">
                      {moment(orderData.order_form_date).format("DD-MMM-YYYY")}
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-2 px-3">
                    <span className="font-medium">Reference No:</span>
                    <span className="ml-1">
                      {orderData.order_form_ref || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="border-l border-r p-2">
                  <span className="font-semibold">Retailer:</span>{" "}
                  <span>{orderData.order_form_retailer || 'Not specified'}</span>
                </div>

                <div className="border-l border-r p-2">
                  <span className="font-semibold">Remarks:</span>{" "}
                  <span>{orderData.order_form_remark || 'Not specified'}</span>
                </div>

                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-center text-black font-bold border-r">
                        Sl No
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r">
                        SKU
                      </TableHead>
                      <TableHead className="text-center text-black font-bold">
                        Quantity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderData.items.map((item, index) => (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-white "}
                      >
                        <TableCell className="text-center border-r">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-center border-r">
                          <div className="flex items-center justify-center">
                         
                            {item.barcode}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                   
                    <TableRow className="font-bold">
                      <TableCell
                        colSpan={2}
                        className="text-right bg-white font-medium border-r"
                      >
                        Total Sets
                      </TableCell>
                      <TableCell className="text-right bg-white">
                        {uniqueItems}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell
                        colSpan={2}
                        className="text-right bg-white font-medium border-r border-b"
                      >
                        Total Items
                      </TableCell>
                      <TableCell className="text-right bg-white border-b">
                        {totalItems}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default OrderFormView;