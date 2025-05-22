import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Edit, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonConfig } from "@/config/ButtonConfig";
import { CountryEdit } from "@/components/buttonIndex/ButtonComponents";

const EditCountry = ({ countryId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    country_name: "",
    country_port: "",
    country_dp: "",
    country_da: "",
    country_pol: "",
  });

  const fetchCustomerData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-country-by-id/${countryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const countryData = response.data.country;
      setFormData({
        country_name: countryData.country_name,
        country_port: countryData.country_port,
        country_dp: countryData.country_dp,
        country_da: countryData.country_da,
        country_pol: countryData.country_pol,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch country data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomerData();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      bank_status: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.country_name ||
      !formData.country_port ||
      !formData.country_dp ||
      !formData.country_da ||
      !formData.country_pol
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-country/${countryId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

     
    if (response?.data.code == 200) {
    
      toast({
        title: "Success",
        description: response.data.msg
      });

     
      await queryClient.invalidateQueries(["countries"]);
      setOpen(false);
    } else {
     
      toast({
        title: "Error",
        description: response.data.msg,
        variant: "destructive",
      });
    }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update Bank",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
           <Button variant="ghost" size="icon">
             <Edit className="h-4 w-4" />
           </Button>
         </DialogTrigger> */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {/* <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button> */}
              <CountryEdit
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              ></CountryEdit>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Country</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bank</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="country_name">Country Name</Label>
              <Input
                id="country_name"
                name="country_name"
                value={formData.country_name}
                onChange={handleInputChange}
                placeholder="Enter Country Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country_port">Country Port</Label>
              <Input
                id="country_port"
                name="country_port"
                value={formData.country_port}
                onChange={handleInputChange}
                placeholder="Enter Country Port"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country_dp">DP</Label>
              <Input
                id="country_dp"
                name="country_dp"
                value={formData.country_dp}
                onChange={handleInputChange}
                placeholder="Enter DP Details "
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country_da">DA</Label>
              <Input
                id="country_da"
                name="country_da"
                value={formData.country_da}
                onChange={handleInputChange}
                placeholder="Enter DA Details "
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country_pol">POL</Label>
              <Input
                id="country_pol"
                name="country_pol"
                value={formData.country_pol}
                onChange={handleInputChange}
                placeholder="Enter POL Details "
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Country"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCountry;
