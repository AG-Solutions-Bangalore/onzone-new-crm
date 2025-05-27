import React, {  useRef } from "react";

import {  useQuery } from "@tanstack/react-query";
import axios from "axios";

import ReactToPrint from "react-to-print";
import { Printer, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import {  useNavigate, useParams } from "react-router-dom";

import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import Page from "@/app/dashboard/page";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import html2pdf from "html2pdf.js";
const RetailerReport = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const tableRef = useRef(null);
  const navigate = useNavigate();





  const { data: retailerView, isLoading, isError, refetch } = useQuery({
    queryKey: ["dcreceipt", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-customer-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.customer
    },
  });

 

  const handleSavePDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5], 
      filename: "retailer-report.pdf",
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
            description: "Retailer order report saved as PDF",
          });
        });
    
  };
  const handleDownload = async () => {
    try {


      const response = await axios.post(
        `${BASE_URL}/api/download-customer-report`,
        {},
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
      link.setAttribute("download", "retailer_report.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Download Successful",
        description: "Retailer order report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download retailer order report",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoaderComponent name="Retailer Report Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching   Retailer Report Data"
        refetch={refetch}
      />
    );
  }


  return (
    <Page>
      <div className="max-w-full mx-auto">

        <Card className="shadow-sm">






          <CardHeader className="border-t ">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
              <CardTitle className="text-lg flex flex-row items-center  gap-2">
                <span>
                  Report Results
                </span>


                {retailerView?.length > 0 && (
                  <span className=" text-blue-800 text-xs  ">
                    {retailerView.length} records
                  </span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePDF}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <ReactToPrint
                  trigger={() => (
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  )}
                  content={() => tableRef.current}
                  pageStyle={`
                                      @page {
                                        size: A4 ;
                                        margin: 2mm;
                                      }
                                      @media print {
                                        body { margin: 2mm !important; }
                                        table { width: 100%; border-collapse: collapse; font-size: 10pt; }
                                        th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
                                      }
                                    `}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div ref={tableRef} className="overflow-x-auto">
              <Table className="w-full border">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="text-center ">
                      Retailer
                    </TableHead>
                    <TableHead className="text-center ">
                      Type
                    </TableHead>
                    <TableHead className="text-center ">
                      Mobile
                    </TableHead>
                    <TableHead className="text-center ">
                      Email
                    </TableHead>
                    <TableHead className="text-center ">
                      Address
                    </TableHead>
                    <TableHead className="text-center ">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailerView?.length ? (
                    retailerView.map((order, index) => (
                      <TableRow
                        key={index}
                        className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                      >
                        <TableCell className="text-center border-r ">
                          {order.customer_name}
                        </TableCell>

                        <TableCell className="text-center border-r">
                          {order.customer_type}
                        </TableCell>
                        <TableCell className="text-center border-r">
                          {order.customer_mobile}
                        </TableCell>
                        <TableCell className="text-center border-r">
                          {order.customer_email}
                        </TableCell>
                        <TableCell className="text-center border-r">
                          {order.customer_address}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.customer_status}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-gray-500"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading sales orders...
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-lg">📋</div>
                            <div>No sales orders found for the selected criteria</div>
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


        </Card>
      </div>
    </Page>
  )
}

export default RetailerReport