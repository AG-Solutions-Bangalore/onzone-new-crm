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
  Edit,
  Eye,
  Loader2,
  Search,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  ContractCreate,
  ContractDelete,
  ContractEdit,
  ContractView,
} from "@/components/buttonIndex/ButtonComponents";
import { encryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const ContractList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteContractId, setDeleteContractId] = useState(null);
  const { toast } = useToast();
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["contract"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-contract-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.contract;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/panel-delete-contract/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      refetch();
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      });
    },
  });
  const confirmDelete = () => {
    if (deleteContractId) {
      deleteMutation.mutate(deleteContractId);
      setDeleteContractId(null);
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
      accessorKey: "contract_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("contract_date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "branch_short",
      header: "Company",
      cell: ({ row }) => <div>{row.getValue("branch_short")}</div>,
    },

    {
      accessorKey: "contract_no",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contract No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("contract_no")}</div>,
    },
    {
      accessorKey: "contract_buyer",
      header: "Buyer Name",
      cell: ({ row }) => <div>{row.getValue("contract_buyer")}</div>,
    },
    {
      accessorKey: "contract_consignee",
      header: "Consignee Name",
      cell: ({ row }) => <div>{row.getValue("contract_consignee")}</div>,
    },
    {
      accessorKey: "contract_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("contract_status");

        const statusColors = {
          PENDING: "bg-blue-100 text-blue-800",
          OPEN: "bg-green-100 text-green-800",
          CLOSE: "bg-red-100 text-red-800",
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
        const contractId = row.original.id;
        const contractStatus = row.original.contract_status;

        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/view-contract/${contractId}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button> */}
                  <ContractView
                    // onClick={() => navigate(`/view-contract/${contractId}`)}
                    onClick={() => {
                      const encryptedId = encryptId(contractId);

                      navigate(
                        `/view-contract/${encodeURIComponent(encryptedId)}`
                      );
                    }}
                  ></ContractView>
                </TooltipTrigger>
                <TooltipContent>View Contract</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {contractStatus !== "Close" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>

                    <ContractEdit

                      onClick={() => {
                        const encryptedId = encryptId(contractId);

                        navigate(
                          `/edit-contract/${encodeURIComponent(encryptedId)}`
                        );
                      }}
                    ></ContractEdit>
                  </TooltipTrigger>
                  <TooltipContent>Edit Contract</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}




            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ContractDelete
                    onClick={() => {
                      setDeleteContractId(contractId);
                      setDeleteConfirmOpen(true);
                    }}
                  ></ContractDelete>
                </TooltipTrigger>
                <TooltipContent>Delete Contract</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: contract || [],
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
    return <LoaderComponent name="Contract Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Contract Data"
        refetch={refetch}
      />
    );
  }
  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Contract List
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contract..."
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
          {/* <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => navigate("/create-contract")}
          >
            <SquarePlus className="h-4 w-4" /> Contract
          </Button> */}
          <ContractCreate
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => navigate("/create-contract")}
          ></ContractCreate>
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
            Total Contract : &nbsp;
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
              contract.
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
  );
};

export default ContractList;
