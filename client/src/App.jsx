import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import ProductDetail from "./pages/ProductDetail";

import AdminDashboard from "./pages/AdminDashboard";
import CollectionManagement from "./pages/admin/CollectionManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* ================= PRODUCT ROUTES ================= */}

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute type="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute type="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/collections"
          element={
            <ProtectedRoute type="admin">
              <CollectionManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute type="admin">
              <ProductManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute type="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
