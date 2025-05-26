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

import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "@/config/ButtonConfig";

import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

import Page from "@/app/dashboard/page";

const FinishedStockList = () => {

      
  const {
    data: finalStock,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["finalStock"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-work-order-final-stock-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.finalStock;
    },
  });


 
  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [

    {
      accessorKey: "work_order_rc_sub_barcode",
      id: "T Code",
      header: "T Code",
      cell: ({ row }) => <div>{row.getValue("T Code")}</div>,
    },
  
    {
      accessorKey: "work_order_sub_brand",
      id: "Brand",
      header: "Brand",
      cell: ({ row }) => <div>{row.getValue("Brand")}</div>,
    },
   
    {
      accessorKey: "work_order_sub_length",
      id: "Length",
      header: "Length",
      cell: ({ row }) => <div>{row.getValue("Length")}</div>,
    },
    {
      accessorKey: "total_received",
      id: "Received",
      header: "Received",
      cell: ({ row }) => <div>{row.getValue("Received")}</div>,
    },
    {
      accessorKey: "total_sales",
      id: "Sales",
      header: "Sales",
      cell: ({ row }) => <div>{row.getValue("Sales")}</div>,
    },
    {
      accessorKey: "total_balance",
      id: "Balance",
      header: "Balance",
      cell: ({ row }) => {
        const received = row.original.total_received
        const sales =  row.original.total_sales
        return (
          received - sales
        )
      },
    },
    {
      accessorKey: "finished_stock_amount",
      id: "Amount",
      header: "Amount",
      cell: ({ row }) => <div>{row.getValue("Amount")}</div>,
    },
   
  


   
  ];

  // Create the table instance
  const table = useReactTable({
    data: finalStock || [],
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
    return <LoaderComponent name="Work Order Final Stock Data" />;
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Work Order Final Stock Data"
        refetch={refetch}
      />
    );
  }
  return (
    <Page>
            <div className="w-full p-4">
                 <div className="flex text-left text-2xl text-gray-800 font-[400]">
                 Work Order Final Stock List
                 </div>
                 {/* searching and column filter  */}
                 <div className="flex items-center py-4">
                   <div className="relative w-72">
                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                     <Input
                       placeholder="Search work order final stock..."
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
                     Total Order Finished : &nbsp;
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
    </Page>
  )
}

export default FinishedStockList