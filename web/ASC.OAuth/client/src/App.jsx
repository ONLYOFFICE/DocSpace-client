import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import Login from "./Login";
import Consent from "./Consent";
import Error from "./Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/consent",
    element: <Consent />
  },
  {
    path: "/error",
    element: <Error />
  }
]);

function App() {
  return (
    <CookiesProvider>
      <RouterProvider router={router} />
    </CookiesProvider>
  );
};

export default App;
