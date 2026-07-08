import { Route, Routes } from "react-router-dom";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import ProjectDetail from "@/pages/ProjectDetail";
import ReviewDetail from "@/pages/ReviewDetail";
import History from "@/pages/History";
import NotFound from "@/pages/NotFound";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public routes with Navbar/Footer */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes with Dashboard layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}