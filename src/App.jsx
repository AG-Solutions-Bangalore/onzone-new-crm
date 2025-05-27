import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./app/auth/Login";
import Home from "./app/home/Home";
import { Toaster } from "./components/ui/toaster";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import BASE_URL from "./config/BaseUrl";
import BrandList from "./app/master/brand/BrandList";
import FactoryList from "./app/master/factory/FactoryList";
import HalfRatioList from "./app/master/halfRatio/HalfRatioList";
import RatioList from "./app/master/ratio/RatioList";
import RetailerList from "./app/master/retailer/RetailerList";
import StyleList from "./app/master/style/StyleList";
import WidthList from "./app/master/width/WidthList";
import WorkOrderList from "./app/workOrder/WorkOrderList";
import OrderReceivedList from "./app/orderReceived/OrderReceivedList";
import SalesList from "./app/sales/SalesList";
import FinishedStockList from "./app/finishedStock/FinishedStockList";
import CreateWorkOrder from "./app/workOrder/CreateWorkOrder";
import EditWorkOrder from "./app/workOrder/EditWorkOrder";
import WorkOrderReceipt from "./app/workOrder/WorkOrderReceipt";
import WorkOrderMaterial from "./app/workOrder/WorkOrderMaterial";
import EditBrand from "./app/master/brand/EditBrand";
import AddHalfRatio from "./app/master/halfRatio/AddHalfRatio";
import EditHalfRatio from "./app/master/halfRatio/EditHalfRatio";
import ViewRatio from "./app/master/ratio/ViewRatio";
import AddFactory from "./app/master/factory/AddFactory";
import EditFactory from "./app/master/factory/EditFactory";
import AddRetailer from "./app/master/retailer/AddRetailer";
import EditRetailer from "./app/master/retailer/EditRetailer";
import AddOrderReceived from "./app/orderReceived/AddOrderReceived";
import EditOrderReceived from "./app/orderReceived/EditOrderReceived";
import ViewOrderReceived from "./app/orderReceived/ViewOrderReceived";
import DcReceiptReceived from "./app/orderReceived/DcReceiptReceived";
import CreateSales from "./app/sales/CreateSales";
import EditSales from "./app/sales/EditSales";
import ViewSales from "./app/sales/ViewSales";
import RetailerReport from "./app/report/retailer/RetailerReport";
import WorkOrderReport from "./app/report/workOrder/WorkOrderReport";
import ReceivedReport from "./app/report/received/ReceivedReport";
import SalesReport from "./app/report/sales/SalesReport";





function App() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    
      localStorage.clear();
      navigate("/");
   
  };

  return (
    <>
      <Toaster />
      {/* <DisableRightClick /> */}
      {/* <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} /> */}
      <Routes>
        {/* Login Page        */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Dashboard  */}
        <Route path="/home" element={<Home />} />
      {/* Master  */}
      <Route path="/master/brand" element={<BrandList />} />
      <Route path="/master/brand/edit-brand/:id" element={<EditBrand />} />







      <Route path="/master/factory" element={<FactoryList />} />
      <Route path="/master/factory/add-factory" element={<AddFactory />} />
      <Route path="/master/factory/edit-factory/:id" element={<EditFactory />} />



      <Route path="/master/style" element={<StyleList />} />
      <Route path="/master/width" element={<WidthList />} />


      <Route path="/master/retailer" element={<RetailerList />} />
      <Route path="/master/retailer/add-retailer" element={<AddRetailer />} />
      <Route path="/master/retailer/edit-retailer/:id" element={<EditRetailer />} />



      <Route path="/master/ratio" element={<RatioList />} />
      <Route path="/master/ratio/view-ratio/:id" element={<ViewRatio />} />


      <Route path="/master/half-ratio" element={<HalfRatioList />} />
      <Route path="/master/half-ratio/add-half-ratio" element={<AddHalfRatio />} />
      <Route path="/master/half-ratio/edit-half-ratio/:id" element={<EditHalfRatio />} />

      {/* work order  */}
      <Route path="/work-order" element={<WorkOrderList />} />
      <Route path="/work-order/create-work-order" element={<CreateWorkOrder />} />
      <Route path="/work-order/edit-work-order/:id" element={<EditWorkOrder />} />

      <Route path="/work-order/view-work-order/:id" element={<WorkOrderReceipt />} />
      <Route path="/work-order/work-order-material/:id" element={<WorkOrderMaterial />} />
      {/* order received  */}
      <Route path="/order-received" element={<OrderReceivedList />} />
      <Route path="/order-received/add-order-received" element={<AddOrderReceived />} />
      <Route path="/order-received/edit-order-received/:id" element={<EditOrderReceived />} />
      <Route path="/order-received/view-order-received/:id" element={<ViewOrderReceived />} />
      <Route path="/order-received/dc-receipt/:id" element={<DcReceiptReceived />} />
      {/* sales  */}
      <Route path="/sales" element={<SalesList />} />
      <Route path="/sales/add-sales" element={<CreateSales />} />
      <Route path="/sales/view-sales/:id" element={<ViewSales />} />
      <Route path="/sales/edit-sales/:id" element={<EditSales />} />
      {/* finished stock  */}
      <Route path="/finished-stock" element={<FinishedStockList />} />
   

   {/* finished stock  */}
   <Route path="/finished-stock" element={<FinishedStockList />} />
   {/* report  */}
   <Route path="/report/retailer-report" element={<RetailerReport />} />
   <Route path="/report/work-order-report" element={<WorkOrderReport />} />
   <Route path="/report/received-report" element={<ReceivedReport />} />
   <Route path="/report/sales-report" element={<SalesReport />} />
      </Routes>
    </>
  );
}

export default App;
