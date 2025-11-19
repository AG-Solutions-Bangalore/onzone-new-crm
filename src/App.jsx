
import DisableInspect from "./components/DisableRightClick/DisableRightClick";
import ErrorBoundry from "./components/errorBoundry/ErrorBoundry";
import LoadingBar from "./components/loadingBar/LoadingBar";
import { Toaster } from "./components/ui/toaster";

import AppRoutes from "./routes/AppRoutes";
import { Suspense } from "react";






function App() {


 

  return (
    <>
      <Toaster />
      {/* <DisableInspect/> */}
      <Suspense fallback={<LoadingBar/>}>
      <ErrorBoundry>
      <AppRoutes/>
      </ErrorBoundry>
      </Suspense>
    </>
  );
}

export default App;
