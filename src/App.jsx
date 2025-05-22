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
      <Route path="/master/factory" element={<FactoryList />} />
      <Route path="/master/style" element={<StyleList />} />
      <Route path="/master/width" element={<WidthList />} />
      <Route path="/master/retailer" element={<RetailerList />} />
      <Route path="/master/ratio" element={<RatioList />} />
      <Route path="/master/half-ratio" element={<HalfRatioList />} />
      {/* work order  */}
      <Route path="/work-order" element={<WorkOrderList />} />
      {/* order received  */}
      <Route path="/order-received" element={<OrderReceivedList />} />
      {/* sales  */}
      <Route path="/sales" element={<SalesList />} />
      {/* finished stock  */}
      <Route path="/finished-stock" element={<FinishedStockList />} />
   

   {/* report  */}
   <Route path="/finished-stock" element={<FinishedStockList />} />
      </Routes>
    </>
  );
}

export default App;
