import { useToast } from "@/hooks/use-toast";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { CountryCreate } from "@/components/buttonIndex/ButtonComponents";

const CreateCountry = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    country_name: "",
    country_port: "",
    country_dp: "",
    country_da: "",
    country_pol: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const response = await axios.post(
        `${BASE_URL}/api/panel-create-country`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        setFormData({
          country_name: "",
          country_port: "",
          country_dp: "",
          country_da: "",
          country_pol: "",
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
        description: error.response?.data?.message || "Failed to Country Banks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button variant="default" className="ml-2 bg-yellow-500 text-black hover:bg-yellow-100">
                <SquarePlus className="h-4 w-4" /> Customer
              </Button> */}

        {pathname === "/master/country" ? (
          // <Button
          //   variant="default"
          //   className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          // >
          //   <SquarePlus className="h-4 w-4" /> Country
          // </Button>
          <div>
            <CountryCreate
              className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            ></CountryCreate>
          </div>
        ) : pathname === "/create-contract" ||
          pathname === "/create-invoice" ||
          pathname === "/costing-create" ? (
          <p className="text-xs text-blue-600  hover:text-red-800 cursor-pointer">
            <span className="flex items-center flex-row gap-1">
              <SquarePlus className="w-4 h-4" /> <span>Add</span>
            </span>
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Country</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="country_name">Country Name</Label>
            <Input
              id="country_name"
              name="country_name"
              value={formData.country_name}
              onChange={handleInputChange}
              placeholder="Enter Country name"
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
              type="tel"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
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
              type="tel"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
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
              type="tel"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-yellow-500 text-black hover:bg-yellow-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Country"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCountry;
