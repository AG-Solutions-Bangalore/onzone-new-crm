import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Label } from "@/components/ui/label";

const AddRatio = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("uploaded_file", selectedFile);

      const response = await axios.post(
        `${BASE_URL}/api/create-ratio-files`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: "Ratio is Inserted Successfully",
        });
        await queryClient.invalidateQueries(["ratios"]);
        setOpen(false);
        navigate('/ratio');
      } else {
        toast({
          title: "Error",
          description: response.data.msg || "Duplicate Entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload ratio file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/master/ratio" && (
          <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4 mr-2" />  Ratio
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Upload Ratio File</h4>
            <p className="text-sm text-muted-foreground">
              Upload Excel file with ratio data
            </p>
          </div>
          
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div className="grid gap-2">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="ratioFile">Ratio File *</Label>
                <Input 
                  id="ratioFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  Download sample format:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href="https://houseofonzone.com/admin/storage/app/public/File/format.xlsx"
                    download="ratio_format.xlsx"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={(e) => {e.preventDefault(),setOpen(false)}}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddRatio;