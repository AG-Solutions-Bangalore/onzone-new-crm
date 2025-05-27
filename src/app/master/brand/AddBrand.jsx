import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
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
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";

const AddBrand = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fabric_brand_brands: "",
    fabric_brand_images: "",
    fabric_brand_short: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "fabric_brand_brands") {
     
      if (/^[A-Za-z ]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "fabric_brand_short") {
    
      if (/^[a-zA-Z0-9]{0,2}$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.fabric_brand_brands ||
      !selectedFile ||
      !formData.fabric_brand_short
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append("fabric_brand_brands", formData.fabric_brand_brands);
    data.append("fabric_brand_images", selectedFile);
    data.append("fabric_brand_short", formData.fabric_brand_short);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/create-brand`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: `${response.data.msg}`,
        });

        setFormData({
          fabric_brand_brands: "",
          fabric_brand_images: "",
          fabric_brand_short: "",
        });
        setSelectedFile(null);
        await queryClient.invalidateQueries(["brand"]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.msg || "Duplicate entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
        error.response?.data?.message || "Failed to create brand",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {pathname === "/master/brand" ? (
          <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4" /> Brand
          </Button>
        ) : pathname === "/create-contract" ||
          pathname === "/create-invoice" ||
          pathname === "/costing-create" ? (
          <p className="text-xs text-blue-600 hover:text-red-800 cursor-pointer">
            <span className="flex items-center flex-row gap-1">
              <SquarePlus className="w-4 h-4" /> <span>Add</span>
            </span>
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Brand Name */}
          <div className="grid gap-2">
            <Label htmlFor="fabric_brand_brands">Brand Name</Label>
            <Input
              id="fabric_brand_brands"
              name="fabric_brand_brands"
              value={formData.fabric_brand_brands}
              onChange={handleInputChange}
              placeholder="Enter Brand Name"
              required
            />
          </div>

          {/* Brand Short Code */}
          <div className="grid gap-2">
            <Label htmlFor="fabric_brand_short">Short Code</Label>
            <Input
              id="fabric_brand_short"
              name="fabric_brand_short"
              value={formData.fabric_brand_short}
              onChange={handleInputChange}
              placeholder="Ex: AD"
              maxLength={2}
              required
            />
          </div>

          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="fabric_brand_images">Brand Image</Label>
            <Input
              id="fabric_brand_images"
              name="fabric_brand_images"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
             className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Brand"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBrand;
