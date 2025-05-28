
import DisableInspect from "./components/DisableRightClick/DisableRightClick";
import LoadingBar from "./components/loadingBar/LoadingBar";
import { Toaster } from "./components/ui/toaster";

import AppRoutes from "./routes/AppRoutes";
import { Suspense } from "react";






function App() {


 

  return (
    <>
      <Toaster />
      <DisableInspect/>
      <Suspense fallback={<LoadingBar/>}>
      <AppRoutes/>
      </Suspense>
    </>
  );
}

export default App;
