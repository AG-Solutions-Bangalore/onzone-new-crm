import React, { useEffect, useRef, useState } from "react";
import Page from "../dashboard/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Mail, MessageCircle } from "lucide-react";
import html2pdf from "html2pdf.js";
// import logo from "../../../public/assets/AceB.png";
import BASE_URL from "@/config/BaseUrl";
import { useParams } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { decryptId } from "@/utils/encyrption/Encyrption";
const TestViewPrint = () => {
  const containerRef = useRef();
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const logoUrl = "/api/public/assets/images/letterHead/AceB.png";
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${BASE_URL}/api/panel-fetch-contract-by-id/${decryptedId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch contract data");
        }

        const data = await response.json();
        setContractData(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchContractData();
  }, [decryptedId]);

  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "contract-view",
    pageStyle: `
        @page {
        size: auto;
        margin: 0mm;
        
      }
      @media print {
        body {
          border: 0px solid #000;
          margin: 1mm;
          padding: 1mm;
          min-height: 100vh;
        }
        .print-hide {
          display: none;
        }
          .header-print {
        position: fixed;
        top: 0;
        left: 0;
         border: 2px solid #000;
        right: 0;
        height: 200px;

        background-color: white;
        z-index: 100;
      }
          div.content {
        
       
        -webkit-print-color-adjust: exact;
      }
     
      @page {
        margin-top: 200px;
      
      }
     
      .page-break {
        page-break-before: always;
  
           
      }

      }
      `,
  });

  const PrintHeader = () => (
    <div className="fixed   top-0 h-[200px] w-full bg-white hidden print:block">
      <img
        src="/api/public/assets/images/letterHead/AceB.png"
        alt="logo"
        className="w-full max-h-[120px] object-contain"
      />
      <h1 className="text-center text-[15px] underline font-bold mt-4">
        SALES CONTRACT
      </h1>
      <div className="p-4 flex items-center justify-between">
        <p>
          <span className="font-semibold text-[12px]">Cont No.:</span>
          {contractData?.contract?.contract_ref}
        </p>
        <p>
          <span className="font-semibold text-[12px]">DATE:</span>
          {contractData?.contract?.contract_date}
        </p>
      </div>
    </div>
  );
  if (loading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className=" h-4 w-4 animate-spin" />
            Loading contract Data
          </Button>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching contract Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Try Again</Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className=" flex w-full p-4 gap-2 relative ">
        <div className="w-[75%]">
          <div className="     ">
            <img
              src="/api/public/assets/images/letterHead/AceB.png"
              alt="logo"
              className="w-full"
            />
            <h1 className="text-center text-[15px] underline font-bold ">
              SALES CONTRACT
            </h1>
            <div className=" p-4 flex items-center justify-between">
              <p>
                <span className="font-semibold text-[12px]">Cont No.:</span>
                {contractData?.contract?.contract_ref}
              </p>
              <p>
                <span className="font-semibold text-[12px]">DATE:</span>{" "}
                {contractData?.contract?.contract_date}
              </p>
            </div>
          </div>

          <div
            ref={containerRef}
            className=" content page-break  min-h-screen font-normal "
          >
            {contractData && (
              <>
                <div className="max-w-4xl mx-auto    p-4">
                  <div className=" mb-6 flex items-center   justify-between   w-full gap-5">
                    <div className="  w-1/2 ">
                      <h2 className=" font-semibold  text-[12px]">
                        Buyer: {contractData?.contract?.contract_buyer}
                      </h2>
                      <div className="ml-4 text-[12px]">
                        {" "}
                        {contractData?.contract?.contract_buyer_add
                          ?.split(/(.{32})/)
                          .filter(Boolean)
                          .map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        {/* <p>HONG GUAN MARINE PRODUCTS PTE LTD</p>
                       <p>BLOCK 16, WHOLESALE CENTRE, #01-98</p>
                       <p>SINGAPORE</p> */}
                      </div>
                    </div>
                    <div className="   flex flex-col items-end   w-1/2  ">
                      <h2 className="font-semibold text-[12px] ">
                        CONSIGNEE:{contractData?.contract?.contract_consignee}
                      </h2>
                      <div className="   text-[12px] ">
                        {contractData?.contract?.contract_consignee_add
                          ?.split(/(.{32})/)
                          .filter(Boolean)
                          .map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white border border-gray-300 text-[12px] table-fixed">
                      <tbody className="divide-y divide-gray-200">
                        {contractData.contractSub.map((sub) => (
                          <tr key={sub.id}>
                            <td className="border w-[30%] text-[12px] border-black p-2 text-sm text-gray-900 break-words">
                              {sub.contractSub_marking}
                              {/* HGMPL ,Best, ,AAA, 25 KGS  // marking , item name */}
                            </td>
                            <td className="border w-[30%] text-[12px] border-black p-2 text-sm text-gray-900 break-words">
                              {sub.contractSub_descriptionofGoods}
                              {/* INDIAN GROUNDNUTS 80/90 (SOUTH NEW CROP) */}
                            </td>
                            <td className="border w-[20%] text-[12px] border-black p-2 text-sm text-gray-900 break-words">
                              {sub.contractSub_packing} KG NET IN{" "}
                              {sub.contractSub_bagsize} {sub.contractSub_sbaga}
                              {/* 25KG NET IN, 800 JUTE BAGS */}
                            </td>
                            <td className="border w-[10%] text-[12px] border-black p-2 text-sm text-gray-900 break-words">
                              {/* 20 MTRS */}
                              {sub.contractSub_qntyInMt} MTS
                            </td>
                            <td className="border w-[10%] text-[12px] border-black p-2 text-sm text-gray-900 break-words">
                              {sub.contractSub_rateMT} USD/MTS
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[12px] mt-4 ml-[2%] w-[98%] flex flex-col items-start ">
                    {/* Container */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Container</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_container_size}
                      </p>
                    </div>

                    {/* Specification */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">
                        Specification (If Any)
                      </span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract.contract_specification1}
                      </p>
                    </div>
                    {contractData?.contract?.contract_specification2 && (
                      <div className="flex items-center gap-4 w-full">
                        <span className="w-1/4 text-left"></span>
                        <span className="w-1 text-center">:</span>
                        <p className="w-3/4">
                          {contractData?.contract.contract_specification2}
                        </p>
                      </div>
                    )}

                    {/* Terms of Payment */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">TERMS OF PAYMENT</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_payment_terms}
                      </p>
                    </div>

                    {/* Shipper's Bank -- if ship_date is not avaiilbe than show remove - */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">SHIPPER'S BANK 2</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_ship_date}
                        {contractData?.contract?.contract_ship_date && " - "}

                        {contractData?.contract?.contract_shipment}
                      </p>
                    </div>
                  </div>

                  {/* <div className=" pt-4 mb-6">
                     <h2 className="font-bold">
                       CONSIGNEE:{contractData?.contract?.contract_consignee}
                     </h2>
                     <div className="ml-4">
                       {contractData?.contract?.contract_consignee_add
                         ?.split(/(.{32})/)
                         .filter(Boolean)
                         .map((line, index) => (
                           <p key={index}>{line}</p>
                         ))}
                 
                     </div>
                   </div> */}
                  <div className="text-[12px] mt-4 ml-[2%] w-[98%] flex flex-col items-start ">
                    {/* Shipment */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Shipment</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        ON OR BEFORE -{" "}
                        {contractData?.contract?.contract_ship_date}
                      </p>
                    </div>

                    {/* Part of Loading */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Port of Loading</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_loading}, INDIA
                      </p>
                    </div>

                    {/* Port of Discharge */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Port of Discharge</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_discharge},{" "}
                        {contractData?.contract?.contract_destination_country}
                      </p>
                    </div>
                  </div>

                  <div className="border-b w-fit text-[12px] ml-[2%]   font-semibold border-black pt-4 mb-4">
                    <p>
                      In Case of Shipment via Direct Vessel by Hyundai Liners:
                    </p>
                  </div>

                  <div className="text-[12px] mt-4 ml-[2%] w-[98%] flex flex-col items-start ">
                    {/* Port Of loading */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Port of Loading</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_loading}, INDIA
                      </p>
                    </div>
                    {/* Port of Discharge */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Port of Discharge</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_discharge},{" "}
                        {contractData?.contract?.contract_destination_country}
                      </p>
                    </div>

                    {/* Special Remarks */}
                    <div className="flex items-center gap-4 w-full">
                      <span className="w-1/4 text-left">Special Remarks</span>
                      <span className="w-1 text-center">:</span>
                      <p className="w-3/4">
                        {contractData?.contract?.contract_remarks}
                      </p>
                    </div>

                    {/* Documents */}
                    {/* <div className="flex items-center gap-4 w-full">
                       <span className="w-1/4 text-left">Documents</span>
                       <span className="w-1 text-center">:</span>
                       <p className="w-3/4">Lorem ipsum</p>
                     </div> */}
                  </div>

                  <div className="border-b w-fit mt-5 text-[12px] ml-[2%]   font-semibold border-black pt-4 mb-1">
                    <p>Kindly Mail your Purchase Order at the earliest.</p>
                  </div>

                  <div className="text-[12px] ml-[2%]  w-[98%] pt-4">
                    <p>Thanks & regards,</p>
                    <div className="flex items-center justify-between">
                      <p>For {contractData?.contract?.branch_name} (Seller)</p>
                      <p className=" mr-[22%]">(Buyer)</p>
                    </div>
                  </div>
                  <div className="text-[12px] ml-[2%]  w-[98%] pt-4">
                    <div className="flex justify-between mt-10">
                      <div className=" flex flex-col border-t-2 w-[18rem]  border-black items-center">
                        <p>{contractData?.branch?.branch_sign_name}</p>
                        <p>HP : {contractData?.branch?.branch_sign_no}</p>
                      </div>
                      <div className=" mr-[7%] flex flex-col border-t-2 w-[18rem]  border-black items-center">
                        <p>Accepted with Co Seal </p>
                        <p>{getTodayDate()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className=" w-[25%] flex flex-col shadow-lg shadow-blue-200  p-4">
          <Tabs defaultValue="header" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="header">Header</TabsTrigger>
            </TabsList>
            <TabsContent value="header">
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handlPrintPdf}
                  className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Page>
  );
};

export default TestViewPrint;
