import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const DisableRightClick = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleRightClick = (e) => {
      e.preventDefault();
      toast({
        title: "Access Denied",
        description: "Right-click is disabled on this page.",
        variant: "destructive", // or "default"
      });
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" || // Dev Tools
        (e.ctrlKey && e.key.toLowerCase() === "u") || // View Source
        (e.ctrlKey && e.key.toLowerCase() === "s") || // Save Page
        (e.ctrlKey && e.key.toLowerCase() === "h") || // History
        (e.ctrlKey && e.key.toLowerCase() === "a") || // Select All
        (e.ctrlKey && e.key.toLowerCase() === "p") || // Print
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || // Dev Tools
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") || // Dev Console
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") || // Inspect
        (e.metaKey && e.key.toLowerCase() === "s") || // CMD + S (Mac Save)
        (e.metaKey && e.key.toLowerCase() === "u") // CMD + U (Mac View Source)
      ) {
        e.preventDefault();
        toast({
          title: "Restricted Action",
          description: "This action is disabled on this page.",
          variant: "destructive",
        });
        return false;
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);
    document.onkeydown = handleKeyDown;

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.onkeydown = null;
    };
  }, [toast]);

  return null;
};

export default DisableRightClick;
