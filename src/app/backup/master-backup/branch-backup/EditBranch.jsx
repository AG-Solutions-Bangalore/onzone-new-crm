import { ProgressBar } from "@/components/spinner/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "@/app/dashboard/page";
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  useFetchPortofLoadings,
  useFetchPreReceipt,
  useFetchScheme,
  useFetchState,
} from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

// Header Component
const BranchHeader = ({ branchDetails }) => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {branchDetails?.branch?.branch_name}
          </h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {branchDetails?.branch?.branch_status || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 mt-2">Update company details</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">
            Company Short : {branchDetails?.branch?.branch_short || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">
            Company Prefix: {branchDetails?.branch?.branch_name_short || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

const updateBranch = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-branch/${decryptedId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to update Company");
  return response.json();
};

const EditBranch = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
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
    branch_status: "Active",
  });

  // Fetch branch data by ID
  const {
    data: branchDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["branch", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-branch-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch branch");
      return response.json();
    },
  });

  const { data: portofLoadingData } = useFetchPortofLoadings();
  const { data: stateData } = useFetchState();
  const { data: schemeData } = useFetchScheme();
  const { data: prereceiptsData } = useFetchPreReceipt();
  useEffect(() => {
    if (branchDetails) {
      setFormData({
        branch_short: branchDetails?.branch.branch_short,
        branch_name: branchDetails?.branch.branch_name,
        branch_name_short: branchDetails.branch.branch_name_short,
        branch_address: branchDetails.branch.branch_address,
        branch_spice_board: branchDetails.branch.branch_spice_board,
        branch_iec: branchDetails.branch.branch_iec,
        branch_apeda: branchDetails.branch.branch_apeda,
        branch_gst: branchDetails.branch.branch_gst,
        branch_state: branchDetails?.branch?.branch_state,
        branch_state_no: branchDetails.branch.branch_state_no,
        branch_scheme: branchDetails?.branch?.branch_scheme,
        branch_pan_no: branchDetails.branch.branch_pan_no,
        branch_ecgcncb: branchDetails.branch.branch_ecgcncb,
        branch_ecgc_policy: branchDetails.branch.branch_ecgc_policy,
        branch_reg_no: branchDetails.branch.branch_reg_no,
        branch_port_of_loading: branchDetails.branch.branch_port_of_loading,
        branch_sign_name: branchDetails.branch.branch_sign_name,
        branch_sign_no: branchDetails.branch.branch_sign_no,
        branch_sign_name1: branchDetails.branch.branch_sign_name1,
        branch_sign_no1: branchDetails.branch.branch_sign_no1,
        branch_sign_name2: branchDetails.branch.branch_sign_name2,
        branch_sign_no2: branchDetails.branch.branch_sign_no2,
        branch_state_short: branchDetails.branch.branch_state_short,
        branch_prereceipts: branchDetails.branch.branch_prereceipts,
        branch_status: branchDetails.branch.branch_status,
      });
    }
  }, [branchDetails]);

  // Update branch mutation
  const updateBranchMutation = useMutation({
    mutationFn: updateBranch,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBranchMutation.mutate({ decryptedId, data: formData });
  };

  if (isLoading) {
    return <LoaderComponent name="Company Data" />; // ✅ Correct prop usage
  }
  if (isError) {
    return (
      <ErrorComponent message="Error Fetching Company Data" refetch={refetch} />
    );
  }

  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <BranchHeader branchDetails={branchDetails} />

        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            {/* Branch Details Section */}
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1 row-span-2">
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Address <span className="text-red-500">*</span>
                </label>
                <Textarea
                  className="bg-white"
                  rows={5}
                  value={formData.branch_address}
                  onChange={(e) => handleInputChange(e, "branch_address")}
                  placeholder="Enter company address"
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
                key={formData.branch_state} 
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
                  LUT Scheme
                </label>
                {/* <Input
                  className="bg-white"
                  value={formData.branch_scheme}
                  onChange={(e) => handleInputChange(e, "branch_scheme")}
                  placeholder="Enter scheme details"
                /> */}
                <Select
                  key={formData.branch_scheme}
                  value={formData.branch_scheme}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "branch_scheme")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Enter LUT scheme " />
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
                {/* <Input
                  className="bg-white"
                  value={formData.branch_port_of_loading}
                  onChange={(e) =>
                    handleInputChange(e, "branch_port_of_loading")
                  }
                  placeholder="Enter port of loading"
                /> */}

                <Select
                  key={formData.branch_port_of_loading}
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

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Company Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.branch_status}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "branch_status")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end">
          {updateBranchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending ? "Updating..." : "Update Company"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EditBranch;
