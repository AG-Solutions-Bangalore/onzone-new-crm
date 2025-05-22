import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import axios from "axios";
import { Download, Printer } from "lucide-react";
import moment from "moment";
import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const SalesDataReport = () => {
  const location = useLocation();
  const containerRef = useRef();
  const reportData = location.state?.reportsalesData;
  const formData = location.state?.formData;
  if (!reportData || !reportData.sales_data) {
    return (
      <Page>
        <p>No data available</p>
      </Page>
    );
  }
  const groupedData = reportData.sales_data.reduce((acc, item) => {
    acc[item.branch_name] = acc[item.branch_name] || [];
    acc[item.branch_name].push(item);
    return acc;
  }, {});

  const overallTotals = reportData.sales_data.reduce(
    (totals, item, index, arr) => {
      totals.bgs += Number(item.invoiceSub_item_bag || 0);
      totals.pkg += Number(item.invoiceSub_packing || 0);
      totals.qntyMT += Number(item.invoiceSub_qntyInMt || 0);
      totals.rate += Number(item.invoiceSub_rateMT || 0);
      if (index === 0 || arr[index - 1].invoice_ref !== item.invoice_ref) {
        totals.fobUSD += Number(item.invoice_i_value_fob || 0);
        totals.iValueUSD += Number(item.invoice_i_value_usd || 0);
        totals.iValueINR += Number(item.invoice_i_value_inr || 0);
      }
      return totals;
    },
    {
      bgs: 0,
      pkg: 0,
      qntyMT: 0,
      rate: 0,
      fobUSD: 0,
      iValueUSD: 0,
      iValueINR: 0,
    }
  );
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "apta",
    pageStyle: `
            @page {
               size: A4 landscape;
            margin: 5mm;
            
          }
          @media print {
            body {
              border: 0px solid #000;
                  font-size: 10px; 
              margin: 0mm;
              padding: 0mm;
              min-height: 100vh;
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

  const onSubmit = (e) => {
    e.preventDefault();

    axios({
      url: BASE_URL + "/api/panel-download-sales-data-report",
      method: "POST",
      data: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "sales_data.csv");
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Success",
          description: "Sales Data download successfully",
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
  return (
    <Page>
      <div ref={containerRef}>
        <div className="flex justify-between   items-center p-2 rounded-lg mb-5 bg-gray-200 ">
          <h1 className="text-xl font-bold">Sales Summary</h1>
          <div className="flex flex-row items-center gap-4 font-bold">
            <span className="mr-2">
              {" "}
              From -{moment(formData.from_date).format("DD-MMM-YYYY")}
            </span>
            To -{moment(formData.to_date).format("DD-MMM-YYYY")}
            <Button
              className={`ml-2  print:hidden ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={onSubmit}
            >
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button
              className={`ml-2  print:hidden ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={handlPrintPdf}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        <div>
          {Object.entries(groupedData).map(([branchName, invoices]) => (
            <div
              key={branchName}
              className="mb-6   border-l border-r border-black text-[11px]"
            >
              <h2 className="p-2 bg-gray-200 font-bold  border-r border-t border-black">
                {branchName}
              </h2>
              <div
                className="grid bg-white"
                style={{
                  gridTemplateColumns:
                    "minmax(50px, auto) minmax(75px, auto) minmax(150px, auto) minmax(150px, auto) minmax(100px, auto) minmax(100px, auto) minmax(60px, auto) minmax(80px, auto)  minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(70px, auto) minmax(60px, auto)  minmax(60px, auto) minmax(60px, auto) ",
                }}
              >
                {/* Header */}
                {[
                  "Invoice No",
                  "BL Date",
                  "Buyer",
                  "Consignee",
                  "Country",
                  "Port",
                  "Pdt",
                  "Item",

                  "Bgs",
                  "Pkg",
                  "Qnt(MT)",
                  "Rate",
                  "S B No ",
                  "Sb Date",
                  "FOB USD",

                  "I Value USD",
                  "I Value INR",
                ].map((header, idx) => (
                  <div
                    key={idx}
                    className="p-1 text-center font-bold border-b border-t  border-r border-black text-gray-900"
                  >
                    {header}
                  </div>
                ))}
                {/* Data Rows */}
                {invoices.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="p-2 border-b border-r border-black">
                      {/* {item.invoice_no} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_no
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black">
                      {/* {item.invoice_bl_date} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? moment(item.invoice_bl_date).format("DD-MM-YYYY")
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black">
                      {/* {item.invoice_buyer} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_buyer
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black">
                      {/* {item.invoice_consignee} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_consignee
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black">
                      {/* {item.invoice_destination_country} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_destination_country
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black ">
                      {/* {item.invoice_destination_port} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_destination_port
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black ">
                      {/* {item.invoice_product} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_product
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black ">
                      {item.invoiceSub_item_name}
                    </div>

                    <div className="p-2 border-b border-r border-black text-right">
                      {item.invoiceSub_item_bag}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right">
                      {item.invoiceSub_packing}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right">
                      {item.invoiceSub_qntyInMt}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right">
                      {item.invoiceSub_rateMT}
                    </div>
                    <div className="p-2 border-b border-r border-black text-left">
                      {/* {item.invoice_sb_no} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_sb_no
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black text-left">
                      {/* {item.invoice_sb_date} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? moment(item.invoice_sb_date).format("DD-MM-YYYY")
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right">
                      {/* {item.invoice_i_value_fob} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_i_value_fob
                        : ""}
                    </div>

                    <div className="p-2 border-b border-r border-black text-right">
                      {/* {item.invoice_i_value_usd} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_i_value_usd
                        : ""}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right">
                      {/* {item.invoice_i_value_inr} */}
                      {index === 0 ||
                      invoices[index - 1].invoice_ref !== item.invoice_ref
                        ? item.invoice_i_value_inr
                        : ""}
                    </div>
                  </React.Fragment>
                ))}
                {/* Branch Wise Total */}
                <div className="p-2 border-b  border-black font-bold"></div>
                <div className="p-2 border-b border-black"></div>
                <div className="p-2 border-b  border-black"></div>
                <div className="p-2 border-b  border-black"></div>
                <div className="p-2 border-b  border-black"></div>
                <div className="p-2 border-b  border-black"></div>
                <div className="p-2 border-b  border-black"></div>
                <div className="p-2 border-b border-r border-black font-bold">
                  Sub Total
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce(
                    (sum, item) => sum + Number(item.invoiceSub_item_bag || 0),
                    0
                  )}
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce(
                    (sum, item) => sum + Number(item.invoiceSub_packing || 0),
                    0
                  )}
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce(
                    (sum, item) => sum + Number(item.invoiceSub_qntyInMt || 0),
                    0
                  )}
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce(
                    (sum, item) => sum + Number(item.invoiceSub_rateMT || 0),
                    0
                  )}
                </div>
                <div className="p-2 border-b border-r border-black text-right"></div>
                <div className="p-2 border-b border-r border-black text-right"></div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce((sum, item, index, arr) => {
                    if (
                      index === 0 ||
                      arr[index - 1].invoice_ref !== item.invoice_ref
                    ) {
                      return sum + Number(item.invoice_i_value_fob || 0);
                    }
                    return sum;
                  }, 0)}
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce((sum, item, index, arr) => {
                    if (
                      index === 0 ||
                      arr[index - 1].invoice_ref !== item.invoice_ref
                    ) {
                      return sum + Number(item.invoice_i_value_usd || 0);
                    }
                    return sum;
                  }, 0)}
                </div>
                <div className="p-2 border-b border-r font-bold border-black text-right">
                  {invoices.reduce((sum, item, index, arr) => {
                    if (
                      index === 0 ||
                      arr[index - 1].invoice_ref !== item.invoice_ref
                    ) {
                      return sum + Number(item.invoice_i_value_inr || 0);
                    }
                    return sum;
                  }, 0)}
                </div>
              </div>
            </div>
          ))}

          {/* Overall Grand Total */}

          <div
            className="grid bg-gray-100 border-t border-l border-r border-black font-bold text-[11px]"
            style={{
              gridTemplateColumns:
                "minmax(50px, auto) minmax(75px, auto) minmax(150px, auto) minmax(150px, auto) minmax(100px, auto) minmax(100px, auto) minmax(60px, auto) minmax(80px, auto) minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(50px, auto) minmax(70px, auto) minmax(60px, auto) minmax(60px, auto) minmax(60px, auto)",
            }}
          >
            {/* Header */}
            {[
              "Invoice No",
              "BL Date",
              "Buyer",
              "Consignee",
              "Country",
              "Port",
              "Pdt",
              "Item",
              "Bgs",
              "Pkg",
              "Qnt(MT)",
              "Rate",
              "S B No ",
              "Sb Date",
              "FOB USD",
              "I Value USD",
              "I Value INR",
            ].map((header, idx) => (
              <div
                key={idx}
                className="p-2 border-b border-r border-black text-center font-bold"
              >
                {header}
              </div>
            ))}
            {/* Grand Total Row */}
            <div className="p-2 border-b  border-black font-bold"></div>
            <div className="p-2 border-b border-black"></div>
            <div className="p-2 border-b  border-black"></div>
            <div className="p-2 border-b  border-black"></div>
            <div className="p-2 border-b  border-black"></div>
            <div className="p-2 border-b  border-black"></div>
            <div className="p-2 border-b  border-black"></div>
            <div className="p-2 border-b border-r border-black font-bold text-center">
              Grand Total
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.bgs}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.pkg}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.qntyMT}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.rate}
            </div>
            <div className="p-2 border-b border-r border-black text-right"></div>
            <div className="p-2 border-b border-r border-black text-right"></div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.fobUSD}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.iValueUSD}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.iValueINR}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default SalesDataReport;
