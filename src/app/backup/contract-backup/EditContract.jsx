import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  PlusCircle,
  MinusCircle,
  ChevronDown,
  Trash2,
  Loader2,
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import BASE_URL from "@/config/BaseUrl";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Page from "../dashboard/page";
import { ButtonConfig } from "@/config/ButtonConfig";
import { decryptId, encryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

// Validation Schemas

// Update Contract
const updateContract = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-contract/${decryptedId}`,
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

const EditContract = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saveAndViewLoading, setSaveAndViewLoading] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",
    contract_year: "",
    contract_date: "",
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
    contract_status: "Open",
    contract_data: [],
  });
  const [contractData, setContractData] = useState([]);

  const {
    data: contractDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["contract", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-contract-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch enquiry");
      return response.json();
    },
  });

  useEffect(() => {
    if (contractDatas) {
      setFormData({
        branch_short: contractDatas.contract.branch_short,
        branch_name: contractDatas.contract.branch_name,
        branch_address: contractDatas.contract.branch_address,
        contract_year: contractDatas.contract.contract_year,
        contract_date: contractDatas.contract.contract_date,
        contract_no: contractDatas.contract.contract_no,
        contract_ref: contractDatas.contract.contract_ref,
        contract_pono: contractDatas.contract.contract_pono,
        contract_buyer: contractDatas.contract.contract_buyer,
        contract_buyer_add: contractDatas.contract.contract_buyer_add,
        contract_consignee: contractDatas.contract.contract_consignee,
        contract_consignee_add: contractDatas.contract.contract_consignee_add,
        contract_product: contractDatas.contract.contract_product,
        contract_container_size: contractDatas.contract.contract_container_size,
        contract_loading: contractDatas.contract.contract_loading,
        contract_destination_port:
          contractDatas.contract.contract_destination_port,
        contract_discharge: contractDatas.contract.contract_discharge,
        contract_cif: contractDatas.contract.contract_cif,
        contract_destination_country:
          contractDatas.contract.contract_destination_country,
        contract_shipment: contractDatas.contract.contract_shipment,
        contract_ship_date: contractDatas.contract.contract_ship_date,
        contract_specification1: contractDatas.contract.contract_specification1,
        contract_specification2: contractDatas.contract.contract_specification2,
        contract_payment_terms: contractDatas.contract.contract_payment_terms,
        contract_remarks: contractDatas.contract.contract_remarks,
        contract_status: contractDatas.contract.contract_status,
        contract_data: contractDatas.contractSub,
      });
      setContractData(contractDatas.contractSub);
    }
  }, [contractDatas]);

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

  const updateContractMutation = useMutation({
    mutationFn: updateContract,
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
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-delete-contract-sub/${productId}`,
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
        description: "Contract Table deleted successfully",
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
      setContractData((prevData) =>
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
      const processedContractData = contractData.map((row) => ({
        ...row,
        contractSub_item_bag: parseFloat(row.contractSub_item_bag),
        contractSub_qntyInMt: parseFloat(row.contractSub_qntyInMt),
        contractSub_rateMT: parseFloat(row.contractSub_rateMT),
        contractSub_packing: parseFloat(row.contractSub_packing),
        contractSub_bagsize: parseFloat(row.contractSub_bagsize),
      }));

      const updateData = {
        ...formData,
        contract_data: processedContractData,
      };
      const res = await updateContractMutation.mutateAsync({
        decryptedId,
        data: updateData,
      });
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
    } finally {
      setSubmitLoading(false);
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

      const updateData = {
        ...formData,
        contract_data: processedContractData,
      };

      const response = await updateContractMutation.mutateAsync({
        decryptedId,
        data: updateData,
      });

      if (response.code == 200) {
        // const encryptedId = encryptId(id);

        // navigate(
        //   `/master/driver-edit/${encodeURIComponent(encryptedId)}`
        // );
        // navigate(`/view-contract/${decryptedId}`);

        const encryptedId = encryptId(decryptedId);

        navigate(`/view-contract/${encodeURIComponent(encryptedId)}`);
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

  if (isLoading) {
    return <LoaderComponent name="Contract Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Contract Data"
        refetch={refetch}
      />
    );
  }
  return (
    <Page>
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 bg-blue-50/30 rounded-lg"
      >
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-0">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Buyer <span className="text-red-500">*</span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Consignee <span className="text-red-500">*</span>
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
                  {/* <MemoizedSelect
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
                  /> */}
                   <Input
                    type="text"
                    value={formData.branch_short}
                    disabled
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("branch_short", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract No <span className="text-red-500">*</span>
                  </label>
                  {/* <MemoizedSelect
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
                  /> */}
                   <Input
                    type="text"
                    value={formData?.contract_no}
                    disabled
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("contract_no", e.target.value)
                    }
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Product <span className="text-red-500">*</span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Contract Status <span className="text-red-500">*</span>
                  </label>
                  <ShadcnSelect
                    value={formData.contract_status}
                    onValueChange={(value) =>
                      handleInputChange("contract_status", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Close">Close</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </ShadcnSelect>
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Port of Loading <span className="text-red-500">*</span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Destination Port <span className="text-red-500">*</span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Dest. Country <span className="text-red-500">*</span>
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
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Payment Terms
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
                              disabled={contractData.length === 1}
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

        <div className="flex  items-center justify-end  gap-2">
          {updateContractMutation.isPending && <ProgressBar progress={70} />}
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
              contract product from this enquiry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default EditContract;
