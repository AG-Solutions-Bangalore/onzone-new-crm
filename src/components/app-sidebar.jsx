import * as React from "react";
import {
  AudioWaveform,
  BadgeIndianRupee,
  Blocks,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  NotebookText,
  ReceiptText,
  Settings,
  Settings2,
  TicketPlus,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";


export function AppSidebar({ ...props }) {
  const nameL = localStorage.getItem("name");
  const emailL = localStorage.getItem("email");
  const userType = localStorage.getItem("userType");


  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `Onzone`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: Frame,
        isActive: false,
      },
      {
        title: "Master",
        url: "#",
        isActive: false,
        icon: Settings2,
        items: [
          {
            title: "Brand",
            url: "/master/brand",
          },
          {
            title: "Style",
            url: "/master/style",
          },
          {
            title: "Factory",
            url: "/master/factory",
          },
          {
            title: "Width",
            url: "/master/width",
          },
          {
            title: "Retailer",
            url: "/master/retailer",
          },
          {
            title: "Ratio",
            url: "/master/ratio",
          },
          {
            title: "Half Ratio",
            url: "/master/half-ratio",
          },
          
        ],
      },
      {
        title: "Work Order",
        url: "/work-order",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "Stock",
        url: "/create-stock",
        icon: Blocks,
        isActive: false,
      },
      {
        title: "Order Received",
        url: "/order-received",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Sales",
        url: "/sales",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Order Form",
        url: "/order-form",
        icon: NotebookText,
        isActive: false,
      },
      {
        title: "Finished Stock",
        url: "/finished-stock",
        icon: NotebookText,
        isActive: false,
      },

    
      {
        title: "Reports",
        url: "#",
        icon: ReceiptText,
        isActive: false,
        items: [
          {
            title: "Retailer Report",
            url: "/report/retailer-report",
          },
          {
            title: "Work Order Report",
            url: "/report/work-order-report",
          },
          {
            title: "Received Report",
            url: "/report/received-report",
          },
          {
            title: "Sales Report",
            url: "/report/sales-report",
          },
          
        ],
      },
   
    ],

  };


  const data = {
    ...initialData,
    navMain:
      userType === "4"
        ? [
            {
              title: "Work Order",
              url: "/work-order",
              icon: Blocks,
              isActive: false,
            },
          ]
        : initialData.navMain,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
       
        <NavMain items={data.navMain} />
 
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
