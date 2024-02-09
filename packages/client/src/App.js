// import "@docspace/shared/utils/wdyr";
import React from "react";
import { RouterProvider } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import "@docspace/common/custom.scss";

import router from "./router";

const App = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
