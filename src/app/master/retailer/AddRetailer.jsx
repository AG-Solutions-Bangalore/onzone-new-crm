import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import Page from "@/app/dashboard/page";

const retailerTypes = [
  { value: "Agent", label: "Agent" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Distributor", label: "Distributor" },
  { value: "Retailers", label: "Retailers" },
];

const prefixOptions = [
  { value: "Mr", label: "Mr" },
  { value: "Ms", label: "Ms" },
  { value: "Mrs", label: "Mrs" },
  { value: "Dr", label: "Dr" },
];

const retailerSchema = z.object({
  customer_name: z.string()
    .min(1, "Retailer name is required")
    .regex(/^[A-Za-z ]+$/, "Only letters allowed"),
  customer_type: z.string().min(1, "Type is required"),
  customer_mobile: z.string()
    .min(10, "Must be 10 digits")
    .max(10, "Must be 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  customer_email: z.string().email("Invalid email format"),
  customer_address: z.string().min(1, "Address is required"),
  company_prefix: z.string().min(1, "Prefix is required"),
  company_code: z.string()
    .min(1, "Retailer code is required")
    .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
  company_gst: z.string()
    .min(1, "GST number is required")
    .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
});

const AddRetailer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    customer_name: "",
    customer_type: "",
    customer_mobile: "",
    customer_email: "",
    customer_address: "",
    company_prefix: "",
    company_code: "",
    company_gst: "",
  });

  const createRetailerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios({
        url: `${BASE_URL}/api/create-customer`,
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast({
          title: "Success",
          description: `${data.msg}`,
        });
        resetForm();
        navigate("/master/retailer");
      } else {
        throw new Error(data.msg || "Duplicate Entry");
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.msg?.includes("duplicate") 
          ? "Duplicate entry" 
          : "Error creating retailer",
      });
    },
  });

  const resetForm = () => {
    setCustomer({
      customer_name: "",
      customer_type: "",
      customer_mobile: "",
      customer_email: "",
      customer_address: "",
      company_prefix: "",
      company_code: "",
      company_gst: "",
    });
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const onSelectChange = (name, value) => {
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    try {
      const validatedData = retailerSchema.parse(customer);
      createRetailerMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: err.message,
          });
        });
      }
    }
  };

  return (
    <Page>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-card p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg md:text-xl font-bold">Create Retailer</h3>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Retailer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prefix Field */}
                <div className="space-y-2">
                  <Label htmlFor="company_prefix">Prefix *</Label>
                  <Select
                    value={customer.company_prefix}
                    onValueChange={(value) => onSelectChange("company_prefix", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      {prefixOptions.map((prefix) => (
                        <SelectItem key={prefix.value} value={prefix.value}>
                          {prefix.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Retailer Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Retailer Name *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={customer.customer_name}
                    onChange={onInputChange}
                    placeholder="Enter retailer name"
                  />
                </div>

                {/* Retailer Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="company_code">Retailer Code *</Label>
                  <Input
                    id="company_code"
                    name="company_code"
                    value={customer.company_code}
                    onChange={onInputChange}
                    placeholder="Enter retailer code"
                  />
                </div>

                {/* Type Field */}
                <div className="space-y-2">
                  <Label htmlFor="customer_type">Type *</Label>
                  <Select
                    value={customer.customer_type}
                    onValueChange={(value) => onSelectChange("customer_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {retailerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* GST Field */}
                <div className="space-y-2">
                  <Label htmlFor="company_gst">GST Number *</Label>
                  <Input
                    id="company_gst"
                    name="company_gst"
                    value={customer.company_gst}
                    onChange={onInputChange}
                    placeholder="Enter GST number"
                  />
                </div>

                {/* Mobile Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="customer_mobile">Mobile Number *</Label>
                  <Input
                    id="customer_mobile"
                    name="customer_mobile"
                    value={customer.customer_mobile}
                    onChange={onInputChange}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={customer.customer_email}
                    onChange={onInputChange}
                    placeholder="Enter email"
                  />
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <Label htmlFor="customer_address">Address *</Label>
                  <Input
                    id="customer_address"
                    name="customer_address"
                    value={customer.customer_address}
                    onChange={onInputChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createRetailerMutation.isPending}
                  className="gap-2"
                >
                  {createRetailerMutation.isPending ? (
                    <>
                      <Send className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>

                <Link to="/master/retailer">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default AddRetailer;