import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Printer, FileText, FileDown, Search } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactToPrint from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import html2pdf from "html2pdf.js";

const formSchema = z.object({
  work_order_from_date: z.string().min(1, "From date is required"),
  work_order_to_date: z.string().min(1, "To date is required"),
  work_order_factory_no: z.string().optional(),
});



const WorkOrderReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useState(null);
  const defaultFromDate = "2024-01-01";


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      work_order_from_date: defaultFromDate,
      work_order_to_date: getTodayDate(),
      work_order_factory_no: "",
    },
  });

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ["workOrderReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { workorder: [] };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/fetch-work-order-report`,
        searchParams,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!searchParams,
  });

  const onSubmit = (data) => {
    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
        variant: "default",
      });
      return;
    }
    setSearchParams(data);
  };

  const handleDownloadCsv = async () => {
    try {
      if (!searchParams) return;

      const response = await axios.post(
        `${BASE_URL}/api/download-work-order-report`,
        searchParams,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "work_order.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Download Successful",
        description: "Work order report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download work order report",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5], 
      filename: "work-order-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowHeight: input.scrollHeight,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" },
    };
  
      html2pdf()
        .from(input)
        .set(options)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              `Page ${i} of ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 10
            );
          }
        })
        .save()
        .then(() => {
          toast({
            title: "PDF Generated",
            description: "Work order report saved as PDF",
          });
        });
    
  };
  return (
    <Page>
    <div className="max-w-full mx-auto">
    
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Work Order Report</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            <div className="space-y-1">
              <Label htmlFor="work_order_from_date">From Date</Label>
              <Input
                id="work_order_from_date"
                type="date"
                {...form.register("work_order_from_date")}
              />
              {form.formState.errors.work_order_from_date && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.work_order_from_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="work_order_to_date">To Date</Label>
              <Input
                id="work_order_to_date"
                type="date"
                {...form.register("work_order_to_date")}
              />
              {form.formState.errors.work_order_to_date && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.work_order_to_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="work_order_factory_no">Factory Number</Label>
              <Input
                id="work_order_factory_no"
                type="text"
                placeholder="Optional"
                {...form.register("work_order_factory_no")}
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                 {isLoading ? (
                                                   <>
                                                     <Loader2 className=" h-4 w-4 animate-spin" />
                                                     Generating Report...
                                                   </>
                                                 ) : (
                                                   <>
                                                     <Search className=" h-4 w-4" />
                                                     Generate Report
                                                   </>
                                                 )}
              </Button>
            </div>
          </form>
        </CardContent>

        {searchParams && (
          <>
            <CardHeader className="border-t">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                       <CardTitle className="text-lg flex flex-row items-center gap-2">
                          <span>
                          Report Results
                          </span>
       
       
                       {workOrders?.workorder?.length > 0 && (
                           <span className=" text-blue-800 text-xs  ">
                             {workOrders.workorder.length} records
                           </span>
                         )}
                       </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCsv}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                    )}
                    content={() => tableRef.current}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div ref={tableRef} className="overflow-x-auto print:p-4">
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-center">Work Order No</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">Factory</TableHead>
                      <TableHead className="text-center">Brand</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Order Count</TableHead>
                      <TableHead className="text-center">Total Receive</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders?.workorder?.length ? (
                      workOrders.workorder.map((order, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center border-r">
                            {order.work_order_no}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {moment(order.work_order_date).format("DD-MM-YYYY")}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {order.work_order_factory}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {order.work_order_brand}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {order.work_order_status}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {order.work_order_count}
                          </TableCell>
                          <TableCell className="text-center">
                            {order.total_receive}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                     <TableRow>
                                                          <TableCell
                                                            colSpan={7}
                                                            className="text-center py-12 text-gray-500"
                                                          >
                                                            {isLoading ? (
                                                              <div className="flex items-center justify-center gap-2">
                                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                                Loading work orders...
                                                              </div>
                                                            ) : (
                                                              <div className="space-y-2">
                                                                <div className="text-lg">📋</div>
                                                                <div>No work orders found for the selected criteria</div>
                                                                <div className="text-sm text-gray-400">
                                                                  Try adjusting your search parameters
                                                                </div>
                                                              </div>
                                                            )}
                                                          </TableCell>
                                                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
    </Page>
  );
};

export default WorkOrderReport;