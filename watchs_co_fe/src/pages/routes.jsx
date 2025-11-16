import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ErrorPage from "@/pages/404Page";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Registration from "@/pages/Login/signup";
import PrivateLayout from "@/pages/Layouts/PrivateLayout";
import MainLayout from "@/pages/Layouts/MainLayout";
import ProductList from "@/pages/Watches/ProductList";
import ProductDetail from "@/pages/Watches/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import AccountDashboard from "@/pages/Account/Dashboard";
import AccountOrders from "@/pages/Account/Orders";
import AccountProfile from "@/pages/Account/Profile";
import AccountAddresses from "@/pages/Account/Addresses";
import AccountPaymentMethods from "@/pages/Account/PaymentMethods";
import PasswordReset from "@/pages/Auth/PasswordReset";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/" element={<MainLayout />}>
        {/* Landing */}
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        {/* Public shopping routes */}
        <Route path="shop" element={<ProductList />} />
        <Route path="shop/:slug" element={<ProductDetail />} />
        {/* Legacy URLs */}
        <Route path="watches" element={<ProductList />} />
        <Route path="watches/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        {/* Protected account routes */}
        <Route element={<PrivateLayout />}>
          <Route path="account" element={<AccountDashboard />} />
          <Route path="account/profile" element={<AccountProfile />} />
          <Route path="account/orders" element={<AccountOrders />} />
          <Route path="account/orders/:orderId" element={<AccountOrders />} />
          <Route path="account/addresses" element={<AccountAddresses />} />
          <Route path="account/payment-methods" element={<AccountPaymentMethods />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </>
  )
);

export default router;
