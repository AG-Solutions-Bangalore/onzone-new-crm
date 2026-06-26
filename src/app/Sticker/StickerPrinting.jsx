import React, { useState } from "react";
import Page from "../dashboard/page";
import { useQuery } from "@tanstack/react-query";
import BASE_URL from "@/config/BaseUrl";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { ButtonConfig } from "@/config/ButtonConfig";

import { useToast } from "@/hooks/use-toast";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";

const StickerPrinting = () => {
  const { toast } = useToast();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const {
    data: stickerPending,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sticker-pending"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-sticker-printing/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
  });
  const {
    data: stickerPrint,
    isLoading: closedLoading,
    isError: Error,
  } = useQuery({
    queryKey: ["sticker-print"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-sticker-printing/Print`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    },
  });

  const columns = [
    {
      accessorKey: "work_order_no",
      header: "Work Order No",
      cell: ({ row }) => row.original.work_order_no,
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
      header: "Factory",
      cell: ({ row }) => row.original.work_order_factory,
    },
    {
      accessorKey: "work_order_brand",
      header: "Brand",
      cell: ({ row }) => row.original.work_order_brand,
    },
    {
      accessorKey: "work_order_count",
      id: "Total",

      header: "Total",
      cell: ({ row }) => row.original.work_order_count,
    },

    {
      accessorKey: "work_order_status",
      id: "Status",
      header: "Status",
      cell: ({ row }) => row.original.work_order_status,
    },
  ];
  const table = useReactTable({
    data: stickerPending || [],
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
  const closedTable = useReactTable({
    data: stickerPrint || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  if (isLoading) {
    return <LoaderComponent name="Sticker Printing" />;
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
        <div className="flex flex-col text-left">
          <h2 className="text-lg font-semibold text-gray-900">
            Sticker Printing
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Print only after MRP is confirmed
          </p>
        </div>
      </div>
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
                            header.getContext(),
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Total : &nbsp;
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
    </Page>
  );
};

export default StickerPrinting;
