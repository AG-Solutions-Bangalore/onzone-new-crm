import React, { useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  BuyerRDownload,
  BuyerRPrint,
} from "@/components/buttonIndex/ButtonComponents";
import { useReactToPrint } from "react-to-print";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const Buyer = () => {
  const containerRef = useRef();

  const { toast } = useToast();

  const fetchBuyerData = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BASE_URL}/api/panel-fetch-buyer-details-report`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.buyer;
  };

  const {
    data: buyerData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["buyerData"],
    queryFn: fetchBuyerData,
    // staleTime: Infinity,
  });

  //excel download
  const onSubmit = (e) => {
    e.preventDefault();

    axios({
      url: BASE_URL + "/api/panel-download-buyer-details-report",
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        console.log("data : ", res.data);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "buyer.csv");
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Success",
          description: "Buyer created successfully",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Product_Stock",
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 5mm;
      }
      @media print {
        body {
          font-size: 10px; 
          margin: 0mm;
          padding: 0mm;
        }
        table {
          font-size: 11px;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });

  if (isLoading) {
    return <LoaderComponent name="Buyer Summary Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Buyer Summary
 Data"
        refetch={refetch}
      />
    );
  }

  return (
    <Page>
      <div className="p-4">
        <div className="flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
          <h1 className="text-xl font-bold">Buyer Summary</h1>
          <div className="flex flex-row items-center gap-4">
            <div>
              {" "}
              <BuyerRPrint
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              />
              <BuyerRDownload
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={onSubmit}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto text-[11px]" ref={containerRef}>
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="border border-black px-2 py-2 text-left"
                  colSpan={7}
                >
                  Buyer Summary{" "}
                </th>
              </tr>
              <tr>
                <th className="border border-black px-2 py-2 text-center">
                  Sort
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Group
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Buyer Name
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Address
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Port
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Country
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {buyerData.map((buyer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_sort}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_group}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_name}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_address}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_port}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_country}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {buyer.buyer_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default Buyer;
