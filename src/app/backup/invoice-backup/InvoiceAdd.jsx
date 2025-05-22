import React, { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
} from "@/hooks/useApi";
import axios from "axios";
import { ButtonConfig } from "@/config/ButtonConfig";
import CreateBuyer from "../master/buyer/CreateBuyer";
import CreateProduct from "../master/product/CreateProduct";
import CreatePortofLoading from "../master/portofLoading/CreatePortofLoading";
import CreateCountry from "../master/country/CreateCountry";
import CreatePaymentTermC from "../master/paymentTermC/CreatePaymentTermC";
import CreateItem from "../master/item/CreateItem";
import CreateDescriptionGoods from "../master/descriptionGoods/CreateDescriptionGoods";
import CreateMarking from "../master/marking/CreateMarking";

// Validation Schemas
const productRowSchema = z.object({
  invoiceSub_item_name: z.string().min(1, "Item name is required"),
  invoiceSub_descriptionofGoods: z
    .string()
    .min(1, "Item Descriptions is required"),
  invoiceSub_bagsize: z.number().min(1, "Gross Weight is required"),
  invoiceSub_packing: z.number().min(1, "Packing is required"),

  invoiceSub_item_bag: z.number().min(1, "Bag is required"),

  invoiceSub_qntyInMt: z.number().min(1, "Quoted price is required"),
  invoiceSub_rateMT: z.number().min(1, "Rate is required"),
  invoiceSub_sbaga: z.string().min(1, "Bag Type is required"),
  invoiceSub_marking: z.string().optional(),
});

const contractFormSchema = z.object({
  branch_short: z.string().min(1, "Company Sort is required"),
  branch_name: z.string().min(1, "Company Name is required"),
  branch_address: z.string().min(1, "Company Address is required"),
  invoice_year: z.string().optional(),
  invoice_date: z.string().min(1, "Invoice date is required"),
  invoice_no: z.string().min(1, "Invoice No is required"),
  invoice_ref: z.string().min(1, "Invoice Ref is required"),
  contract_date: z.string().min(1, "Contract Date is required"),
  contract_ref: z.string().min(1, "Contract Ref is required"),
  contract_pono: z.string().min(1, "PONO is required"),
  invoice_buyer: z.string().min(1, "Buyer Name is required"),
  invoice_buyer_add: z.string().min(1, "Buyer Address is required"),
  invoice_product: z.string().min(1, "Product is required"),
  invoice_consignee: z.string().min(1, "Consignee Name is required"),
  invoice_consignee_add: z.string().min(1, "Consignee Address is required"),

  invoice_container_size: z.string().min(1, "Containers/Size is required"),
  invoice_loading: z.string().min(1, "Port of Loading is required"),
  invoice_destination_port: z.string().min(1, "Destination Port is required"),
  invoice_discharge: z.string().min(1, "Discharge is required"),
  invoice_cif: z.string().min(1, "CIF is required"),
  invoice_destination_country: z.string().min(1, "Dest. Country is required"),

  invoice_payment_terms: z.string().optional(),
  invoice_remarks: z.string().optional(),
  invoice_consig_bank: z.string().optional(),
  invoice_consig_bank_address: z.string().optional(),
  invoice_prereceipts: z.string().min(1, "Pre Receipt is required"),
  invoice_precarriage: z.string().optional(),
  invoice_product_cust_des: z
    .string()
    .min(1, "Product Descriptions is required"),
  invoice_gr_code: z.string().min(1, "GR Code is required"),
  invoice_lut_code: z.string().min(1, "LUT Code is required"),
  invoice_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});

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

const createInvoice = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-create-invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to create enquiry");
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

// Main Component
const InvoiceAdd = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saveAndViewLoading, setSaveAndViewLoading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [invoiceData, setInvoiceData] = useState([
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

  const { data: currentYear } = useCurrentYear();
  useEffect(() => {
    if (currentYear) {
      setFormData((prev) => ({
        ...prev,
        invoice_year: currentYear,
      }));
    }
  }, [currentYear]);
  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",
    invoice_year: currentYear,
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
    invoice_consig_bank_address: "",
  });

  const checkInvoiceRef = async (invoiceRef) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BASE_URL}/api/panel-check-invoice-ref`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice_ref: invoiceRef }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code == 400) {
        setDialogMessage(
          data.msg || "This reference number is already created."
        );
        setIsDialogOpen(true);
      }

      return data;
    } catch (error) {
      console.error("Error checking invoice reference:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (formData.invoice_ref) {
      checkInvoiceRef(formData.invoice_ref)
        .then((data) => {
          console.log("Invoice reference is valid:", data);
        })
        .catch((error) => {
          console.error("Error checking invoice reference:", error);
        });
    }
  }, [formData.invoice_ref]);

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

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    // onSuccess: () => {
    //   toast({
    //     title: "Success",
    //     description: "Invoice created successfully",
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
    setFormData((prev) => {
      const updatedFormData = { ...prev, [field]: value };
      if (field === "invoice_no" || field === "branch_short") {
        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === updatedFormData.branch_short
        );

        if (
          selectedCompanySort &&
          updatedFormData.invoice_no &&
          updatedFormData.invoice_year
        ) {
          const invoiceRef = `${selectedCompanySort.branch_name_short}${updatedFormData.invoice_no}${updatedFormData.invoice_year}`;
          updatedFormData.invoice_ref = invoiceRef;
        }
      }

      return updatedFormData;
    });
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
              invoice_product_cust_des: contract.contract_product_cust_des,
              invoice_gr_code: contract.contract_gr_code,
              invoice_lut_code: contract.contract_lut_code,
              invoice_prereceipts: contract.contract_prereceipts,
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
            updatedFormData.invoice_prereceipts = selectedCompanySort.branch_prereceipts;

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
          [field]:  value === null ? "" : value,
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
        invoiceSub_marking: row.invoiceSub_marking || "",
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        invoice_data: processedContractData,
        invoice_payment_terms: formData.invoice_payment_terms || "",
        invoice_remarks: formData.invoice_remarks || "", 
    
      });
      const res = await createInvoiceMutation.mutateAsync(validatedData);
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
console.log("toast",errorMessages)
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

      const validatedData = contractFormSchema.parse({
        ...formData,
        invoice_data: processedContractData,
      });

      const response = await createInvoiceMutation.mutateAsync(validatedData);

      if (response.code == 200) {
        navigate(`/view-invoice/${response.latestid}`);
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
  return (
    <Page>
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 bg-blue-50/30 rounded-lg"
      >
        {/* <EnquiryHeader progress={progress} /> */}

        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-3">
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Ref. <span className="text-red-500">*</span>
                  </label>
                  {/* this is just for show  no field required here  */}
                  <MemoizedSelect
                    value={formData.contract_ref}
                    onChange={(value) =>
                      handleSelectChange("contract_ref", value)
                    }
                    options={
                      contractRefsData?.contractRef?.map((contractRef) => ({
                        value: contractRef.contract_ref,
                        label: contractRef.contract_ref,
                      })) || []
                    }
                    placeholder="Select Contract Ref."
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Company <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.branch_short}
                    onChange={(value) =>
                      handleSelectChange("branch_short", value)
                    }
                    options={
                      branchData?.branch?.map((branch) => ({
                        value: branch.branch_short,
                        label: branch.branch_short,
                      })) || []
                    }
                    placeholder="Select Company"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Invoice No <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Invoice No"
                    className="bg-white"
                    value={formData.invoice_no}
                    onChange={(e) => handleInputChange(e, "invoice_no")}
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.invoice_date}
                    className="bg-white"
                    onChange={(e) => handleInputChange(e, "invoice_date")}
                  />
                </div>
                <div
                  style={{ textAlign: "center" }}
                  className="bg-white rounded-md"
                >
                  <span style={{ fontSize: "12px" }}>
                    {formData.branch_name}
                  </span>
                  <br />
                  <span style={{ fontSize: "9px", display: "block" }}>
                    {formData.branch_address}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Ref. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    className="bg-white"
                    placeholder="Enter Contract Ref"
                    value={formData.contract_ref}
                    disabled
                    onChange={(e) => handleInputChange(e, "contract_ref")}
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract PONO. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    className="bg-white"
                    placeholder="Enter Contract PoNo"
                    value={formData.contract_pono}
                    onChange={(e) => handleInputChange(e, "contract_pono")}
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.contract_date}
                    onChange={(e) => handleInputChange(e, "contract_date")}
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Invoice Ref. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Invoice Ref"
                    className="bg-white"
                    value={formData.invoice_ref}
                    disabled
                    onChange={(e) => handleInputChange(e, "invoice_ref")}
                  />
                </div>
              </div>
            </div>

            <div className="mb-0">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>
                      Buyer <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreateBuyer />
                    </span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                  >
                    <span>
                      {" "}
                      Consignee <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreateBuyer />
                    </span>
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
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>
                      Product <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreateProduct />
                    </span>
                  </label>
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
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-4 gap-6">
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
              </div>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>
                      {" "}
                      Port of Loading <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreatePortofLoading />
                    </span>
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
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>
                      {" "}
                      Destination Port <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreateCountry />
                    </span>
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
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>
                      {" "}
                      Dest. Country <span className="text-red-500">*</span>
                    </span>
                    <span>
                      <CreateCountry />
                    </span>
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
              </div>
            </div>
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-6">
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
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
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
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-6">
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>Payment Terms</span>
                    <span>
                      <CreatePaymentTermC />
                    </span>
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
              </div>
            </div>
            <div className="mb-3">
              <div className="grid grid-cols-1 gap-6">
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
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center gap-8">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <span>
                    <CreateItem />
                  </span>
                  <span>
                    <CreateDescriptionGoods />
                  </span>
                  <span><CreateMarking/></span>
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
                      <TableRow key={rowIndex} className="hover:bg-gray-50">
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

                        <TableCell className="p-2 border">
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
                          <Button
                            variant="ghost"
                            onClick={() => removeRow(rowIndex)}
                            disabled={invoiceData.length === 1}
                            className="text-red-500 "
                            type="button"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
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
          {createInvoiceMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={submitLoading}
          >
            {submitLoading ? "Creating..." : "Create & Exit"}
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndView}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={saveAndViewLoading}
          >
            {saveAndViewLoading ? "Creating..." : "Create & Print"}
          </Button>
        </div>
      </form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Entry</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-yellow-500 text-black hover:bg-red-600"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default InvoiceAdd;
