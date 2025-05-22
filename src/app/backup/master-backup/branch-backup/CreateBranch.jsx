import Page from "@/app/dashboard/page";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useFetchPortofLoadings,
  useFetchPreReceipt,
  useFetchScheme,
  useFetchState,
} from "@/hooks/useApi";

// Validation Schema
const branchFormSchema = z.object({
  branch_short: z.string().min(1, "Company short name is required"),
  branch_name: z.string().min(1, "Company name is required"),
  branch_name_short: z.string().min(1, "Company short name is required"),
  branch_address: z.string().min(1, "Company address is required"),
  branch_spice_board: z.string().optional(),
  branch_iec: z.string().min(1, "IEC code is required"),
  branch_apeda: z.string().optional(),
  branch_gst: z.string().min(1, "GST number is required"),
  branch_state: z.string().min(1, "State is required"),
  branch_prereceipts: z.string().min(1, "Pre Receipt is required"),
  branch_state_no: z.string().min(1, "State Code is required"),
  branch_state_short: z.string().min(1, "State Short is required"),
  branch_scheme: z.string().optional(),
  branch_pan_no: z.string().min(1, "PAN number is required"),
  branch_ecgcncb: z.string().optional(),
  branch_ecgc_policy: z.string().optional(),
  branch_reg_no: z.string().optional(),
  branch_port_of_loading: z.string().optional(),
  branch_sign_name: z.string().optional(),
  branch_sign_no: z.string().optional(),
  branch_sign_name1: z.string().optional(),
  branch_sign_no1: z.string().optional(),
  branch_sign_name2: z.string().optional(),
  branch_sign_no2: z.string().optional(),
});

const BranchHeader = ({ progress }) => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Create Company</h1>
        <p className="text-gray-600 mt-2">
          Add a new company to your organization
        </p>
      </div>

      <div className="flex-1 pt-2">
        <div className="sticky top-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Basic Details</span>
            <span className="text-sm font-medium">Additional Details</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-yellow-500 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-yellow-600">
              {progress}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const createBranch = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-create-branch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to create Company");
  return response.json();
};

const CreateBranch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_name_short: "",
    branch_address: "",
    branch_spice_board: "",
    branch_iec: "",
    branch_apeda: "",
    branch_gst: "",
    branch_state: "",
    branch_state_no: "",
    branch_scheme: "",
    branch_pan_no: "",
    branch_ecgcncb: "",
    branch_ecgc_policy: "",
    branch_reg_no: "",
    branch_port_of_loading: "",
    branch_sign_name: "",
    branch_sign_no: "",
    branch_sign_name1: "",
    branch_sign_no1: "",
    branch_sign_name2: "",
    branch_sign_no2: "",
    branch_state_short: "",
    branch_prereceipts: "",
  });
  const [progress, setProgress] = useState(0);
  const { data: portofLoadingData } = useFetchPortofLoadings();
  const { data: stateData } = useFetchState();
  const { data: schemeData } = useFetchScheme();
  const { data: prereceiptsData } = useFetchPreReceipt();
  
  const createBranchMutation = useMutation({
    mutationFn: createBranch,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/master/branch");
      } else {
        toast({
          title: "Error",
          description: response.msg,
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
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const calculateProgress = () => {
      const totalFields = Object.keys(formData).length;
      const filledFields = Object.values(formData).filter(
        (value) => value.toString().trim() !== ""
      ).length;
      const percentage = Math.round((filledFields / totalFields) * 100);
      setProgress(percentage);
    };

    calculateProgress();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const validatedData = branchFormSchema.parse(formData);
      createBranchMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          const field = err.path.join(".");
          return ` ${err.message}`;
        });

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
  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <BranchHeader progress={progress} />
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            {/* Branch Details Section */}
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1  row-span-2">
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Address <span className="text-red-500">*</span>
                </label>
                <Textarea
                  className="bg-white"
                  value={formData.branch_address}
                  onChange={(e) => handleInputChange(e, "branch_address")}
                  placeholder="Enter company address"
                  rows={5}
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_name}
                  onChange={(e) => handleInputChange(e, "branch_name")}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Short <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_short}
                  onChange={(e) => handleInputChange(e, "branch_short")}
                  placeholder="Enter company short "
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Prefix <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_name_short}
                  onChange={(e) => handleInputChange(e, "branch_name_short")}
                  placeholder="Enter company prefix"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  GST Number <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_gst}
                  onChange={(e) => handleInputChange(e, "branch_gst")}
                  placeholder="Enter GST number"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  IEC Code <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_iec}
                  onChange={(e) => handleInputChange(e, "branch_iec")}
                  placeholder="Enter IEC code"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_pan_no}
                  onChange={(e) => handleInputChange(e, "branch_pan_no")}
                  placeholder="Enter PAN number"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.branch_state}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "branch_state")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Enter state" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {stateData?.state?.map((item) => (
                      <SelectItem value={item.state_name} key={item.state_name}>
                        {item.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  State Code <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_state_no}
                  onChange={(e) => handleInputChange(e, "branch_state_no")}
                  placeholder="Enter state code"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  State Short <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_state_short}
                  onChange={(e) => handleInputChange(e, "branch_state_short")}
                  placeholder="Enter state short"
                />
              </div>
              
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Pre Receipt <span className="text-red-500">*</span>
                </label>
                <Select
                  key={formData.branch_prereceipts}
                  value={formData.branch_prereceipts}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "branch_prereceipts")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Enter pre receipt" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {prereceiptsData?.prereceipts?.map((item) => (
                      <SelectItem value={item.prereceipts_name} key={item.prereceipts_name}>
                        {item.prereceipts_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  APEDA Details
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_apeda}
                  onChange={(e) => handleInputChange(e, "branch_apeda")}
                  placeholder="Enter APEDA details"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Spice Board Details
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_spice_board}
                  onChange={(e) => handleInputChange(e, "branch_spice_board")}
                  placeholder="Enter spice board details"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  LUT Scheme
                </label>
                <Select
                  value={formData.branch_scheme}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "branch_scheme")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Enter  LUT scheme " />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {schemeData?.scheme?.map((item) => (
                      <SelectItem
                        value={item.scheme_short}
                        key={item.scheme_short}
                      >
                        {item.scheme_short}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
{/*  
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  ECGC/NCB Details
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_ecgcncb}
                  onChange={(e) => handleInputChange(e, "branch_ecgcncb")}
                  placeholder="Enter ECGC/NCB details"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  ECGC Policy Details
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_ecgc_policy}
                  onChange={(e) => handleInputChange(e, "branch_ecgc_policy")}
                  placeholder="Enter ECGC policy details"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Registration Number
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_reg_no}
                  onChange={(e) => handleInputChange(e, "branch_reg_no")}
                  placeholder="Enter registration number"
                />
              </div>
*/}
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Port of Loading
                </label>
                <Select
                  value={formData.branch_port_of_loading}
                  onValueChange={(value) =>
                    handleInputChange(
                      { target: { value } },
                      "branch_port_of_loading"
                    )
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Enter port of loading" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {portofLoadingData?.portofLoading?.map((item) => (
                      <SelectItem
                        value={item.portofLoading}
                        key={item.portofLoading}
                      >
                        {item.portofLoading}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Signatory Name 1
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_sign_name}
                  onChange={(e) => handleInputChange(e, "branch_sign_name")}
                  placeholder="Enter signatory name 1"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Signatory Number 1
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_sign_no}
                  onChange={(e) => handleInputChange(e, "branch_sign_no")}
                  placeholder="Enter signatory number 1"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Signatory Name 2
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_sign_name1}
                  onChange={(e) => handleInputChange(e, "branch_sign_name1")}
                  placeholder="Enter signatory Name 2"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Signatory No 2
                </label>
                <Input
                  className="bg-white"
                  value={formData.branch_sign_no1}
                  onChange={(e) => handleInputChange(e, "branch_sign_no1")}
                  placeholder="Enter signatory No 2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end">
          {createBranchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? "Submitting..." : "Create Company"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateBranch;
