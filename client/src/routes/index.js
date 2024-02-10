import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Homepage from "../pages/Homepage";
import RoomPage from "../pages/Roompage";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/room/:id",
        element: <RoomPage />,
      },
    ],
  },
]);

export default route;
