import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PlusCircle, MinusCircle, ChevronDown, Trash2 } from "lucide-react";
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import BASE_URL from "@/config/BaseUrl";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import {
  useFetchBuyers,
  useFetchCompanys,
  useFetchContractNos,
  useFetchPortofLoadings,
  useFetchContainerSizes,
  useFetchPaymentTerms,
  useFetchCountrys,
  useFetchMarkings,
  useFetchItemNames,
  useFetchDescriptionofGoods,
  useFetchBagsTypes,
  useFetchPorts,
  useFetchProduct,
} from "@/hooks/useApi";
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
  contractSub_item_name: z.string().min(1, "Item name is required"),
  contractSub_descriptionofGoods: z
    .string()
    .min(1, "Item Descriptions is required"),
  contractSub_bagsize: z.number().min(1, "Gross Weight is required"),
  contractSub_packing: z.number().min(1, "Packing is required"),
  contractSub_item_bag: z.number().min(1, "Bag is required"),
  contractSub_qntyInMt: z.number().min(1, "Quoted price is required"),
  contractSub_rateMT: z.number().min(1, "Rate is required"),
  contractSub_sbaga: z.string().min(1, "Bag Type is required"),
  contractSub_marking: z.string().optional(),
});

const contractFormSchema = z.object({
  branch_short: z.string().min(1, "Company Sort is required"),
  branch_name: z.string().min(1, "Company Name is required"),
  branch_address: z.string().min(1, "Company Address is required"),
  contract_year: z.string().optional(),
  contract_date: z.string().min(1, "Contract date is required"),
  contract_no: z.number().min(1, "Contract No is required"),
  contract_ref: z.string().min(1, "Contract Ref is required"),
  contract_pono: z.string().min(1, "Contract PONO is required"),
  contract_buyer: z.string().min(1, "Buyer Name is required"),
  contract_buyer_add: z.string().min(1, "Buyer Address is required"),
  contract_consignee: z.string().min(1, "Consignee Name is required"),
  contract_consignee_add: z.string().min(1, "Consignee Address is required"),
  contract_product: z.string().min(1, "Product is required"),
  contract_container_size: z.string().min(1, "Containers/Size is required"),
  contract_loading: z.string().min(1, "Port of Loading is required"),
  contract_destination_port: z.string().min(1, "Destination Port is required"),
  contract_discharge: z.string().min(1, "Discharge is required"),
  contract_cif: z.string().min(1, "CIF is required"),
  contract_destination_country: z.string().min(1, "Dest. Country is required"),
  contract_shipment: z.string().optional(),
  contract_ship_date: z.string().optional(),
  contract_specification1: z.string().optional(),
  contract_specification2: z.string().optional(),
  contract_payment_terms: z.string().optional(),
  contract_remarks: z.string().optional(),
  contract_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});

const createContract = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-create-contract`, {
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

const ContractAdd = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
 const [submitLoading, setSubmitLoading] = useState(false);
    const [saveAndViewLoading, setSaveAndViewLoading] = useState(false);
  const [contractData, setContractData] = useState([
    {
      contractSub_marking: "",
      contractSub_item_name: "",
      contractSub_descriptionofGoods: "",
      contractSub_item_bag: "",
      contractSub_packing: "",
      contractSub_bagsize: "",
      contractSub_qntyInMt: "",
      contractSub_rateMT: "",
      contractSub_sbaga: "",
    },
  ]);

  const { data: currentYear } = useCurrentYear();
  useEffect(() => {
    if (currentYear) {
      setFormData((prev) => ({
        ...prev,
        contract_year: currentYear,
      }));
    }
  }, [currentYear]);

  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",
    contract_year: currentYear,
    contract_date: getTodayDate(),
    contract_no: "",
    contract_ref: "",
    contract_pono: "",
    contract_buyer: "",
    contract_buyer_add: "",
    contract_consignee: "",
    contract_consignee_add: "",
    contract_product: "",
    contract_container_size: "",
    contract_loading: "",
    contract_destination_port: "",
    contract_discharge: "",
    contract_cif: "",
    contract_destination_country: "",
    contract_shipment: "",
    contract_ship_date: "",
    contract_specification1: "",
    contract_specification2: "",
    contract_payment_terms: "",
    contract_remarks: "",
  });

  const { data: buyerData } = useFetchBuyers();
  const { data: branchData } = useFetchCompanys();
  const { data: contractNoData } = useFetchContractNos(formData.branch_short);
  const { data: portofLoadingData } = useFetchPortofLoadings();
  const { data: containerSizeData } = useFetchContainerSizes();
  const { data: paymentTermsData } = useFetchPaymentTerms();
  const { data: countryData } = useFetchCountrys();
  const { data: markingData } = useFetchMarkings();
  const { data: itemNameData } = useFetchItemNames();
  const { data: descriptionofGoodseData } = useFetchDescriptionofGoods();
  const { data: bagTypeData } = useFetchBagsTypes();
  const { data: portsData } = useFetchPorts();
  const { data: productData } = useFetchProduct();

  const createContractMutation = useMutation({
    mutationFn: createContract,
    // onSuccess: () => {
    //   toast({
    //     title: "Success",
    //     description: "Contract created successfully",
    //   });
    //   navigate("/contract");
    // },
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/contract");
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

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSelectChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (field === "contract_buyer") {
        const selectedBuyer = buyerData?.buyer?.find(
          (buyer) => buyer.buyer_name === value
        );
        if (selectedBuyer) {
          setFormData((prev) => ({
            ...prev,
            contract_buyer_add: selectedBuyer.buyer_address,
            contract_consignee: selectedBuyer.buyer_name,
            contract_consignee_add: selectedBuyer.buyer_address,
            contract_destination_port: selectedBuyer.buyer_port,
            contract_discharge: selectedBuyer.buyer_port,
            contract_cif: selectedBuyer.buyer_port,
            contract_destination_country: selectedBuyer.buyer_country,
          }));
        }

        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === formData.branch_short
        );
        if (selectedCompanySort) {
          const contractRef = `${selectedCompanySort.branch_name_short}/${selectedBuyer.buyer_sort}/${formData.contract_no}/${formData.contract_year}`;
          setFormData((prev) => ({
            ...prev,
            contract_ref: contractRef,
            contract_pono: contractRef,
          }));
        }
      }

      if (field === "branch_short") {
        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === value
        );
        if (selectedCompanySort) {
          setFormData((prev) => ({
            ...prev,
            branch_name: selectedCompanySort.branch_name,
            branch_address: selectedCompanySort.branch_address,
            contract_loading: selectedCompanySort.branch_port_of_loading,
          }));

          const selectedBuyer = buyerData?.buyer?.find(
            (buyer) => buyer.buyer_name === formData.contract_buyer
          );
          if (selectedBuyer) {
            const contractRef = `${selectedCompanySort.branch_name_short}/${selectedBuyer.buyer_sort}/${formData.contract_no}/${formData.contract_year}`;
            setFormData((prev) => ({
              ...prev,
              contract_ref: contractRef,
              contract_pono: contractRef,
            }));
          }
        }
      }

      if (field === "contract_consignee") {
        const selectedConsignee = buyerData?.buyer?.find(
          (buyer) => buyer.buyer_name === value
        );
        if (selectedConsignee) {
          setFormData((prev) => ({
            ...prev,
            contract_consignee_add: selectedConsignee.buyer_address,
          }));
        }
      }

      if (field === "contract_no") {
        const selectedBuyer = buyerData?.buyer?.find(
          (buyer) => buyer.buyer_name === formData.contract_buyer
        );
        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === formData.branch_short
        );
        if (selectedBuyer && selectedCompanySort) {
          const contractRef = `${selectedCompanySort.branch_name_short}/${selectedBuyer.buyer_sort}/${value}/${formData.contract_year}`;
          setFormData((prev) => ({
            ...prev,
            contract_ref: contractRef,
            contract_pono: contractRef,
          }));
        }
      }
    },
    [
      buyerData,
      branchData,
      formData.branch_short,
      formData.contract_buyer,
      formData.contract_no,
      formData.contract_year,
    ]
  );

  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    const numericFields = [
      "contractSub_bagsize",
      "contractSub_qntyInMt",
      "contractSub_packing",
      "contractSub_rateMT",
      "contractSub_item_bag",
    ];

    if (numericFields.includes(field)) {
      const sanitizedValue = value.replace(/[^\d.]/g, "");
      const decimalCount = (sanitizedValue.match(/\./g) || []).length;

      if (decimalCount > 1) return;

      setContractData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: sanitizedValue,
        };
        return newData;
      });
    } else {
      setContractData((prev) => {
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
    setContractData((prev) => [
      ...prev,
      {
        contractSub_item_bag: "",
        contractSub_item_name: "",
        contractSub_marking: "",
        contractSub_descriptionofGoods: "",
        contractSub_packing: "",
        contractSub_bagsize: "",
        contractSub_qntyInMt: "",
        contractSub_rateMT: "",
        contractSub_sbaga: "",
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (contractData.length > 1) {
        setContractData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [contractData.length]
  );

  const fieldLabels = {
    branch_short: "Company Sort",
    branch_name: "Company Name",
    branch_address: "Company Address",
    contract_year: "Contract Year",
    contract_date: "Contract Date",
    contract_no: "Contract No",
    contract_ref: "Contract Ref",
    contract_pono: "Contract PONO",
    contract_buyer: "Buyer Name",
    contract_buyer_add: "Buyer Address",
    contract_consignee: "Consignee Name",
    contract_consignee_add: "Consignee Address",
    contract_product: "Product",
    contract_container_size: "Containers/Size",
    contract_loading: "Port of Loading",
    contract_destination_port: "Destination Port",
    contract_discharge: "Discharge",
    contract_cif: "CIF",
    contract_destination_country: "Dest. Country",
    contract_shipment: "Shipment",
    contract_ship_date: "Shipment Date",
    contract_specification1: "Specification 1",
    contract_specification2: "Specification 2",
    contract_payment_terms: "Payment Terms",
    contract_remarks: "Remarks",
    contractSub_item_name: "Item Name",
    contractSub_descriptionofGoods: "Item Descriptions",
    contractSub_bagsize: "Gross Weight",
    contractSub_packing: "Packing",
    contractSub_item_bag: "Bag",
    contractSub_qntyInMt: "Qnty (MT)",
    contractSub_rateMT: "Rate",
    contractSub_sbaga: "Bag Type",
    contractSub_marking: "Marking",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const processedContractData = contractData.map((row) => ({
        ...row,
        contractSub_item_bag: parseFloat(row.contractSub_item_bag),
        contractSub_qntyInMt: parseFloat(row.contractSub_qntyInMt),
        contractSub_rateMT: parseFloat(row.contractSub_rateMT),
        contractSub_packing: parseFloat(row.contractSub_packing),
        contractSub_bagsize: parseFloat(row.contractSub_bagsize),
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        contract_data: processedContractData,
      });
      const res = await  createContractMutation.mutateAsync(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
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
    }finally{
      setSubmitLoading(false)
    }
  };
  const handleSaveAndView = async (e) => {
    e.preventDefault();
    setSaveAndViewLoading(true);
    try {
    
        const processedContractData = contractData.map((row) => ({
            ...row,
            contractSub_item_bag: parseFloat(row.contractSub_item_bag),
            contractSub_qntyInMt: parseFloat(row.contractSub_qntyInMt),
            contractSub_rateMT: parseFloat(row.contractSub_rateMT),
            contractSub_packing: parseFloat(row.contractSub_packing),
            contractSub_bagsize: parseFloat(row.contractSub_bagsize),
          }));
     
      
          const validatedData = contractFormSchema.parse({
            ...formData,
            contract_data: processedContractData,
          });

    
      const response = await createContractMutation.mutateAsync(validatedData);

  
      if (response.code == 200) {
      
        navigate(`/view-contract/${response.latestid}`);
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
          if (!acc[field]) acc[field] = [];
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
        <Card className={`mb-6 ${ButtonConfig.cardColor} `}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-0">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                    <span>Buyer <span className="text-red-500">*</span></span>
                    <span><CreateBuyer/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_buyer}
                    onChange={(value) =>
                      handleSelectChange("contract_buyer", value)
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
                  <span>  Consignee <span className="text-red-500">*</span></span>
                  <span><CreateBuyer/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_consignee}
                    onChange={(value) =>
                      handleSelectChange("contract_consignee", value)
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
                    Contract No <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData?.contract_no}
                    onChange={(value) =>
                      handleSelectChange("contract_no", value)
                    }
                    options={
                      contractNoData?.contractNo?.map((contractNos) => ({
                        value: contractNos,
                        label: contractNos,
                      })) || []
                    }
                    placeholder="Select Contract No"
                  />
                </div>
              </div>
            </div>

            <div className="mb-2   mt-[2px]">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Buyer Address"
                    value={formData.contract_buyer_add}
                    className=" text-[9px] bg-white border-none hover:border-none "
                    onChange={(e) =>
                      handleInputChange("contract_buyer_add", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Consignee Address"
                    className=" text-[9px] bg-white border-none hover:border-none"
                    value={formData.contract_consignee_add}
                    onChange={(e) =>
                      handleInputChange(
                        "contract_consignee_add",
                        e.target.value
                      )
                    }
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
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.contract_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("contract_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-2 ">
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Ref. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Contract Ref"
                    value={formData.contract_ref}
                    disabled
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("contract_ref", e.target.value)
                    }
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
                    placeholder="Enter Contract PoNo"
                    value={formData.contract_pono}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("contract_pono", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                  >
                    <span>Product <span className="text-red-500">*</span></span>
                    <span><CreateProduct/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_product}
                    onChange={(value) =>
                      handleSelectChange("contract_product", value)
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
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                  >
                  <span>  Port of Loading <span className="text-red-500">*</span></span>
                    <span><CreatePortofLoading/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_loading}
                    onChange={(value) =>
                      handleSelectChange("contract_loading", value)
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
                  <span>  Destination Port <span className="text-red-500">*</span></span>
                    <span><CreateCountry/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_destination_port}
                    onChange={(value) =>
                      handleSelectChange("contract_destination_port", value)
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
              </div>
            </div>
            <div className="mb-2">
              <div className="grid grid-cols-6 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Discharge <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_discharge}
                    onChange={(value) =>
                      handleSelectChange("contract_discharge", value)
                    }
                    options={
                      portsData?.country?.map((country) => ({
                        value: country.country_port,
                        label: country.country_port,
                      })) || []
                    }
                    placeholder="Select Discharge"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    CIF <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_cif}
                    onChange={(value) =>
                      handleSelectChange("contract_cif", value)
                    }
                    options={
                      portsData?.country?.map((country) => ({
                        value: country.country_port,
                        label: country.country_port,
                      })) || []
                    }
                    placeholder="Select CIF"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                  >
                   <span> Dest. Country <span className="text-red-500">*</span></span>
                    <span><CreateCountry/></span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_destination_country}
                    onChange={(value) =>
                      handleSelectChange("contract_destination_country", value)
                    }
                    options={
                      countryData?.country?.map((country) => ({
                        value: country.country_name,
                        label: country.country_name,
                      })) || []
                    }
                    placeholder="Select Dest. Country"
                  />
                </div>
                {/* container-size */}
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Containers/Size <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.contract_container_size}
                    onChange={(value) =>
                      handleSelectChange("contract_container_size", value)
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
                    Shipment Date
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.contract_ship_date}
                    onChange={(e) =>
                      handleInputChange("contract_ship_date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Shipment
                  </label>
                  <Input
                    className="bg-white"
                    type="text"
                    value={formData.contract_shipment}
                    onChange={(e) =>
                      handleInputChange("contract_shipment", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Specification1
                  </label>
                  <Textarea
                    type="text"
                    className="bg-white"
                    placeholder="Enter Specification1"
                    value={formData.contract_specification1}
                    onChange={(e) =>
                      handleInputChange(
                        "contract_specification1",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Specification2
                  </label>
                  <Textarea
                    type="text"
                    className="bg-white"
                    placeholder="Enter Specification2"
                    value={formData.contract_specification2}
                    onChange={(e) =>
                      handleInputChange(
                        "contract_specification2",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium  flex items-center justify-between`}
                  >
                    <span>Payment Terms</span>
                    <span><CreatePaymentTermC/></span>
                  </label>
                  <MemoizedSelect
                    className="bg-white"
                    value={formData.contract_payment_terms}
                    onChange={(value) =>
                      handleSelectChange("contract_payment_terms", value)
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
                    Remarks
                  </label>
                  <Textarea
                    type="text"
                    className="bg-white"
                    placeholder="Enter Remarks"
                    value={formData.contract_remarks}
                    onChange={(e) =>
                      handleInputChange("contract_remarks", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            {/* Products Section */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center gap-8">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <span ><CreateItem/></span>
                  <span><CreateDescriptionGoods/></span>
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
                    {contractData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-gray-50">
                        <TableCell className="p-2 border">
                          <MemoizedProductSelect
                            value={row.contractSub_marking}
                            onChange={(value) =>
                              handleRowDataChange(
                                rowIndex,
                                "contractSub_marking",
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
                              value={row.contractSub_item_name}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_item_name",
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
                              value={row.contractSub_descriptionofGoods}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_descriptionofGoods",
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
                              value={row.contractSub_item_bag}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_item_bag",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Bags"
                              type="text"
                            />
                            <MemoizedProductSelect
                              value={row.contractSub_sbaga}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_sbaga",
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
                              value={row.contractSub_packing}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_packing",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Net"
                              type="text"
                            />
                            <Input
                              value={row.contractSub_bagsize}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "contractSub_bagsize",
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
                            value={row.contractSub_qntyInMt}
                            className="bg-white"
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "contractSub_qntyInMt",
                                e.target.value
                              )
                            }
                            placeholder="Enter Qnty (MT)"
                            type="text"
                          />
                          <p className="text-xs mt-1   ml-2">
                            {row.contractSub_item_bag &&
                            row.contractSub_packing ? (
                              `${
                                (
                                  parseFloat(row.contractSub_item_bag) *
                                  parseFloat(row.contractSub_packing)
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
                            value={row.contractSub_rateMT}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "contractSub_rateMT",
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
                            disabled={contractData.length === 1}
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
          {createContractMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={submitLoading}
          >
            {submitLoading
              ? "Creating..."
              : "Create & Exit"}
          </Button>
          <Button
            type="button" 
            onClick={handleSaveAndView} 
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={saveAndViewLoading}
          >
            {saveAndViewLoading
              ? "Creating..."
              : "Create & Print"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default ContractAdd;
