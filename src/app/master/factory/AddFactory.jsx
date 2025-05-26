



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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import Page from "@/app/dashboard/page";


const factorySchema = z.object({
  factory_name: z.string().min(1, "Factory name is required"),
  factory_address: z.string().min(1, "Address is required"),
  factory_gstin: z.string().min(1, "GSTIN is required"),
  factory_contact_name: z.string()
    .min(1, "Contact name is required")
    .regex(/^[A-Za-z ]+$/, "Only letters allowed"),
  factory_contact_mobile: z.string()
    .min(10, "Must be 10 digits")
    .max(10, "Must be 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
  factory_contact_email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
});

const AddFactory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [factory, setFactory] = useState({
    factory_name: "",
    factory_address: "",
    factory_gstin: "",
    factory_contact_name: "",
    factory_contact_mobile: "",
    factory_contact_email: "",
  });

  const createFactoryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios({
        url: `${BASE_URL}/api/create-factory`,
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
        navigate("/master/factory");
      } else {
        throw new Error(data.msg || "Duplicate Entry");
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFactory({
      factory_name: "",
      factory_address: "",
      factory_gstin: "",
      factory_contact_name: "",
      factory_contact_mobile: "",
      factory_contact_email: "",
    });
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setFactory(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    try {
      const validatedData = factorySchema.parse(factory);
      createFactoryMutation.mutate(validatedData);
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
          <h3 className="text-lg md:text-xl font-bold">Create Factory</h3>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Factory Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="factory_name">Factory Name *</Label>
                  <Input
                    id="factory_name"
                    name="factory_name"
                    value={factory.factory_name}
                    onChange={onInputChange}
                    placeholder="Enter factory name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factory_contact_email">Email *</Label>
                  <Input
                    id="factory_contact_email"
                    name="factory_contact_email"
                    type="email"
                    value={factory.factory_contact_email}
                    onChange={onInputChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factory_address">Address *</Label>
                  <Input
                    id="factory_address"
                    name="factory_address"
                    value={factory.factory_address}
                    onChange={onInputChange}
                    placeholder="Enter address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factory_gstin">GSTIN *</Label>
                  <Input
                    id="factory_gstin"
                    name="factory_gstin"
                    value={factory.factory_gstin}
                    onChange={onInputChange}
                    placeholder="Enter GSTIN"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factory_contact_name">Contact Name *</Label>
                  <Input
                    id="factory_contact_name"
                    name="factory_contact_name"
                    value={factory.factory_contact_name}
                    onChange={onInputChange}
                    placeholder="Enter contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factory_contact_mobile">Mobile *</Label>
                  <Input
                    id="factory_contact_mobile"
                    name="factory_contact_mobile"
                    value={factory.factory_contact_mobile}
                    onChange={onInputChange}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createFactoryMutation.isPending}
                  className="gap-2"
                >
                  {createFactoryMutation.isPending ? (
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

                <Link to="/master/factory">
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

export default AddFactory;