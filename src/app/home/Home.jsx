import React from "react";
import Page from "../dashboard/page";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { Activity, Printer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MetricCard = ({ title, value, icon: Icon, route }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(route)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["workordersales"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/fetch-dashboard-data-by/2025-26`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <LoaderComponent name="Dashboard Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Dashboard Data"
        refetch={refetch}
      />
    );
  }

  const recentOrders = dashboardData?.recent_work_order || [];
  const finalStockData = dashboardData?.finalStock || [];
  const pendingStickers = dashboardData?.pending_sticker_print || 0;

  return (
    <Page>
      <div className="max-w-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pending Sticker Print"
            value={pendingStickers}
            icon={Printer}
            route="/sticker-printing"
          />
          <MetricCard
            title="Pending Work Orders"
            value={dashboardData?.workorder_factory_count || 0}
            icon={Activity}
            route="/work-order"
          />
          <MetricCard
            title="Orders on the way"
            value={dashboardData?.workorder_ontheway_count || 0}
            icon={Activity}
            route="/order-received"
          />
          <MetricCard
            title="Active Retailers"
            value={dashboardData?.retailer_count || 0}
            icon={Activity}
            route="/master/retailer"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Recent Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium border-b">WO #</th>
                      <th className="px-4 py-3 font-medium border-b">Brand</th>

                      <th className="px-4 py-3 font-medium border-b">Pieces</th>
                      <th className="px-4 py-3 font-medium border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">
                            #{order.work_order_no}
                          </td>
                          <td className="px-4 py-3">
                            {order.work_order_brand}
                          </td>
                          <td className="px-4 py-3">
                            {order.work_order_count}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order.work_order_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No recent work orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Inventory by brand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {(() => {
                  const brandColors = [
                    {
                      bar: "bg-blue-200",
                      bg: "bg-blue-100",
                      text: "text-blue-700",
                      salesBar: "bg-blue-300",
                    },
                    {
                      bar: "bg-emerald-200",
                      bg: "bg-emerald-100",
                      text: "text-emerald-700",
                      salesBar: "bg-emerald-300",
                    },
                    {
                      bar: "bg-violet-200",
                      bg: "bg-violet-100",
                      text: "text-violet-700",
                      salesBar: "bg-violet-300",
                    },
                    {
                      bar: "bg-amber-200",
                      bg: "bg-amber-100",
                      text: "text-amber-700",
                      salesBar: "bg-amber-300",
                    },
                    {
                      bar: "bg-rose-200",
                      bg: "bg-rose-100",
                      text: "text-rose-700",
                      salesBar: "bg-rose-300",
                    },
                    {
                      bar: "bg-cyan-200",
                      bg: "bg-cyan-100",
                      text: "text-cyan-700",
                      salesBar: "bg-cyan-300",
                    },
                    {
                      bar: "bg-orange-200",
                      bg: "bg-orange-100",
                      text: "text-orange-700",
                      salesBar: "bg-orange-300",
                    },
                    {
                      bar: "bg-pink-200",
                      bg: "bg-pink-100",
                      text: "text-pink-700",
                      salesBar: "bg-pink-300",
                    },
                    {
                      bar: "bg-teal-200",
                      bg: "bg-teal-100",
                      text: "text-teal-700",
                      salesBar: "bg-teal-300",
                    },
                    {
                      bar: "bg-indigo-200",
                      bg: "bg-indigo-100",
                      text: "text-indigo-700",
                      salesBar: "bg-indigo-300",
                    },
                  ];
                  const maxVal = Math.max(
                    ...finalStockData.map((d) => d.total_received),
                    1,
                  );
                  return finalStockData
                    .sort((a, b) => b.total_received - a.total_received)
                    .map((item, index) => {
                      const color = brandColors[index % brandColors.length];
                      const receivedPercent =
                        (item.total_received / maxVal) * 100;
                      const salesPercent = (item.total_sales / maxVal) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">
                              {item.fabric_brand_brands}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-green-600">
                                {item.total_sales.toLocaleString()}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className={`font-semibold ${color.text}`}>
                                {item.total_received.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-full ${color.bg} rounded-full h-2 relative`}
                          >
                            <div
                              className={`${color.bar} h-2 rounded-full transition-all duration-500 absolute top-0 left-0`}
                              style={{ width: `${receivedPercent}%` }}
                            ></div>
                            <div
                              className={`bg-green-600 h-2 rounded-full transition-all duration-500 absolute top-0 left-0`}
                              style={{ width: `${salesPercent}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>{" "}
                              Sales
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${color.bar}`}
                              ></span>{" "}
                              Received
                            </span>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default Home;
