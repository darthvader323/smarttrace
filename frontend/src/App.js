import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import GenerateBatch from "./pages/GenerateBatch";
import ScanVerify from "./pages/ScanVerify";
import ScanHistory from "./pages/ScanHistory";
import RecallStatusManagement from "./pages/RecallStatusManagement";
import SerialList from "./pages/SerialList";
import HierarchyTree from "./pages/HierarchyTree";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      if (location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (location.pathname === "/login" || location.pathname === "/register") {
      const role = localStorage.getItem("role");
      navigate(role === "ADMIN" ? "/dashboard" : "/scan", { replace: true });
    }
  }, [loggedIn, location.pathname, navigate]);

  if (!loggedIn) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login setLoggedIn={setLoggedIn} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const role = localStorage.getItem("role");
  const defaultRoute =
    role === "ADMIN"
      ? "/dashboard"
      : role === "SCANNER"
      ? "/scan"
      : "/login";

  const AdminRoute = ({ children }) => {
    if (role !== "ADMIN") {
      return <Navigate to="/scan" replace />;
    }
    return children;
  };

  return (
    <Layout setLoggedIn={setLoggedIn}>
      <Routes>
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/generate" element={<AdminRoute><GenerateBatch /></AdminRoute>} />
        <Route path="/tree" element={<AdminRoute><HierarchyTree /></AdminRoute>} />
        <Route path="/serials" element={<AdminRoute><SerialList /></AdminRoute>} />
        <Route path="/status-management" element={<AdminRoute><RecallStatusManagement /></AdminRoute>} />
        <Route path="/history" element={<ScanHistory />} />
        <Route path="/scan" element={<ScanVerify />} />
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
