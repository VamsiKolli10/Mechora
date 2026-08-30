import { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const ErrorPage = lazy(() => import("@/pages/404Page"));
const Login = lazy(() => import("@/pages/Login"));
const Registration = lazy(() => import("@/pages/Login/signup"));
const PasswordReset = lazy(() => import("@/pages/Auth/PasswordReset"));
const VerifyEmail = lazy(() => import("@/pages/Auth/VerifyEmail"));
const ResponsiveLayout = lazy(() => import("@/pages/Layouts/ResponsiveLayout"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const Home = lazy(() => import("@/pages/Home"));
const ProductList = lazy(() => import("@/pages/Watches/ProductList"));
const ProductDetail = lazy(() => import("@/pages/Watches/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const AccountDashboard = lazy(() => import("@/pages/Account/Dashboard"));
const AccountOrders = lazy(() => import("@/pages/Account/Orders"));
const AccountProfile = lazy(() => import("@/pages/Account/Profile"));
const AccountAddresses = lazy(() => import("@/pages/Account/Addresses"));
const AccountPaymentMethods = lazy(
  () => import("@/pages/Account/PaymentMethods")
);

const pageLoader = (
  <div
    role="status"
    aria-label="Loading page"
    style={{
      minHeight: "50vh",
      display: "grid",
      placeItems: "center",
      fontFamily: "inherit",
    }}
  >
    Loading…
  </div>
);

const render = (element) => (
  <Suspense fallback={pageLoader}>{element}</Suspense>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={render(<Login />)} />
      <Route path="/registration" element={render(<Registration />)} />
      <Route path="/password-reset" element={render(<PasswordReset />)} />
      <Route path="/verify-email" element={render(<VerifyEmail />)} />
      <Route path="/" element={render(<ResponsiveLayout />)}>
        <Route index element={render(<Home />)} />
        <Route path="home" element={render(<Home />)} />
        <Route path="shop" element={render(<ProductList />)} />
        <Route path="shop/:slug" element={render(<ProductDetail />)} />
        <Route path="products" element={render(<ProductList />)} />
        <Route path="products/:slug" element={render(<ProductDetail />)} />
        <Route path="watches" element={render(<ProductList />)} />
        <Route path="watches/:slug" element={render(<ProductDetail />)} />
        <Route path="cart" element={render(<Cart />)} />
        <Route path="checkout" element={render(<Checkout />)} />
        <Route element={render(<ProtectedRoute />)}>
          <Route path="account" element={render(<AccountDashboard />)} />
          <Route path="account/profile" element={render(<AccountProfile />)} />
          <Route path="account/orders" element={render(<AccountOrders />)} />
          <Route
            path="account/orders/:orderId"
            element={render(<AccountOrders />)}
          />
          <Route
            path="account/addresses"
            element={render(<AccountAddresses />)}
          />
          <Route
            path="account/payment-methods"
            element={render(<AccountPaymentMethods />)}
          />
        </Route>
        <Route path="*" element={render(<ErrorPage />)} />
      </Route>
    </>
  )
);

export default router;
