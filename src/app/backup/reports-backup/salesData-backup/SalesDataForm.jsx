import Page from "@/app/dashboard/page";
import { Input } from "@/components/ui/input";
import {
  Select as SelectStatus,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Select from "react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ChevronDown } from "lucide-react";
import axios from "axios";
import { ButtonConfig } from "@/config/ButtonConfig";
import React, { useState } from "react";
import {
  useFetchBuyers,
  useFetchCountrys,
  useFetchProduct,
} from "@/hooks/useApi";
import {
  SalesDataDownload,
  SalesDataView,
} from "@/components/buttonIndex/ButtonComponents";

const salesAccountFormSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To Date is required"),
  branch_name: z.string().optional(),
  invoice_destination_country: z.string().optional(),
  invoice_buyer: z.string().optional(),
  invoice_product: z.string().optional(),
});

const createContract = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-sales-data-report
`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to create sales account");
  return response.json();
};
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
        getOptionLabel={(option) => option.label} // Show only the invoice reference in the input
        getOptionValue={(option) => option.value} // Use the value for the option
      />
    );
  }
);
const SalesDataForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    branch_name: "",
    invoice_destination_country: "",
    invoice_buyer: "",
    invoice_product: "",
  });

  const createSalesAccountMutation = useMutation({
    mutationFn: createContract,
    onSuccess: (data) => {
      navigate("/report/sales-data-report", {
        // state: { reportsalesData: data },
        state: {
          reportsalesData: data,
          formData: formData,
        },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = salesAccountFormSchema.parse({
        ...formData,
      });

      createSalesAccountMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
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
    }
  };

  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchCompanys = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/api/panel-fetch-branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch company data");
    return response.json();
  };

  const { data: branchData } = useQuery({
    queryKey: ["branch"],
    queryFn: fetchCompanys,
  });
  const { data: buyerData } = useFetchBuyers();
  const { data: countryData } = useFetchCountrys();
  const { data: productData } = useFetchProduct();

  const BranchHeader = ({ progress }) => {
    return (
      <div
        className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between ${ButtonConfig.cardheaderColor} items-start gap-8 mb-2  p-4 shadow-sm`}
      >
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">Sales Summary</h1>
          <p className="text-gray-600 mt-2">Add a Sales to Vist Repost</p>
        </div>
      </div>
    );
  };

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
      <BranchHeader />

      <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
        <CardContent className="p-4">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1  md:grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Enter From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="Enter From Date"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Enter To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.to_date}
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="Enter To Date"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Company <span className="text-red-500"></span>
                  </label>
                  <SelectStatus
                    value={formData.branch_name}
                    onValueChange={(value) =>
                      handleInputChange("branch_name", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectContent>
                        {branchData?.branch?.map((branch) => (
                          <SelectItem
                            key={branch.branch_name}
                            value={branch.branch_name.toString()}
                          >
                            {branch.branch_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectContent>
                  </SelectStatus>
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Buyer <span className="text-red-500"></span>
                  </label>
                  <MemoizedProductSelect
                    value={formData.invoice_buyer}
                    onChange={(value) =>
                      handleInputChange("invoice_buyer", value)
                    }
                    options={
                      buyerData?.buyer?.map((branch) => ({
                        value: branch.buyer_name,
                        label: branch.buyer_name,
                      })) || []
                    }
                    placeholder="Select Buyer"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Country <span className="text-red-500"></span>
                  </label>
                  <SelectStatus
                    value={formData.invoice_destination_country}
                    onValueChange={(value) =>
                      handleInputChange("invoice_destination_country", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectContent>
                        {countryData?.country?.map((branch) => (
                          <SelectItem
                            key={branch.country_name}
                            value={branch.country_name.toString()}
                          >
                            {branch.country_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectContent>
                  </SelectStatus>
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Product <span className="text-red-500"></span>
                  </label>
                  <SelectStatus
                    value={formData.invoice_product}
                    onValueChange={(value) =>
                      handleInputChange("invoice_product", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectContent>
                        {productData?.product?.map((branch) => (
                          <SelectItem
                            key={branch.product_name}
                            value={branch.product_name.toString()}
                          >
                            {branch.product_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectContent>
                  </SelectStatus>
                </div>
              </div>
              <div className="flex flex-row items-end mt-3 justify-end w-full">
                {createSalesAccountMutation.isPending}

                <SalesDataDownload
                  className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={onSubmit}
                ></SalesDataDownload>
                <SalesDataView
                  type="submit"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center mt-2`}
                  disabled={createSalesAccountMutation.isPending}
                >
                  {createSalesAccountMutation.isPending
                    ? "Submitting..."
                    : "Submit Sales Data"}
                </SalesDataView>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SalesDataForm;
