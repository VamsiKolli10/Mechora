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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/" element={<MainLayout />}>
        <Route element={<PrivateLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </>
  )
);

export default router;
