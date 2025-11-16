import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./pages/routes";
import CartInitializer from "./components/CartInitializer";

function App() {
  return (
    <>
      <CartInitializer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
