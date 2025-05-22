import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";

const SendEmailDialog = ({ pdfRef, handleEmail }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to_email: "",
    subject_email: "",
    description_email: "",
    attachment_email: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pdfBlob = await handleEmail(pdfRef.current);
      const token = localStorage.getItem("token");

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("to_email", formData.to_email);
      formDataToSend.append("subject_email", formData.subject_email);
      formDataToSend.append("description_email", formData.description_email);
      formDataToSend.append("attachment_email", pdfBlob, "Sales_Contract.pdf");
      const response = await axios.post(
        `${BASE_URL}/api/panel-send-document-email`,
        formDataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        setIsOpen(false);
        setFormData({
          to_email: "",
          subject_email: "",
          description_email: "",
          attachment_email: null,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error response:", error);
      console.error("Error details:", error.response?.data);

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2">
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Contract via Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Recipient Email"
              type="email"
              required
              value={formData.to_email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, to_email: e.target.value }))
              }
            />
          </div>
          <div>
            <Input
              placeholder="Subject"
              required
              value={formData.subject_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subject_email: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Textarea
              placeholder="Email Description"
              required
              value={formData.description_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description_email: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;
