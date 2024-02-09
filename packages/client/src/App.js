// import "@docspace/shared/utils/wdyr";
import React from "react";
import { RouterProvider } from "react-router-dom";

import "@docspace/common/custom.scss";

import router from "./router";

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
