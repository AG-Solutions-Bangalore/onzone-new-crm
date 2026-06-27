import React, { useState } from "react";
import Page from "../dashboard/page";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { ChevronDown, Loader2, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StickerPrinting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ─── Tab 1: Pending table state ────────────────────────────────────────────
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pendingGlobalFilter, setPendingGlobalFilter] = useState("");

  // ─── Tab 2: Printed table state ────────────────────────────────────────────
  const [printedSorting, setPrintedSorting] = useState([]);
  const [printedColumnFilters, setPrintedColumnFilters] = useState([]);
  const [printedColumnVisibility, setPrintedColumnVisibility] = useState({});
  const [printedGlobalFilter, setPrintedGlobalFilter] = useState("");

  // ─── Track which row is printing / downloading ─────────────────────────────
  const [printingId, setPrintingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // ─── Fetch: Pending stickers ────────────────────────────────────────────────
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // ─── Fetch: Printed stickers ─────────────────────────────────────────────────
  const {
    data: stickerPrint,
    isLoading: printedLoading,
    isError: printedError,
    refetch: refetchPrinted,
  } = useQuery({
    queryKey: ["sticker-print"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-sticker-printing/Print`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // ─── Mutation: Mark sticker as printed + download barcode report ─────────────
  const printMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");

      // 1) Update sticker status to printed
      const updateResponse = await axios.put(
        `${BASE_URL}/api/update-sticker-printing/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 2) Download barcode report CSV
      const barcodeResponse = await axios.post(
        `${BASE_URL}/api/download-work-order-barcode-report-new`,
        { workorder_id: id },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      // Trigger file download
      const url = window.URL.createObjectURL(new Blob([barcodeResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workorder_barcode.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return updateResponse.data;
    },
    onMutate: (id) => {
      setPrintingId(id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description:
          "Sticker marked as printed and barcode downloaded successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["sticker-pending"] });
      queryClient.invalidateQueries({ queryKey: ["sticker-print"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update sticker status.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPrintingId(null);
    },
  });

  // ─── Shared base columns (no Action) ────────────────────────────────────────
  const baseColumns = [
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
      id: "Brand",
      header: "Brand",
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
          Print: "bg-blue-100 text-blue-800",
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
  ];

  // ─── Pending columns: base + Action ─────────────────────────────────────────
  const pendingColumns = [
    ...baseColumns,
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;
        const isCurrentlyPrinting = printingId === id;
        return (
          <Button
            size="sm"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.textColor} ${ButtonConfig.hoverBackgroundColor} flex items-center gap-1`}
            onClick={() => printMutation.mutate(id)}
            disabled={isCurrentlyPrinting || printMutation.isPending}
          >
            <Printer className="w-3 h-3" />
            {isCurrentlyPrinting ? "Printing..." : "Print"}
          </Button>
        );
      },
    },
  ];

  // ─── Download barcode only (for Printed tab) ────────────────────────────────
  const handleDownloadBarcode = async (id) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/download-work-order-barcode-report-new`,
        { workorder_id: id },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "workorder_barcode.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Barcode downloaded successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to download barcode.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── Printed columns: base + Download Action ────────────────────────────────
  const printedColumns = [
    ...baseColumns,
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;
        const isCurrentlyDownloading = downloadingId === id;
        return (
          <Button
            size="sm"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.textColor} ${ButtonConfig.hoverBackgroundColor} flex items-center gap-1`}
            onClick={() => handleDownloadBarcode(id)}
            disabled={isCurrentlyDownloading}
          >
            {isCurrentlyDownloading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Printer className="w-3 h-3" />
            )}
            Reprint
          </Button>
        );
      },
    },
  ];

  // ─── Tab 1 table ─────────────────────────────────────────────────────────────
  const table = useReactTable({
    data: stickerPending || [],
    columns: pendingColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: pendingGlobalFilter,
    },
    initialState: {
      pagination: { pageSize: 7 },
    },
  });

  // ─── Tab 2 table ─────────────────────────────────────────────────────────────
  const closedTable = useReactTable({
    data: stickerPrint || [],
    columns: printedColumns,
    onSortingChange: setPrintedSorting,
    onColumnFiltersChange: setPrintedColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setPrintedColumnVisibility,
    globalFilterFn: "includesString",
    state: {
      sorting: printedSorting,
      columnFilters: printedColumnFilters,
      columnVisibility: printedColumnVisibility,
      globalFilter: printedGlobalFilter,
    },
    initialState: {
      pagination: { pageSize: 7 },
    },
  });

  if (isLoading) {
    return <LoaderComponent name="Sticker Printing" />;
  }
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Work Order Data"
        refetch={refetch}
      />
    );
  }

  // ─── Search + Columns toolbar ────────────────────────────────────────────────
  const renderToolbar = (
    tableInstance,
    globalFilter,
    setGlobalFilter,
    placeholder,
  ) => (
    <div className="flex items-center py-4">
      <div className="relative w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={placeholder}
          value={globalFilter || ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
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
          {tableInstance
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // ─── Table body renderer ─────────────────────────────────────────────────────
  const renderTable = (tableInstance, colCount) => (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
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
            {tableInstance.getRowModel().rows?.length ? (
              tableInstance.getRowModel().rows.map((row) => (
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
                <TableCell colSpan={colCount} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Total :&nbsp;
          {tableInstance.getFilteredRowModel().rows.length}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableInstance.previousPage()}
            disabled={!tableInstance.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableInstance.nextPage()}
            disabled={!tableInstance.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );

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

        <Tabs defaultValue="pending">
          <TabsList className="mt-4 mb-0">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="printed">Printed</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Pending ── */}
          <TabsContent value="pending">
            {renderToolbar(
              table,
              pendingGlobalFilter,
              setPendingGlobalFilter,
              "Search sticker...",
            )}
            {renderTable(table, pendingColumns.length)}
          </TabsContent>

          {/* ── Tab 2: Printed ── */}
          <TabsContent value="printed">
            {printedLoading ? (
              <LoaderComponent name="Printed Stickers" />
            ) : printedError ? (
              <ErrorComponent
                message="Error Fetching Printed Stickers"
                refetch={refetchPrinted}
              />
            ) : (
              <>
                {renderToolbar(
                  closedTable,
                  printedGlobalFilter,
                  setPrintedGlobalFilter,
                  "Search printed sticker...",
                )}
                {renderTable(closedTable, printedColumns.length)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
};

export default StickerPrinting;
