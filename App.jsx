import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transfer from "./pages/Transfer.jsx";
import Transactions from "./pages/Transactions.jsx";
import Beneficiaries from "./pages/Beneficiaries.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function App() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
