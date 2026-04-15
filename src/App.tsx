import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./Components/AdminDashboard";
import Home from "./Components/pages/Home";
import Dashboard from "./Components/pages/Dashboard";
// import Monitor from "./Components/pages/Monitor";


function App() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/monitor" element={<Monitor />} /> */}
    </Routes>
  );
}

export default App;