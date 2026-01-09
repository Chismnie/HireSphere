import "./App.css";
import routers from "./router/router";
import { RouterProvider } from "react-router-dom";
function App() {
  return <RouterProvider router={routers}></RouterProvider>;
}

export default App;
