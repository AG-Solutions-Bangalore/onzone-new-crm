import React, { useState } from "react";
import Page from "../dashboard/page";
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
  ArrowUpDown,
  ChevronDown,
  Download,
  Edit,
  Eye,
  Loader2,
  Search,
  SquareChevronRight,
  SquarePlus,
  Trash,
  UserPen,
  View,
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

import BASE_URL from "@/config/BaseUrl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { ButtonConfig } from "@/config/ButtonConfig";


import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { useToast } from "@/hooks/use-toast";

const WorkOrderList = () => {
  const { toast } = useToast();
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteWorkOrderId, setDeleteWorkOrderId] = useState(null);
    const [downloadLoadingId, setDownloadLoadingId] = useState(null);
   
    const {
      data: workorder,
      isLoading,
      isError,
      refetch,
    } = useQuery({
      queryKey: ["workorder"],
      queryFn: async () => {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/fetch-work-order-list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data.workorder;
      },
    });
  
    const deleteMutation = useMutation({
      mutationFn: async (id) => {
        const token = localStorage.getItem("token");
        return await axios.delete(`${BASE_URL}/api/delete-half-work-order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      },
      onSuccess: (response) => {
        refetch();
        setDeleteConfirmOpen(false);
        toast({
          title: "Success",
          description: `${response.data.msg}`,
        });
      },
    });
    const confirmDelete = () => {
      if (deleteWorkOrderId) {
        deleteMutation.mutate(deleteWorkOrderId);
        setDeleteWorkOrderId(null);
      }
    };

    const updateData = async (e, id) => {
      e.preventDefault();
      setDownloadLoadingId(id);
      let data = {
        workorder_id: id,
      };
      try {
        const res = await axios.post(
          `${BASE_URL}/api/download-work-order-barcode-report-new`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            responseType: 'blob', 
          }
        );
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'workorder_barcode.csv');
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Success",
          description: "Excel Download Successfully",
        });
      } catch (error) {
        console.error("Error downloading barcode", error);
        toast({
          title: "Error",
          description: "Error downloading barcode",
        });
      } finally {
        setDownloadLoadingId(null);
      }
    };
    // State for table management
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();
  
    // Define columns for the table
    const columns = [
      {
        accessorKey: "work_order_no",
        id: "Work Order No",
        header: "Work Order No",
        cell: ({ row }) => <div>{row.getValue("Work Order No")}</div>,
      },
      {
        accessorKey: "work_order_date",
        id: "Date",
        header: "Date",
        cell: ({ row }) => {
          const date = row.getValue("Date");
          return moment(date).format("DD-MMM-YYYY");
        },
      },
      {
        accessorKey: "work_order_factory",
        id: "Factory",
        header: "Factory",
        cell: ({ row }) => <div>{row.getValue("Factory")}</div>,
      },
  
      {
        accessorKey: "work_order_brand",
        id:"Brand",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
           Brand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("Brand")}</div>,
      },
      {
        accessorKey: "work_order_count",
        id: "Total",
        header: "Total",
        cell: ({ row }) => <div>{row.getValue("Total")}</div>,
      },
     
      {
        accessorKey: "work_order_status",
        id: "Status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("Status");
  
          const statusColors = {
        
            Factory: "bg-green-100 text-green-800",
            Received: "bg-red-100 text-red-800",
          };
  
          return (
            <span
              className={`px-2 py-1 rounded text-xs ${statusColors[status] || "bg-gray-100 text-gray-800"
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
          const workOrderId = row.original.id;
    const materialStatus = row.original.work_order_status
          return (
            <div className="flex flex-row">

              {materialStatus !== "Received" &&(
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/work-order/edit-work-order/${workOrderId}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                   
                  </TooltipTrigger>
                  <TooltipContent>Edit Work Order</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              )}
              


              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/work-order/view-work-order/${workOrderId}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                   
                  </TooltipTrigger>
                  <TooltipContent>Work Order Receipt</TooltipContent>
                </Tooltip>
              </TooltipProvider>


              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => updateData(e, workOrderId)}
                      disabled={downloadLoadingId === workOrderId}
                      >
                        {downloadLoadingId === workOrderId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                    </Button>
                   
                  </TooltipTrigger>
                  <TooltipContent>Download Barcode</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/work-order/work-order-material/${workOrderId}`,{state:{
                        materialStatus
                      }})}
                    >
                      <SquareChevronRight className="h-4 w-4" />
                    </Button>
                   
                  </TooltipTrigger>
                  <TooltipContent>Work Order View List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
         
              
  
  
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    
                     <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteWorkOrderId(workOrderId);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Work Order</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ];
  
    // Create the table instance
    const table = useReactTable({
      data: workorder || [],
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
  
    // Render loading state
    if (isLoading) {
      return <LoaderComponent name="Work Order" />; 
    }
  
    // Render error state
    if (isError) {
      return (
        <ErrorComponent
          message="Error Fetching Work Order Data"
          refetch={refetch}
        />
      );
    }
  return (
   <Page>
     <div className="w-full p-4">
            <div className="flex text-left text-2xl text-gray-800 font-[400]">
              Work Order List
            </div>
            {/* searching and column filter  */}
            <div className="flex items-center py-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search work order..."
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
                    .map((column) => {
                      return (
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
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="default"
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={() => navigate("/work-order/create-work-order")}
              >
                <SquarePlus className="h-4 w-4" /> Work Order
              </Button>
            
            </div>
            {/* table  */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        );
                      })}
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
                              cell.getContext()
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
            {/* row slection and pagintaion button  */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Total Work Orders : &nbsp;
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
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  work order.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Page>
   
  )
}

export default WorkOrderList