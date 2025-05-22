import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Mail, MessageCircle, File, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SendEmailDialog from "./emailContract/SendEmailDialog";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";

const ContractActions = ({
  showLetterhead,
  setShowLetterhead,
  showSignature,
  setShowSignature,
  handleWithHeaderPrint,
  handleWithoutHeaderPrint,
  handleSignWithoutHeader,
  handleSignWithHeaderPrint,
  handleSignWithoutHeaderPdf,
  handleWithHeaderPdf,
  handleWithoutHeaderPdf,
  handleHeaderWithSignPdf,
  //email
  pdfRef,
  mailWoheaderWoSign,
  mailheadersign,
  mailHeaderWOSign,
  mailWOheadersign,
  //word
  wordWoheaderWoSign,
  wordheadersign,
  wordHeaderWOSign,
  wordWOheadersign,
  isWordLoading,
}) => {
  const [withHeader, setWithHeader] = useState(false); // Default is without header
  const [withSign, setWithSign] = useState(false);
  const handleHeaderChange = (checked) => {
    setShowLetterhead(checked);
  };
  const handleSignChange = (checked) => {
    setShowSignature(checked);
  };

  const handlePrint = () => {
    if (showLetterhead && showSignature) {
      handleSignWithHeaderPrint();
    } else if (showLetterhead) {
      handleWithHeaderPrint();
    } else if (showSignature) {
      handleWithoutHeaderPrint();
    } else {
      handleSignWithoutHeader();
    }
  };
  const handleSave = () => {
    if (showLetterhead && showSignature) {
      handleHeaderWithSignPdf();
    } else if (showLetterhead) {
      handleWithHeaderPdf();
    } else if (showSignature) {
      handleSignWithoutHeaderPdf();
    } else {
      handleWithoutHeaderPdf();
    }
  };
  const handleEmail = async (ref) => {
    if (showLetterhead && showSignature) {
      return await mailheadersign(ref);
    } else if (showLetterhead) {
      return await mailHeaderWOSign(ref);
    } else if (showSignature) {
      return await mailWOheadersign(ref);
    } else {
      return await mailWoheaderWoSign(ref);
    }
  };
  const handleWord = async (ref) => {
    if (showLetterhead && showSignature) {
      return await wordheadersign(ref);
    } else if (showLetterhead) {
      return await wordHeaderWOSign(ref);
    } else if (showSignature) {
      return await wordWOheadersign(ref);
    } else {
      return await wordWoheaderWoSign(ref);
    }
  };

  // const handleWhatsapp = () => {
  //   withHeader ? whatsappPdf() : whatsappWithoutHeaderPdf();
  // };

  return (
    <Tabs defaultValue="header" className=" ">
      <TabsContent value="header">
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handlePrint}
            className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print </span>
          </Button>

          <Button
            onClick={handleSave}
            className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
          >
            <FaRegFilePdf className="h-4 w-4" />
            <span>PDF</span>
          </Button>
          <Button
            onClick={handleWord}
            disabled={isWordLoading}
            className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2"
          >
              {isWordLoading ? (
         <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Loading..</span>
         </>
        ) : (
         <>
          <FaRegFileWord className="w-4 h-4" />
          <span>Word</span>
         </>
        )}
           
            
          </Button>

          <SendEmailDialog pdfRef={pdfRef} handleEmail={handleEmail} />

          <div className="flex items-center flex-row space-x-2">
            <Checkbox
              id="withHeader"
              checked={showLetterhead}
              onCheckedChange={handleHeaderChange}
            />
            <Label htmlFor="withHeader">With LH</Label>

            <Checkbox
              id="withSign"
              checked={showSignature}
              onCheckedChange={handleSignChange}
            />
            <Label htmlFor="withSign">Sign</Label>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContractActions;
