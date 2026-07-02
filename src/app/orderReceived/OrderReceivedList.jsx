import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Edit,
  Loader2,
  Package,
  ReceiptText,
  Search,
  SquarePlus,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // <- import dialog
import BASE_URL from "@/config/BaseUrl";
import { useNavigate } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import Page from "@/app/dashboard/page";
import moment from "moment";

const OrderReceivedList = () => {
  // ----- fetch data -----
  const {
    data: workorderrc,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["workorderrc"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-received-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.workorderrc;
    },
  });

  // ----- table state -----
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // ----- confirmation dialog state -----
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmOrderId, setConfirmOrderId] = useState(null);

  // ----- mutation for updating status -----
  const [updatingId, setUpdatingId] = useState(null);
  const updateStatusMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/update-work-orders-received-factory-status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    onMutate: (id) => {
      setUpdatingId(id);
    },
    onSuccess: () => {
      refetch();
    },
    onSettled: () => {
      setUpdatingId(null);
      setConfirmDialogOpen(false); // close dialog after completion
      setConfirmOrderId(null);
    },
    onError: (error) => {
      console.error("Update status error:", error);
      setConfirmDialogOpen(false);
      setConfirmOrderId(null);
      // Optionally show toast error here
    },
  });

  // ----- handle dialog confirm -----
  const handleConfirm = () => {
    if (confirmOrderId) {
      updateStatusMutation.mutate(confirmOrderId);
    }
  };

  // ----- columns definition -----
  const columns = [
    {
      accessorKey: "work_order_rc_no",
      id: "Work Order Rc No",
      header: "Work Order Rc No",
      cell: ({ row }) => <div>{row.getValue("Work Order Rc No")}</div>,
    },
    {
      accessorKey: "work_order_rc_date",
      id: "Date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("Date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "work_order_rc_factory",
      id: "Factory",
      header: "Factory",
      cell: ({ row }) => <div>{row.getValue("Factory")}</div>,
    },
    {
      accessorKey: "work_order_rc_brand",
      id: "Brand",
      header: "Brand",
      cell: ({ row }) => <div>{row.getValue("Brand")}</div>,
    },
    {
      accessorKey: "work_order_rc_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("Status");
        const statusColors = {
          Active: "bg-green-100 text-green-800",
          Received: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const orderReceivedId = row.original.id;
        const orderReceivedStatus = row.original.work_order_rc_status;
        const userType = localStorage.getItem("userType");

        return (
          <div className="flex flex-row">
            {/* Edit */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(
                        `/order-received/edit-order-received/${orderReceivedId}`,
                      )
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Order Received</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Packing List */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(
                        `/order-received/view-order-received/${orderReceivedId}`,
                      )
                    }
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Packing List</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* DC Receipt */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(
                        `/order-received/dc-receipt/${orderReceivedId}`,
                        { state: { orderReceivedStatus } },
                      )
                    }
                  >
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>DC Receipt</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mark as Received button (only factory & not yet received) */}
            {userType === "4" && orderReceivedStatus !== "Received" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setConfirmOrderId(orderReceivedId);
                        setConfirmDialogOpen(true);
                      }}
                      disabled={
                        updateStatusMutation.isLoading &&
                        updatingId === orderReceivedId
                      }
                    >
                      {updateStatusMutation.isLoading &&
                      updatingId === orderReceivedId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mark as Received</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  // ----- table instance -----
  const table = useReactTable({
    data: workorderrc || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  // ----- loading / error -----
  if (isLoading) return <LoaderComponent name="Work Order Received Data" />;
  if (isError)
    return (
      <ErrorComponent
        message="Error Fetching Work Order Received Data"
        refetch={refetch}
      />
    );

  return (
    <Page>
      <div className="w-full p-4">
        {/* header */}
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          {localStorage.getItem("userType") == 4
            ? "New Packaging Slip List"
            : "Work Order Received List"}
        </div>

        {/* search & filter */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search work order received..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {localStorage.getItem("userType") == "4" && (
            <Button
              variant="default"
              className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={() => navigate("/work-order/factory-create-work-order")}
            >
              <SquarePlus className="h-4 w-4" /> New Packaging Slip
            </Button>
          )}

          {localStorage.getItem("userType") != "4" && (
            <Button
              variant="default"
              className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={() => navigate("/order-received/add-order-received")}
            >
              <SquarePlus className="h-4 w-4" /> Order Received
            </Button>
          )}
        </div>

        {/* table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Order Received : &nbsp;
            {table.getFilteredRowModel().rows.length}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ----- Confirmation Dialog ----- */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Completion</DialogTitle>
            <DialogDescription>
              Do you want to mark this order as <strong>Sent</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setConfirmOrderId(null);
              }}
            >
              No
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={updateStatusMutation.isLoading}
              className={ButtonConfig.backgroundColor}
            >
              {updateStatusMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Yes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default OrderReceivedList;
