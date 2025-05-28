import React from 'react'
import Page from '../dashboard/page'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BASE_URL from '@/config/BaseUrl';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ErrorComponent, LoaderComponent } from '@/components/LoaderComponent/LoaderComponent';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

const Home = () => {
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
        }
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

  return (
    <Page>
      <div className="max-w-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Pending Work Orders"
            value={dashboardData?.workorder_factory_count || 0}
            icon={Activity}
            route='/work-order'
          />
          <MetricCard
            title="Orders on the way"
            value={dashboardData?.workorder_ontheway_count || 0}
            icon={Activity}
            route='/order-received'
          />
          <MetricCard
            title="Active Retailers"
            value={dashboardData?.retailer_count || 0}
            icon={Activity}
            route='/master/retailer'
          />
        </div>
      </div>
    </Page>
  );
}

export default Home;