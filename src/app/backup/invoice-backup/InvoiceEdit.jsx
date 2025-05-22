import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gsap } from "gsap";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Select from "react-select";
import {
  PlusCircle,
  MinusCircle,
  Settings2,
  Trash2,
  ChevronDown,
  Loader2,
  FileText,
  Package,
  TestTubes,
  Truck,
  ChevronUp,
  Clock,
} from "lucide-react";
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
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import BASE_URL from "@/config/BaseUrl";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import {
  useFetchBagsTypes,
  useFetchBuyers,
  useFetchCompanys,
  useFetchContainerSizes,
  useFetchCountrys,
  useFetchDescriptionofGoods,
  useFetchItemNames,
  useFetchMarkings,
  useFetchPaymentTerms,
  useFetchPortofLoadings,
  useFetchPorts,
  useFetchProduct,
  useFetchStatus,
} from "@/hooks/useApi";
import { ButtonConfig } from "@/config/ButtonConfig";
import { decryptId, encryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import moment from "moment";

// API functions

const fetchDefaultSetting = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-default-setting`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch Product no data");
  return response.json();
};

const fetchLUT = async (value) => {
  if (!value) {
    throw new Error("Invalid value provided");
  }
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-scheme-by-value/${value}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch LUT data");
  return response.json();
};
const fetchContractData = async (value) => {
  if (!value) {
    throw new Error("Invalid value provided");
  }
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-contract-by-ref`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contract_ref: value }),
  });

  if (!response.ok) throw new Error("Failed to fetch contract data");
  return response.json();
};
const fetchGRCode = async (value) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-grcode/${value}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch GR Code data");

  return response.json();
};

const fetchPrereceipts = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-prereceipts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch Product no data");
  return response.json();
};

const fetchContractRef = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-contract-ref`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch Contract ref data");
  return response.json();
};

const fetchProductCustomDescription = async (value) => {
  if (!value) {
    throw new Error("Invalid value provided");
  }
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-product-description/${value}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch Container Size no data");

  return response.json();
};

const updateInvoice = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-invoice/${decryptedId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to update contract");
  return response.json();
};

const MemoizedSelect = React.memo(
  ({ value, onChange, options, placeholder }) => {
    const selectOptions = options.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    const selectedOption = selectOptions.find(
      (option) => option.value === value
    );

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        minHeight: "36px",
        borderRadius: "6px",
        borderColor: state.isFocused ? "black" : "#e5e7eb",
        boxShadow: state.isFocused ? "black" : "none",
        "&:hover": {
          borderColor: "none",
          cursor: "text",
        },
      }),
      option: (provided, state) => ({
        ...provided,
        fontSize: "14px",
        backgroundColor: state.isSelected
          ? "#A5D6A7"
          : state.isFocused
          ? "#f3f4f6"
          : "white",
        color: state.isSelected ? "black" : "#1f2937",
        "&:hover": {
          backgroundColor: "#EEEEEE",
          color: "black",
        },
      }),

      menu: (provided) => ({
        ...provided,
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#616161",
        fontSize: "14px",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "black",
        fontSize: "14px",
      }),
    };

    const DropdownIndicator = (props) => {
      return (
        <div {...props.innerProps}>
          <ChevronDown className="h-4 w-4 mr-3 text-gray-500" />
        </div>
      );
    };

    return (
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        options={selectOptions}
        placeholder={placeholder}
        styles={customStyles}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
        }}
        // menuPortalTarget={document.body}
        //   menuPosition="fixed"
      />
    );
  }
);

const MemoizedProductSelect = React.memo(
  ({ value, onChange, options, placeholder }) => {
    const selectOptions = options.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    const selectedOption = selectOptions.find(
      (option) => option.value === value
    );

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        minHeight: "36px",
        borderRadius: "6px",
        borderColor: state.isFocused ? "black" : "#e5e7eb",
        boxShadow: state.isFocused ? "black" : "none",
        "&:hover": {
          borderColor: "none",
          cursor: "text",
        },
      }),
      option: (provided, state) => ({
        ...provided,
        fontSize: "14px",
        backgroundColor: state.isSelected
          ? "#A5D6A7"
          : state.isFocused
          ? "#f3f4f6"
          : "white",
        color: state.isSelected ? "black" : "#1f2937",
        "&:hover": {
          backgroundColor: "#EEEEEE",
          color: "black",
        },
      }),

      menu: (provided) => ({
        ...provided,
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#616161",
        fontSize: "14px",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "black",
        fontSize: "14px",
      }),
    };

    const DropdownIndicator = (props) => {
      return (
        <div {...props.innerProps}>
          <ChevronDown className="h-4 w-4 mr-3 text-gray-500" />
        </div>
      );
    };

    return (
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        options={selectOptions}
        placeholder={placeholder}
        styles={customStyles}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
        }}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    );
  }
);
const InvoiceEdit = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saveAndViewLoading, setSaveAndViewLoading] = useState(false);
  const [showDischargeAndCIF, setShowDischargeAndCIF] = useState(false);
  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",
    invoice_year: "",
    invoice_date: "",
    invoice_no: "",
    invoice_ref: "",
    contract_date: "",
    contract_ref: "",
    contract_pono: "",
    invoice_buyer: "",
    invoice_buyer_add: "",
    invoice_consignee: "",
    invoice_consignee_add: "",
    invoice_container_size: "",
    invoice_loading: "",
    invoice_destination_port: "",
    invoice_discharge: "",
    invoice_cif: "",
    invoice_destination_country: "",
    invoice_payment_terms: "",
    invoice_remarks: "",
    invoice_product: "",
    invoice_consig_bank: "",
    invoice_prereceipts: "",
    invoice_precarriage: "",
    invoice_product_cust_des: "",
    invoice_gr_code: "",
    invoice_lut_code: "",
    invoice_status: "Order in Hand",
    invoice_consig_bank_address: "",
  });
  const [invoiceData, setInvoiceData] = useState([]);

  const {
    data: invoiceDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["invoicess", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-invoice-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
  });

  useEffect(() => {
    if (invoiceDatas) {
      setFormData({
        branch_short: invoiceDatas.invoice.branch_short,
        branch_name: invoiceDatas.invoice.branch_name,
        branch_address: invoiceDatas.invoice.branch_address,
        invoice_year: invoiceDatas.invoice.invoice_year,
        contract_date: invoiceDatas.invoice.contract_date,
        invoice_date: invoiceDatas.invoice.invoice_date,
        invoice_no: invoiceDatas.invoice.invoice_no,
        contract_ref: invoiceDatas.invoice.contract_ref,
        invoice_ref: invoiceDatas.invoice.invoice_ref,
        contract_pono: invoiceDatas.invoice.contract_pono,
        invoice_buyer: invoiceDatas.invoice.invoice_buyer,
        invoice_buyer_add: invoiceDatas.invoice.invoice_buyer_add,
        invoice_consignee: invoiceDatas.invoice.invoice_consignee,
        invoice_consignee_add: invoiceDatas.invoice.invoice_consignee_add,
        invoice_consig_bank: invoiceDatas.invoice.invoice_consig_bank,
        invoice_consig_bank_address:
          invoiceDatas.invoice.invoice_consig_bank_address,
        invoice_product: invoiceDatas.invoice.invoice_product,
        invoice_container_size: invoiceDatas.invoice.invoice_container_size,
        invoice_loading: invoiceDatas.invoice.invoice_loading,
        invoice_destination_port: invoiceDatas.invoice.invoice_destination_port,
        invoice_discharge: invoiceDatas.invoice.invoice_discharge,
        invoice_cif: invoiceDatas.invoice.invoice_cif,
        invoice_destination_country:
          invoiceDatas.invoice.invoice_destination_country,

        invoice_payment_terms: invoiceDatas.invoice.invoice_payment_terms,
        invoice_remarks: invoiceDatas.invoice.invoice_remarks,
        invoice_status: invoiceDatas.invoice.invoice_status,
        invoice_prereceipts: invoiceDatas.invoice.invoice_prereceipts,
        invoice_precarriage: invoiceDatas.invoice.invoice_precarriage,
        invoice_product_cust_des: invoiceDatas.invoice.invoice_product_cust_des,
        invoice_gr_code: invoiceDatas.invoice.invoice_gr_code,
        invoice_lut_code: invoiceDatas.invoice.invoice_lut_code,
        contract_data: invoiceDatas.invoiceSub,
      });
      setInvoiceData(invoiceDatas.invoiceSub);
    }
  }, [invoiceDatas]);

  // const { data: defaultSettingData } = useQuery({
  //   queryKey: ["defaultCustomProduct",formData.contract_ref],
  //   queryFn: fetchDefaultSetting,
  //   enabled: !!formData.contract_ref,
  // });

  const { data: lutData } = useQuery({
    queryKey: ["lut", formData.branch_short], // Include branch_short as a dependency
    queryFn: () => {
      const selectedBranch = branchData?.branch?.find(
        (branch) => branch.branch_short === formData.branch_short
      );
      if (selectedBranch?.branch_scheme) {
        return fetchLUT(selectedBranch.branch_scheme);
      }
      return null;
    },
    enabled: !!formData.branch_short, // Only run the query when branch_short is selected
  });

  const { data: grcodeData } = useQuery({
    queryKey: ["grCode", formData.invoice_product],
    queryFn: () => fetchGRCode(formData.invoice_product),
    enabled: !!formData.invoice_product,
  });
  const { data: prereceiptsData } = useQuery({
    queryKey: ["prereceipts"],
    queryFn: fetchPrereceipts,
  });

  const { data: contractRefsData } = useQuery({
    queryKey: ["contractRefs"],
    queryFn: fetchContractRef,
  });

  const { data: productCustomDescriptionData } = useQuery({
    queryKey: ["pCustomDescription", formData.invoice_product],
    queryFn: () => fetchProductCustomDescription(formData.invoice_product),
    enabled: !!formData.invoice_product,
  });

  const { data: buyerData } = useFetchBuyers();
  const { data: branchData } = useFetchCompanys();
  const { data: portofLoadingData } = useFetchPortofLoadings();

  const { data: paymentTermsData } = useFetchPaymentTerms();
  const { data: countryData } = useFetchCountrys();
  const { data: markingData } = useFetchMarkings();
  const { data: itemNameData } = useFetchItemNames();
  const { data: descriptionofGoodseData } = useFetchDescriptionofGoods();
  const { data: bagTypeData } = useFetchBagsTypes();
  const { data: portsData } = useFetchPorts();
  const { data: productData } = useFetchProduct();
  const { data: containerSizeData } = useFetchContainerSizes();
  const { data: statusData } = useFetchStatus();

  const updateInvoiceMutation = useMutation({
    mutationFn: updateInvoice,
    // onSuccess: () => {
    //   toast({
    //     title: "Success",
    //     description: "Invoice updated successfully",
    //   });
    //   navigate("/invoice");
    // },
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/invoice");
      } else if (response.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: response.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: response.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e, field) => {
    let value;
    value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSelectChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const updatedFormData = { ...prev, [field]: value };

        // Handle invoice_buyer field
        if (field === "invoice_buyer") {
          const selectedBuyer = buyerData?.buyer?.find(
            (buyer) => buyer.buyer_name === value
          );
          if (selectedBuyer) {
            updatedFormData.invoice_buyer_add = selectedBuyer.buyer_address;
          }
        }

        // Handle invoice_consignee field
        if (field === "invoice_consignee") {
          const selectedConsignee = buyerData?.buyer?.find(
            (buyer) => buyer.buyer_name === value
          );
          if (selectedConsignee) {
            updatedFormData.invoice_consignee_add =
              selectedConsignee.buyer_address;
          }
        }

        // Handle invoice_consig_bank field
        if (field === "invoice_consig_bank") {
          const selectedConsigBank = buyerData?.buyer?.find(
            (buyer) => buyer.buyer_name === value
          );
          if (selectedConsigBank) {
            updatedFormData.invoice_consig_bank_address =
              selectedConsigBank.buyer_address;
          }
        }
        // Handle contract_ref field
        if (field === "contract_ref") {
          fetchContractData(value).then((data) => {
            const { contract, contractSub } = data;

            // Update form data with contract details
            const updatedFormDataWithContract = {
              ...updatedFormData,
              branch_short: contract.branch_short,
              branch_name: contract.branch_name,
              branch_address: contract.branch_address,
              contract_date: contract.contract_date,
              contract_pono: contract.contract_pono,
              invoice_buyer: contract.contract_buyer,
              invoice_buyer_add: contract.contract_buyer_add,
              invoice_consignee: contract.contract_consignee,
              invoice_consignee_add: contract.contract_consignee_add,
              invoice_container_size: contract.contract_container_size,
              invoice_product: contract.contract_product,
              invoice_loading: contract.contract_loading,
              invoice_destination_port: contract.contract_destination_port,
              invoice_discharge: contract.contract_discharge,
              invoice_cif: contract.contract_cif,
              invoice_destination_country:
                contract.contract_destination_country,
              invoice_payment_terms: contract.contract_payment_terms,
              invoice_remarks: contract.contract_remarks,
              invoice_no: contract.contract_no.toString(),
            };
            if (
              contract.branch_short &&
              updatedFormDataWithContract.invoice_no &&
              updatedFormDataWithContract.invoice_year
            ) {
              const selectedCompanySort = branchData?.branch?.find(
                (branch) => branch.branch_short === contract.branch_short
              );
              if (selectedCompanySort) {
                const invoiceRef = `${selectedCompanySort.branch_name_short}${updatedFormDataWithContract.invoice_no}${updatedFormDataWithContract.invoice_year}`;
                updatedFormDataWithContract.invoice_ref = invoiceRef;
              }
            }

            // Update the form data state
            setFormData(updatedFormDataWithContract);

            // Map and set invoice data
            const mappedInvoiceData = contractSub.map((sub) => ({
              invoiceSub_item_bag: sub.contractSub_item_bag,
              invoiceSub_item_name: sub.contractSub_item_name,
              invoiceSub_marking: sub.contractSub_marking,
              invoiceSub_descriptionofGoods: sub.contractSub_descriptionofGoods,
              invoiceSub_packing: sub.contractSub_packing,
              invoiceSub_bagsize: sub.contractSub_bagsize,
              invoiceSub_qntyInMt: sub.contractSub_qntyInMt,
              invoiceSub_rateMT: sub.contractSub_rateMT,
              invoiceSub_sbaga: sub.contractSub_sbaga,
            }));
            setInvoiceData(mappedInvoiceData);
          });
        }
        // Handle branch_short field
        if (field === "branch_short") {
          const selectedCompanySort = branchData?.branch?.find(
            (branch) => branch.branch_short === value
          );
          if (selectedCompanySort) {
            updatedFormData.branch_name = selectedCompanySort.branch_name;
            updatedFormData.branch_address = selectedCompanySort.branch_address;

            const selectedBuyer = buyerData?.buyer?.find(
              (buyer) => buyer.buyer_name == prev.invoice_buyer
            );
            if (selectedBuyer) {
              const invoiceRef = `${selectedCompanySort.branch_name_short}${prev.invoice_no}${prev.invoice_year}`;
              updatedFormData.invoice_ref = invoiceRef;
            }
          }
        }

        return updatedFormData;
      });
    },
    [
      branchData,
      buyerData,
      formData.invoice_no,
      formData.invoice_buyer,
      formData,
    ]
  );

  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    const numericFields = [
      "invoiceSub_bagsize",
      "invoiceSub_qntyInMt",
      "invoiceSub_packing",
      "invoiceSub_rateMT",
      "invoiceSub_item_bag",
    ];

    if (numericFields.includes(field)) {
      const sanitizedValue = value.replace(/[^\d.]/g, "");
      const decimalCount = (sanitizedValue.match(/\./g) || []).length;

      if (decimalCount > 1) return;

      setInvoiceData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: sanitizedValue,
        };
        return newData;
      });
    } else {
      setInvoiceData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: value,
        };
        return newData;
      });
    }
  }, []);

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        invoiceSub_item_bag: "",
        invoiceSub_item_name: "",
        invoiceSub_marking: "",
        invoiceSub_descriptionofGoods: "",
        invoiceSub_packing: "",
        invoiceSub_bagsize: "",
        invoiceSub_qntyInMt: "",
        invoiceSub_rateMT: "",
        invoiceSub_sbaga: "",
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (invoiceData.length > 1) {
        setInvoiceData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceData.length]
  );

  const fieldLabels = {
    branch_short: "Company Short",
    branch_name: "Company Name",
    branch_address: "Company Address",
    invoice_year: "Invoice Year",
    invoice_date: "Invoice Date",
    invoice_no: "Invoice No",
    invoice_ref: "Invoice Ref",
    contract_date: "Contract Date",
    contract_ref: "Contract Ref",
    contract_pono: "Contract PONO",
    invoice_buyer: "Buyer",
    invoice_buyer_add: "Buyer Address",
    invoice_product: "Product",
    invoice_consignee: "Consignee",
    invoice_consignee_add: "Consignee Address",
    invoice_container_size: "Container Size",
    invoice_loading: "Port of Loading",
    invoice_destination_port: "Destination Port",
    invoice_discharge: "Discharge",
    invoice_cif: "CIF",
    invoice_destination_country: "Destination Country",
    invoice_payment_terms: "Payment Terms",
    invoice_remarks: "Remarks",
    invoice_consig_bank: "Consig Bank",
    invoice_consig_bank_address: "Consig Bank Address",
    invoice_prereceipts: "Pre-Receipts",
    invoice_precarriage: "Precarriage",
    invoice_product_cust_des: "Product Custom Description",
    invoice_gr_code: "GR Code",
    invoice_lut_code: "LUT Code",
    invoice_data: "Invoice Data",
    invoiceSub_item_name: "Item Name",
    invoiceSub_descriptionofGoods: "Item Description",
    invoiceSub_bagsize: "Bag Size",
    invoiceSub_packing: "Packing",
    invoiceSub_item_bag: "Item Bag",
    invoiceSub_qntyInMt: "Quantity (MT)",
    invoiceSub_rateMT: "Rate (MT)",
    invoiceSub_sbaga: "Bag Type",
    invoiceSub_marking: "Marking",
  };
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-delete-invoice-sub/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete contract Table");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice Table deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteItemId);
      setInvoiceData((prevData) =>
        prevData.filter((row) => row.id !== deleteItemId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const processedContractData = invoiceData.map((row) => ({
        ...row,
        invoiceSub_item_bag: parseFloat(row.invoiceSub_item_bag),
        invoiceSub_qntyInMt: parseFloat(row.invoiceSub_qntyInMt),
        invoiceSub_rateMT: parseFloat(row.invoiceSub_rateMT),
        invoiceSub_packing: parseFloat(row.invoiceSub_packing),
        invoiceSub_bagsize: parseFloat(row.invoiceSub_bagsize),
      }));

      const updateData = {
        ...formData,
        invoice_data: processedContractData,
      };
      const res = await updateInvoiceMutation.mutateAsync({
        decryptedId,
        data: updateData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleSaveAndView = async (e) => {
    e.preventDefault();
    setSaveAndViewLoading(true);
    try {
      const processedContractData = invoiceData.map((row) => ({
        ...row,
        invoiceSub_item_bag: parseFloat(row.invoiceSub_item_bag),
        invoiceSub_qntyInMt: parseFloat(row.invoiceSub_qntyInMt),
        invoiceSub_rateMT: parseFloat(row.invoiceSub_rateMT),
        invoiceSub_packing: parseFloat(row.invoiceSub_packing),
        invoiceSub_bagsize: parseFloat(row.invoiceSub_bagsize),
      }));

      const updateData = {
        ...formData,
        invoice_data: processedContractData,
      };

      const response = await updateInvoiceMutation.mutateAsync({
        decryptedId,
        data: updateData,
      });

      if (response.code == 200) {
        // navigate(`/view-invoice/${decryptedId}`);

        const encryptedId = encryptId(decryptedId);

        navigate(`/view-invoice/${encodeURIComponent(encryptedId)}`);
      } else {
        toast({
          title: "Error",
          description: response.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaveAndViewLoading(false);
    }
  };
  if (isLoading) {
    return <LoaderComponent name="Invoice Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent message="Error Fetching Invoice Data" refetch={refetch} />
    );
  }
  const CompactViewSection = ({ invoiceDatas }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const InfoItem = ({ icon: Icon, label, value }) => (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-yellow-600 shrink-0" />
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium">{value || "N/A"}</span>
      </div>
    );

    const toggleView = () => {
      const content = contentRef.current;

      if (isExpanded) {
        // Folding animation
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          transformOrigin: "top",
          transformStyle: "preserve-3d",
          rotateX: -90,
          onComplete: () => setIsExpanded(false),
        });
      } else {
        // Unfolding animation
        setIsExpanded(true);
        gsap.fromTo(
          content,
          {
            height: 0,
            opacity: 0,
            rotateX: -90,
          },
          {
            height: "auto",
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            transformOrigin: "top",
            transformStyle: "preserve-3d",
            rotateX: 0,
          }
        );
      }
    };

    const TreatmentInfo = () =>
      invoiceDatas?.invoice?.branch_short && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <InfoItem
              icon={Clock}
              label="Invoice Date"
              value={
                <Input
                  type="date"
                  value={formData.invoice_date}
                  className="bg-white"
                  onChange={(e) => handleInputChange(e, "invoice_date")}
                />
              }
            />
            <div className=" col-span-2">
              <InfoItem
                icon={TestTubes}
                label="Branch Add"
                value={invoiceDatas.invoice.branch_address}
              />
            </div>
          </div>
        </div>
      );

    return (
      <Card className="mb-2 " ref={containerRef}>
        <div
          className={`p-4 ${ButtonConfig.cardColor} flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold  flex items-center gap-2">
            <p className="flex gap-1 relative items-center">
              {" "}
              <FileText className="h-5 w-5" />
              {invoiceDatas?.invoice?.invoice_ref} -
              <span className="text-sm uppercase">
                {invoiceDatas?.invoice?.branch_short}
              </span>
              <span className=" absolute top-4 left-6 text-[9px]  bg-inherit ">
                {invoiceDatas.invoice.branch_name}
              </span>
            </p>
          </h2>

          <div className="flex items-center gap-2">
            <span className=" flex items-center gap-2    text-xs font-medium  text-yellow-800 ">
              {/* {invoiceDatas?.invoice?.invoice_status} */}
              <MemoizedSelect
                value={formData.invoice_product}
                onChange={(value) =>
                  handleSelectChange("invoice_product", value)
                }
                options={
                  productData?.product?.map((product) => ({
                    value: product.product_name,
                    label: product.product_name,
                  })) || []
                }
                placeholder="Select Product"
              />
              <MemoizedSelect
                value={formData.invoice_status}
                onChange={(value) =>
                  handleSelectChange("invoice_status", value)
                }
                options={
                  statusData?.invoiceStatus?.map((status) => ({
                    value: status.invoice_status,
                    label: status.invoice_status,
                  })) || []
                }
                placeholder="Select Status"
              />
            </span>

            {isExpanded ? (
              <ChevronUp
                onClick={toggleView}
                className="h-5 w-5 cursor-pointer  text-yellow-600"
              />
            ) : (
              <ChevronDown
                onClick={toggleView}
                className="h-5 w-5 cursor-pointer  text-yellow-600"
              />
            )}
          </div>
        </div>
        <div
          ref={contentRef}
          className="transform-gpu"
          style={{ transformStyle: "preserve-3d" }}
        >
          <CardContent className="p-4">
            {/* Basic Info */}

            <div className="space-y-2 flex items-center justify-between">
              <InfoItem
                icon={FileText}
                label="Contract Ref"
                value={invoiceDatas?.invoice?.contract_ref}
              />
              <InfoItem
                icon={Package}
                label="Invoice No"
                value={invoiceDatas?.invoice?.invoice_no}
              />

              <InfoItem
                icon={TestTubes}
                label="Contract Date"
                value={moment(invoiceDatas?.invoice?.contract_date).format("DD-MM-YYYY")}
              />
              <InfoItem
                icon={Truck}
                label="Contract PONO"
                value={invoiceDatas?.invoice?.contract_pono}
              />
            </div>

            <TreatmentInfo />

            {/* Products Table */}
          </CardContent>
        </div>
      </Card>
    );
  };
  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4 bg-blue-50/30">
        {/* <EnquiryHeader progress={progress} /> */}
        <CompactViewSection invoiceDatas={invoiceDatas} />

        <Card className={`    ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="mb-0">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Buyer <span className="text-red-500">*</span>
                  </label>

                  <MemoizedSelect
                    value={formData.invoice_buyer}
                    onChange={(value) =>
                      handleSelectChange("invoice_buyer", value)
                    }
                    options={
                      buyerData?.buyer?.map((buyer) => ({
                        value: buyer.buyer_name,
                        label: buyer.buyer_name,
                      })) || []
                    }
                    placeholder="Select Buyer"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Consignee <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_consignee}
                    onChange={(value) =>
                      handleSelectChange("invoice_consignee", value)
                    }
                    options={
                      buyerData?.buyer?.map((buyer) => ({
                        value: buyer.buyer_name,
                        label: buyer.buyer_name,
                      })) || []
                    }
                    placeholder="Select Consignee"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Consig. Bank
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_consig_bank}
                    onChange={(value) =>
                      handleSelectChange("invoice_consig_bank", value)
                    }
                    options={
                      buyerData?.buyer?.map((buyer) => ({
                        value: buyer.buyer_name,
                        label: buyer.buyer_name,
                      })) || []
                    }
                    placeholder="Select Consig. Bank"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Buyer Address"
                    value={formData.invoice_buyer_add}
                    className=" text-[9px] bg-white border-none hover:border-none"
                    onChange={(e) => handleInputChange(e, "invoice_buyer_add")}
                  />
                </div>
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Consignee Address"
                    value={formData.invoice_consignee_add}
                    className=" text-[9px] bg-white border-none hover:border-none"
                    onChange={(e) =>
                      handleInputChange(e, "invoice_consignee_add")
                    }
                  />
                </div>
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Consig. Bank Address"
                    className=" text-[9px] bg-white border-none hover:border-none"
                    value={formData.invoice_consig_bank_address}
                    onChange={(e) =>
                      handleInputChange(e, "invoice_consig_bank_address")
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-6 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Pre-Receipts <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_prereceipts}
                    onChange={(value) =>
                      handleSelectChange("invoice_prereceipts", value)
                    }
                    options={
                      prereceiptsData?.prereceipts?.map((prereceipts) => ({
                        value: prereceipts.prereceipts_name,
                        label: prereceipts.prereceipts_name,
                      })) || []
                    }
                    placeholder="Select Pre Receipts"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Port of Loading <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_loading}
                    onChange={(value) =>
                      handleSelectChange("invoice_loading", value)
                    }
                    options={
                      portofLoadingData?.portofLoading?.map(
                        (portofLoading) => ({
                          value: portofLoading.portofLoading,
                          label: portofLoading.portofLoading,
                        })
                      ) || []
                    }
                    placeholder="Select Port of Loading"
                  />
                </div>
                <div>
                  <label className=" text-sm flex flex-row items-center justify-between font-medium mb-2">
                    <span>
                      {" "}
                      Dest. Port <span className="text-red-500">*</span>
                    </span>
                    <p
                      type="button"
                      onClick={() =>
                        setShowDischargeAndCIF(!showDischargeAndCIF)
                      }
                      className=" underline text-xs text-black hover:text-red-700 cursor-pointer"
                    >
                      Change D/C
                    </p>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_destination_port}
                    onChange={(value) =>
                      handleSelectChange("invoice_destination_port", value)
                    }
                    options={
                      portsData?.country?.map((country) => ({
                        value: country.country_port,
                        label: country.country_port,
                      })) || []
                    }
                    placeholder="Select Destination Port"
                  />
                </div>
                {showDischargeAndCIF && (
                  <>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                      >
                        Discharge <span className="text-red-500">*</span>
                      </label>
                      <MemoizedSelect
                        value={formData.invoice_discharge}
                        onChange={(value) =>
                          handleSelectChange("invoice_discharge", value)
                        }
                        options={
                          portsData?.country?.map((country) => ({
                            value: country.country_port,
                            label: country.country_port,
                          })) || []
                        }
                        placeholder="Select Discharge "
                      />
                    </div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                      >
                        CIF <span className="text-red-500">*</span>
                      </label>
                      <MemoizedSelect
                        value={formData.invoice_cif}
                        onChange={(value) =>
                          handleSelectChange("invoice_cif", value)
                        }
                        options={
                          portsData?.country?.map((country) => ({
                            value: country.country_port,
                            label: country.country_port,
                          })) || []
                        }
                        placeholder="Select CIF "
                      />
                    </div>
                  </>
                )}
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Dest. Country <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_destination_country}
                    onChange={(value) =>
                      handleSelectChange("invoice_destination_country", value)
                    }
                    options={
                      countryData?.country?.map((country) => ({
                        value: country.country_name,
                        label: country.country_name,
                      })) || []
                    }
                    placeholder="Select Dest. Country "
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Containers/Size <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_container_size}
                    onChange={(value) =>
                      handleSelectChange("invoice_container_size", value)
                    }
                    options={
                      containerSizeData?.containerSize?.map(
                        (containerSize) => ({
                          value: containerSize.containerSize,
                          label: containerSize.containerSize,
                        })
                      ) || []
                    }
                    placeholder="Select Containers/Size"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Custom Des <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData?.invoice_product_cust_des}
                    onChange={(value) =>
                      handleSelectChange("invoice_product_cust_des", value)
                    }
                    options={
                      productCustomDescriptionData?.productSub?.map(
                        (productSub) => ({
                          value: productSub.product_description,
                          label: productSub.product_description,
                        })
                      ) || []
                    }
                    placeholder="Select Custom Des"
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="grid grid-cols-4 gap-6">
                {/* <div>
                     <label className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}>
                    Precarriage
                  </label>
                  <Input
                    type="text"
                    className="bg-white"
                    placeholder="Enter Precarriage"
                    value={formData.invoice_precarriage}
                    onChange={(e) =>
                      handleInputChange(e, "invoice_precarriage")
                    }
                  />
                </div> */}
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Payment Terms
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_payment_terms}
                    onChange={(value) =>
                      handleSelectChange("invoice_payment_terms", value)
                    }
                    options={
                      paymentTermsData?.paymentTermsC?.map((paymentTermsC) => ({
                        value: paymentTermsC.paymentTermsC,
                        label: paymentTermsC.paymentTermsC,
                      })) || []
                    }
                    placeholder="Select Payment Terms"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    LUT Code <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_lut_code}
                    onChange={(value) =>
                      handleSelectChange("invoice_lut_code", value)
                    }
                    options={
                      lutData?.scheme
                        ? [
                            {
                              value: lutData.scheme.scheme_description,
                              label: lutData.scheme.scheme_description,
                            },
                          ]
                        : []
                    }
                    placeholder="Select LUT Code"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    GR Code <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.invoice_gr_code}
                    onChange={(value) =>
                      handleSelectChange("invoice_gr_code", value)
                    }
                    options={
                      grcodeData?.grcode?.map((grcode) => ({
                        value: grcode.gr_code_des,
                        label: grcode.gr_code_des,
                      })) || []
                    }
                    placeholder="Select GR Code"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Remarks
                  </label>
                  <Textarea
                    type="text"
                    className="  bg-white border-none hover:border-none"
                    placeholder="Enter Remarks"
                    value={formData.invoice_remarks}
                    onChange={(e) => handleInputChange(e, "invoice_remarks")}
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl font-semibold">Products</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Marking
                      </TableHead>

                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Item Name / Descriptions{" "}
                        <span className="text-red-500">*</span>
                      </TableHead>

                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Bags / Bag Type <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Net / Gross <span className="text-red-500">*</span>
                      </TableHead>

                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Qnty (MT) <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2  text-center border text-sm font-medium">
                        Rate <span className="text-red-500">*</span>
                      </TableHead>

                      <TableHead className="p-2 text-left border w-16">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="hover:bg-blue-200 hover:cursor-pointer"
                      >
                        <TableCell className="p-2 border">
                          <MemoizedProductSelect
                            value={row.invoiceSub_marking}
                            onChange={(value) =>
                              handleRowDataChange(
                                rowIndex,
                                "invoiceSub_marking",
                                value
                              )
                            }
                            options={
                              markingData?.marking?.map((m) => ({
                                value: m.marking,
                                label: m.marking,
                              })) || []
                            }
                            placeholder="Select Marking"
                          />
                        </TableCell>
                        <TableCell className="p-2 border">
                          <div className="flex flex-col gap-2">
                            <MemoizedProductSelect
                              value={row.invoiceSub_item_name}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_item_name",
                                  value
                                )
                              }
                              options={
                                itemNameData?.itemname?.map((i) => ({
                                  value: i.item_name,
                                  label: i.item_name,
                                })) || []
                              }
                              placeholder="Select Item Name"
                            />
                            <MemoizedProductSelect
                              value={row.invoiceSub_descriptionofGoods}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_descriptionofGoods",
                                  value
                                )
                              }
                              options={
                                descriptionofGoodseData?.descriptionofGoods?.map(
                                  (d) => ({
                                    value: d.descriptionofGoods,
                                    label: d.descriptionofGoods,
                                  })
                                ) || []
                              }
                              placeholder="Select Description"
                            />
                          </div>
                        </TableCell>

                        <TableCell className="p-2 border w-32">
                          <div className="flex flex-col gap-2">
                            <Input
                              value={row.invoiceSub_item_bag}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_item_bag",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Bags"
                              type="text"
                            />
                            <MemoizedProductSelect
                              value={row.invoiceSub_sbaga}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_sbaga",
                                  value
                                )
                              }
                              options={
                                bagTypeData?.bagType?.map((b) => ({
                                  value: b.bagType,
                                  label: b.bagType,
                                })) || []
                              }
                              placeholder="Select Bag Type"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 border w-28">
                          <div className="flex flex-col gap-2">
                            <Input
                              value={row.invoiceSub_packing}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_packing",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Net"
                              type="text"
                            />
                            <Input
                              value={row.invoiceSub_bagsize}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "invoiceSub_bagsize",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Gross"
                              type="text"
                            />
                          </div>
                        </TableCell>

                        <TableCell className="p-2 border w-24">
                          <Input
                            value={row.invoiceSub_qntyInMt}
                            className="bg-white"
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "invoiceSub_qntyInMt",
                                e.target.value
                              )
                            }
                            placeholder="Enter Qnty (MT)"
                            type="text"
                          />
                          <p className="text-xs mt-1   ml-2">
                            {row.invoiceSub_item_bag &&
                            row.invoiceSub_packing ? (
                              `${
                                (
                                  parseFloat(row.invoiceSub_item_bag) *
                                  parseFloat(row.invoiceSub_packing)
                                ).toFixed(2) / 1000
                              }`
                            ) : (
                              <span className="text-[11px]"> Bags X Net</span>
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="p-2 border w-24">
                          <Input
                            className="bg-white"
                            value={row.invoiceSub_rateMT}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "invoiceSub_rateMT",
                                e.target.value
                              )
                            }
                            placeholder="Enter Rate"
                            type="text"
                          />
                        </TableCell>

                        <TableCell className="p-2 border">
                          {row.id ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-red-500"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => removeRow(rowIndex)}
                              disabled={invoiceData.length === 1}
                              className="text-red-500 "
                              type="button"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={addRow}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end  gap-2">
          {updateInvoiceMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={submitLoading}
          >
            {submitLoading ? "Updating..." : "Update & Exit"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndView}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={saveAndViewLoading}
          >
            {saveAndViewLoading ? "Updating..." : "Update & Print"}
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice product from this enquiry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-yellow-500 text-black hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default InvoiceEdit;
