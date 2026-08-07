import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ScanQrCode,
  Keyboard,
  X,
  Tag,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import {
  LoaderComponent,
  ErrorComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import ScannerModel from "@/components/ScannerModel";

const ALL_SIZES = [
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
];

const getSizeDisplayLabel = (sz) => {
  const map = {
    "36": "S-36",
    "38": "M-38",
    "40": "L-40",
    "42": "XL-42",
    "44": "2XL-44",
    "46": "3XL-46",
    "48": "4XL-48",
    "50": "5XL-50",
  };
  return map[sz] || sz;
};

const EditFairOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const typingBarcodeInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fair_order_retailer: "",
    fair_order_gst_no: "",
    fair_order_retailer_mobile: "",
    fair_order_remarks: "",
  });

  // Entry Mode state: 'typing' or 'scanner'
  const [entryMode, setEntryMode] = useState("typing");

  // Typing Mode State
  const [typingBarcode, setTypingBarcode] = useState("");

  // Size Modal State for Barcode
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [activeVerifiedStock, setActiveVerifiedStock] = useState(null);
  const [selectedSizesGrid, setSelectedSizesGrid] = useState([]);

  // Sub items list
  const [subItems, setSubItems] = useState([]);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Fetch Order details
  const {
    data: responseData,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["fairOrderFormById", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/fairOrderFormById/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // Populate order data
  useEffect(() => {
    if (responseData) {
      const orderHeader =
        responseData?.fairOrderForm ||
        responseData?.data?.fairOrderForm ||
        responseData?.data ||
        responseData ||
        {};

      const subs =
        responseData?.fairOrderSub ||
        responseData?.subs ||
        responseData?.data?.fairOrderSub ||
        responseData?.data?.subs ||
        orderHeader?.subs ||
        orderHeader?.fairOrderSub ||
        [];

      setFormData({
        fair_order_retailer: orderHeader?.fair_order_retailer || "",
        fair_order_gst_no: orderHeader?.fair_order_gst_no || "",
        fair_order_retailer_mobile: orderHeader?.fair_order_retailer_mobile || "",
        fair_order_remarks: orderHeader?.fair_order_remarks || "",
      });

      setSubItems(
        subs.map((item, idx) => ({
          subId: item.id || null,
          id: item.id || `temp-${idx}`,
          fair_order_sub_barcode_main:
            item.fair_order_sub_barcode_main || item.barcode_main || "",
          fair_order_sub_barcode:
            item.fair_order_sub_barcode || item.barcode || "",
          fair_order_sub_barcode_type:
            item.fair_order_sub_barcode_type || item.barcode_type || "S",
          fair_order_sub_dress_type:
            item.fair_order_sub_dress_type || item.dress_type || "S",
          fair_order_sub_dress_size:
            item.fair_order_sub_dress_size || item.dress_size || "S-36",
          fair_order_sub_mrp: item.fair_order_sub_mrp || item.mrp || "0",
          fair_order_sub_quantity:
            item.fair_order_sub_quantity ?? item.quantity ?? 1,
        }))
      );
    }
  }, [responseData]);

  // Fetch Stock list for verification
  const {
    data: stockData = [],
    isLoading: isStockLoading,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["fairOrderStock"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/fairOrderStock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || res.data || [];
    },
  });

  const stockList = Array.isArray(stockData) ? stockData : [];

  // Step 1: Verify barcode against fairOrderStock and open Size Grid Modal
  const handleVerifyBarcodeValue = async (codeToVerify) => {
    const trimmed = codeToVerify?.trim();
    if (!trimmed) {
      toast({
        title: "Input Required",
        description: "Please enter or scan a barcode number",
        variant: "destructive",
      });
      return;
    }

    const { data: freshStock } = await refetchStock();
    const activeStock = Array.isArray(freshStock) ? freshStock : stockList;

    const matchedStock = activeStock.find(
      (item) =>
        String(item.fair_barcode) === trimmed ||
        String(item.fair_barcode_main) === trimmed
    );

    if (!matchedStock) {
      toast({
        title: "Stock Unavailable",
        description: `Barcode "${trimmed}" is not available in fair order stock`,
        variant: "destructive",
      });
      return;
    }

    const availableQty =
      parseInt(matchedStock.stock ?? matchedStock.fair_temp_qnty ?? 0, 10);

    if (availableQty <= 0) {
      toast({
        title: "Out of Stock",
        description: `Stock for barcode "${trimmed}" is 0 or depleted`,
        variant: "destructive",
      });
      return;
    }

    setActiveVerifiedStock({
      raw: matchedStock,
      barcode: trimmed,
    });
    setSelectedSizesGrid([]);
    setSizeModalOpen(true);
  };

  // Toggle size pill selection in Grid Modal
  const toggleSizeSelection = (sz) => {
    setSelectedSizesGrid((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  // Step 2: Confirm size selection and add items to order list
  const handleConfirmAddSizes = () => {
    if (!activeVerifiedStock) return;
    if (selectedSizesGrid.length === 0) {
      toast({
        title: "Select Size",
        description: "Please select at least one size to add",
        variant: "destructive",
      });
      return;
    }

    const { raw, barcode } = activeVerifiedStock;
    const availableStock = parseInt(raw.stock ?? raw.fair_temp_qnty ?? 0, 10);

    const existingTotalForBarcode = subItems
      .filter((i) => String(i.fair_order_sub_barcode) === String(barcode))
      .reduce(
        (acc, curr) => acc + (parseInt(curr.fair_order_sub_quantity, 10) || 0),
        0
      );

    const requestedNewQty = selectedSizesGrid.length;
    const totalAfterAddition = existingTotalForBarcode + requestedNewQty;

    if (totalAfterAddition > availableStock) {
      toast({
        title: "Stock Limit Exceeded",
        description: `Barcode "${barcode}" has only ${availableStock} in stock. Total requested quantity would be ${totalAfterAddition}.`,
        variant: "destructive",
      });
      return;
    }

    const newAddedItems = [];

    selectedSizesGrid.forEach((szNum) => {
      const sizeVal = getSizeDisplayLabel(szNum);
      const existingIndex = subItems.findIndex(
        (i) =>
          i.fair_order_sub_barcode === barcode &&
          i.fair_order_sub_dress_size === sizeVal
      );

      if (existingIndex >= 0) {
        setSubItems((prev) =>
          prev.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  fair_order_sub_quantity: item.fair_order_sub_quantity + 1,
                }
              : item
          )
        );
      } else {
        newAddedItems.push({
          id: `new-${Date.now()}-${szNum}`,
          subId: null,
          fair_order_sub_barcode_main:
            raw.fair_barcode_main || raw.fair_barcode || barcode,
          fair_order_sub_barcode:
            raw.fair_barcode || raw.fair_barcode_main || barcode,
          fair_order_sub_barcode_type: raw.fair_barcode_type || "S",
          fair_order_sub_dress_type: raw.fair_dress_type || "S",
          fair_order_sub_dress_size: sizeVal,
          fair_order_sub_mrp: raw.fair_mrp || "0",
          fair_order_sub_quantity: 1,
        });
      }
    });

    if (newAddedItems.length > 0) {
      setSubItems((prev) => [...newAddedItems, ...prev]);
    }

    toast({
      title: "Items Added",
      description: `Added ${selectedSizesGrid.length} size(s) for Barcode: ${barcode}`,
    });

    setSizeModalOpen(false);
    setActiveVerifiedStock(null);
    setSelectedSizesGrid([]);
    setTypingBarcode("");

    if (typingBarcodeInputRef.current) {
      typingBarcodeInputRef.current.focus();
    }
  };

  const handleScannerScanResult = (scannedCode) => {
    setShowScannerModal(false);
    if (scannedCode) {
      handleVerifyBarcodeValue(scannedCode);
    }
  };

  // Delete single sub item mutation
  const deleteSubMutation = useMutation({
    mutationFn: async (subId) => {
      const token = localStorage.getItem("token");
      return await axios.delete(`${BASE_URL}/api/fairdeleteOrderSub/${subId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (res, subId) => {
      setSubItems((prev) => prev.filter((item) => item.subId !== subId));
      toast({
        title: "Item Deleted",
        description: res?.data?.msg || "Sub item deleted from order",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete sub item",
        variant: "destructive",
      });
    },
  });

  const handleRemoveSubItem = (item) => {
    if (item.subId) {
      deleteSubMutation.mutate(item.subId);
    } else {
      setSubItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({
        title: "Item Removed",
        description: "Item removed from order list",
      });
    }
  };

  const handleQuantityChange = (id, delta) => {
    const targetItem = subItems.find((i) => i.id === id);
    if (!targetItem) return;

    if (delta > 0) {
      const bCode = targetItem.fair_order_sub_barcode;
      const matchedStock = stockList.find(
        (stk) =>
          String(stk.fair_barcode) === String(bCode) ||
          String(stk.fair_barcode_main) === String(bCode)
      );
      const availableStock = matchedStock
        ? parseInt(matchedStock.stock ?? matchedStock.fair_temp_qnty ?? 0, 10)
        : 999;

      const currentTotalForBarcode = subItems
        .filter((i) => String(i.fair_order_sub_barcode) === String(bCode))
        .reduce(
          (acc, curr) => acc + (parseInt(curr.fair_order_sub_quantity, 10) || 0),
          0
        );

      if (currentTotalForBarcode + delta > availableStock) {
        toast({
          title: "Stock Limit Reached",
          description: `Cannot increase quantity. Maximum available stock for barcode "${bCode}" is ${availableStock}.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSubItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.fair_order_sub_quantity + delta;
            return newQty > 0 ? { ...item, fair_order_sub_quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleSizeChange = (id, newSize) => {
    setSubItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, fair_order_sub_dress_size: newSize } : item
      )
    );
  };

  // Submit Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/fairUpdateOrderForm/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data?.msg || "Fair Order Form updated successfully",
      });
      navigate("/fair-order-form");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || err?.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fair_order_retailer.trim()) {
      toast({
        title: "Validation Error",
        description: "Retailer name is required",
        variant: "destructive",
      });
      return;
    }

    if (subItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    // Re-verify stock quantities against fairOrderStock
    const { data: freshStock } = await refetchStock();
    const activeStock = Array.isArray(freshStock) ? freshStock : stockList;

    const barcodeTotals = {};
    subItems.forEach((item) => {
      const bCode = String(item.fair_order_sub_barcode);
      const qty = parseInt(item.fair_order_sub_quantity, 10) || 0;
      barcodeTotals[bCode] = (barcodeTotals[bCode] || 0) + qty;
    });

    for (const [bCode, totalReqQty] of Object.entries(barcodeTotals)) {
      const matched = activeStock.find(
        (stk) =>
          String(stk.fair_barcode) === bCode ||
          String(stk.fair_barcode_main) === bCode
      );
      if (!matched) {
        toast({
          title: "Stock Verification Failed",
          description: `Barcode "${bCode}" is no longer available in fairOrderStock.`,
          variant: "destructive",
        });
        return;
      }

      const availStock = parseInt(matched.stock ?? matched.fair_temp_qnty ?? 0, 10);
      if (totalReqQty > availStock) {
        toast({
          title: "Stock Limit Exceeded",
          description: `Barcode "${bCode}" has only ${availStock} available in stock, but order contains ${totalReqQty}. Please decrease quantity.`,
          variant: "destructive",
        });
        return;
      }
    }

    const payload = {
      fair_order_retailer: formData.fair_order_retailer,
      fair_order_gst_no: formData.fair_order_gst_no,
      fair_order_retailer_mobile: formData.fair_order_retailer_mobile,
      fair_order_remarks: formData.fair_order_remarks,
      subs: subItems.map((item) => ({
        id: item.subId || undefined,
        fair_order_sub_barcode_main: String(
          item.fair_order_sub_barcode_main || item.fair_order_sub_barcode
        ),
        fair_order_sub_barcode: String(item.fair_order_sub_barcode),
        fair_order_sub_barcode_type: String(
          item.fair_order_sub_barcode_type || "S"
        ),
        fair_order_sub_dress_type: String(
          item.fair_order_sub_dress_type || "S"
        ),
        fair_order_sub_dress_size: String(
          item.fair_order_sub_dress_size || "S-36"
        ),
        fair_order_sub_mrp: String(item.fair_order_sub_mrp || "0"),
        fair_order_sub_quantity: Number(item.fair_order_sub_quantity) || 1,
      })),
    };

    updateMutation.mutate(payload);
  };

  if (isOrderLoading) {
    return <LoaderComponent name="Fair Order Form" />;
  }

  if (isOrderError) {
    return (
      <ErrorComponent
        message="Failed to load order details for edit"
        refetch={refetchOrder}
      />
    );
  }

  const totalSets = subItems.length;
  const totalItems = subItems.reduce(
    (acc, curr) => acc + (parseInt(curr.fair_order_sub_quantity, 10) || 0),
    0
  );

  return (
    <Page>
      <div className="w-full p-4 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Edit Order #{id}
              </h1>
              <p className="text-xs text-gray-500">
                Verify barcode and select sizes from interactive popup grid
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Retailer Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Retailer & Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retailer">Retailer Name *</Label>
                <Input
                  id="retailer"
                  placeholder="Enter Retailer Name"
                  value={formData.fair_order_retailer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fair_order_retailer: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst_no">GST No</Label>
                <Input
                  id="gst_no"
                  placeholder="GST Number"
                  value={formData.fair_order_gst_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fair_order_gst_no: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="Retailer Mobile"
                  value={formData.fair_order_retailer_mobile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fair_order_retailer_mobile: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter remarks..."
                  rows={2}
                  value={formData.fair_order_remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fair_order_remarks: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Barcode Verification & Items Scanning Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold">
                  Items Entry & Stock Verification
                </CardTitle>

                {/* Entry Mode Toggle */}
                <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEntryMode("typing")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      entryMode === "typing"
                        ? "bg-white text-orange-600 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Keyboard className="h-4 w-4" />
                    Typing Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode("scanner")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      entryMode === "scanner"
                        ? "bg-white text-orange-600 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ScanQrCode className="h-4 w-4" />
                    Scanner Mode
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* TYPING MODE */}
              {entryMode === "typing" && (
                <div className="p-4 border rounded-lg bg-orange-50/40 space-y-3">
                  <div className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                    ⌨️ Typing Mode (Manual Barcode Entry)
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Input
                        ref={typingBarcodeInputRef}
                        placeholder="Enter barcode number (e.g. 70701)..."
                        value={typingBarcode}
                        onChange={(e) => setTypingBarcode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleVerifyBarcodeValue(typingBarcode);
                          }
                        }}
                        className="bg-white pr-8 text-base"
                      />
                      {typingBarcode && (
                        <button
                          type="button"
                          onClick={() => setTypingBarcode("")}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleVerifyBarcodeValue(typingBarcode)}
                      disabled={isStockLoading}
                      className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white min-w-28"
                    >
                      {isStockLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* SCANNER MODE */}
              {entryMode === "scanner" && (
                <div className="p-4 border rounded-lg bg-amber-50/40 space-y-4">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    📷 Scanner Mode (Camera / Barcode Scanner)
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 py-5 text-base"
                  >
                    <ScanQrCode className="h-5 w-5" />
                    Open Mobile Camera Scanner
                  </Button>
                </div>
              )}

              {/* Verified Items List (Matching Screenshot Cards) */}
              <div className="space-y-3 pt-2">
                {subItems.length > 0 ? (
                  subItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-orange-600 fill-orange-50" />
                          <span className="font-bold text-lg">
                            {item.fair_order_sub_barcode}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={deleteSubMutation.isPending}
                          onClick={() => handleRemoveSubItem(item)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        MRP: ₹{item.fair_order_sub_mrp} | Style:{" "}
                        {item.fair_order_sub_dress_type}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs font-semibold text-gray-600">
                            Size:
                          </span>
                          <select
                            value={item.fair_order_sub_dress_size}
                            onChange={(e) =>
                              handleSizeChange(item.id, e.target.value)
                            }
                            className="h-9 rounded-md border border-gray-300 bg-gray-50 px-3 text-xs font-medium focus:ring-1 focus:ring-orange-500"
                          >
                            {ALL_SIZES.map((sz) => {
                              const label = getSizeDisplayLabel(sz);
                              return (
                                <option key={sz} value={label}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Quantity Controls (- QTY +) */}
                        <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8 rounded-full bg-white shadow-xs"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="font-bold text-base px-3">
                            {item.fair_order_sub_quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8 rounded-full bg-white shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                    <p className="text-sm">
                      No items in order. Enter or scan barcode above to select sizes.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary Bar */}
              <div className="flex justify-between items-center text-sm font-semibold p-3 bg-gray-50 rounded-md border">
                <div>
                  <span className="text-gray-600">Retailer: </span>
                  <span>{formData.fair_order_retailer || "Not Selected"}</span>
                  <div className="text-xs text-gray-500 font-normal">
                    {subItems.length} unique barcode(s) added
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    Total Sets:{" "}
                    <span className="text-orange-600 font-bold">
                      {totalSets}
                    </span>
                  </div>
                  <div>
                    Total Items:{" "}
                    <span className="text-orange-600 font-bold">
                      {totalItems}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions Bar */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-36 py-5 text-base"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Order"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* POPUP 1: Size Grid Modal (Matching Mobile App Solid Theme - No Gradients) */}
      <Dialog open={sizeModalOpen} onOpenChange={setSizeModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6 bg-[#fdf6f0] border-0 shadow-2xl space-y-4">
          {/* Header Title */}
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Product Size Selection
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Select Sizes - {activeVerifiedStock?.barcode}
            </h2>
          </div>

          {/* Stock & MRP Bar */}
          <div className="flex items-center justify-between text-xs bg-white/80 p-2.5 rounded-xl border border-orange-100/60">
            <span className="font-bold text-orange-700">
              Stock Available: {activeVerifiedStock?.raw?.stock ?? activeVerifiedStock?.raw?.fair_temp_qnty ?? 0}
            </span>
            <span className="font-semibold text-gray-600">
              MRP: ₹{activeVerifiedStock?.raw?.fair_mrp || "0"}
            </span>
          </div>

          {/* Quick Actions & Selection Badge */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-gray-700">
              Selected:{" "}
              <span className="text-orange-600 font-extrabold text-sm">
                {selectedSizesGrid.length}
              </span>{" "}
              size(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedSizesGrid([...ALL_SIZES])}
                className="text-orange-600 hover:text-orange-800 font-bold hover:underline"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedSizesGrid([])}
                className="text-gray-500 hover:text-gray-700 font-medium hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sizes Grid */}
          <div className="grid grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto p-0.5">
            {ALL_SIZES.map((sz) => {
              const isSelected = selectedSizesGrid.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSizeSelection(sz)}
                  className={`py-3 rounded-2xl text-base font-black transition-all duration-150 flex items-center justify-center select-none ${
                    isSelected
                      ? "bg-[#e05300] text-white shadow-sm scale-95"
                      : "bg-white text-gray-900 border border-gray-200/90 hover:bg-orange-50/60 shadow-2xs"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-orange-100">
            <button
              type="button"
              onClick={() => {
                setSizeModalOpen(false);
                setSelectedSizesGrid([]);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm font-semibold px-2"
            >
              Cancel
            </button>
            <Button
              type="button"
              onClick={handleConfirmAddSizes}
              className="bg-[#e05300] hover:bg-[#c94a00] text-white font-bold px-6 py-3 rounded-xl text-base shadow-sm"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* POPUP 2: Mobile Camera Scanner Modal */}
      <Dialog open={showScannerModal} onOpenChange={setShowScannerModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ScannerModel barcodeScannerValue={handleScannerScanResult} />
          </div>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default EditFairOrderForm;
