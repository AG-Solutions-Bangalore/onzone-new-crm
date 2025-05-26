


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
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import Page from "@/app/dashboard/page";


const ratioGroup = [
  { value: "a", label: "a" },
  { value: "ab", label: "ab" },
  { value: "abc", label: "abc" },
];

const ratioSchema = z.object({
  ratio_range: z.string().min(1, "Ratio range is required"),
  ratio_group: z.string().min(1, "Ratio group is required"),
  ratio_type38: z.string().min(1, "Ratio 38 is required"),
  ratio_type40: z.string().min(1, "Ratio 40 is required"),
  ratio_type42: z.string().min(1, "Ratio 42 is required"),
  ratio_type44: z.string().min(1, "Ratio 44 is required"),
  ratio_type46: z.string().min(1, "Ratio 46 is required"),
  ratio_type48: z.string().min(1, "Ratio 48 is required"),
  ratio_type50: z.string().min(1, "Ratio 50 is required"),
});

const AddHalfRatio = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ratioHalf, setRatioHalf] = useState({
    ratio_range: "",
    ratio_group: "",
    ratio_type38: "",
    ratio_type40: "",
    ratio_type42: "",
    ratio_type44: "",
    ratio_type46: "",
    ratio_type48: "",
    ratio_type50: "",
  });

  const onInputChange = (e) => {
    setRatioHalf({
      ...ratioHalf,
      [e.target.name]: e.target.value,
    });
  };

  const createRatioMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios({
        url: `${BASE_URL}/api/create-half-ratio`,
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
        navigate("/master/half-ratio");
      } else {
        throw new Error("Duplicate Entry");
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.msg,
      });
    },
  });

  const resetForm = () => {
    setRatioHalf({
      ratio_range: "",
      ratio_group: "",
      ratio_type38: "",
      ratio_type40: "",
      ratio_type42: "",
      ratio_type44: "",
      ratio_type46: "",
      ratio_type48: "",
      ratio_type50: "",
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    try {
      const validatedData = ratioSchema.parse(ratioHalf);
      createRatioMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
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
          <h3 className="text-lg md:text-xl font-bold">Create Half Ratio</h3>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ratio Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ratio_range">Ratio Range *</Label>
                  <Input
                    id="ratio_range"
                    name="ratio_range"
                    value={ratioHalf.ratio_range}
                    onChange={onInputChange}
                    placeholder="Enter ratio range"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_group">Ratio Group *</Label>
                  <Select
                    name="ratio_group"
                    value={ratioHalf.ratio_group}
                    onValueChange={(value) =>
                      setRatioHalf({ ...ratioHalf, ratio_group: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratioGroup.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type38">Half 38 *</Label>
                  <Input
                    id="ratio_type38"
                    name="ratio_type38"
                    value={ratioHalf.ratio_type38}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 38"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type40">Half 40 *</Label>
                  <Input
                    id="ratio_type40"
                    name="ratio_type40"
                    value={ratioHalf.ratio_type40}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type42">Half 42 *</Label>
                  <Input
                    id="ratio_type42"
                    name="ratio_type42"
                    value={ratioHalf.ratio_type42}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 42"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type44">Half 44 *</Label>
                  <Input
                    id="ratio_type44"
                    name="ratio_type44"
                    value={ratioHalf.ratio_type44}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 44"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type46">Half 46 *</Label>
                  <Input
                    id="ratio_type46"
                    name="ratio_type46"
                    value={ratioHalf.ratio_type46}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 46"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type48">Half 48 *</Label>
                  <Input
                    id="ratio_type48"
                    name="ratio_type48"
                    value={ratioHalf.ratio_type48}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 48"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type50">Half 50 *</Label>
                  <Input
                    id="ratio_type50"
                    name="ratio_type50"
                    value={ratioHalf.ratio_type50}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 50"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createRatioMutation.isPending}
                  className="gap-2"
                >
                  {createRatioMutation.isPending ? "Submitting..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>

                <Link to="/half-ratio">
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

export default AddHalfRatio;