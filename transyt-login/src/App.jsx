import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import EmpleadoDashboard from "./pages/dashboard/EmpleadoDashboard";
import EvaluacionViewer from "./components/evaluacion/EvaluacionViewer";
import ResultadosEvaluacion from "./components/evaluaciones/ResultadosEvaluacion";
import MisCertificados from "./components/MisCertificados";
import Unauthorized from "./pages/Unauthorized";
import { ThemeProvider } from "./contexts/ThemeContext";
import DragDropProvider from "./components/DragDropProvider";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import AccessibilityHelper from "./components/AccessibilityHelper";
import PWAInstallPrompt from "./components/PWAInstallPrompt";


const AppContent = () => {
  useKeyboardShortcuts();
  
  return (
    <DragDropProvider>
      <AccessibilityHelper />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["ADMIN"]}>
                <>
                  <Navbar />
                  <AdminDashboard />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/instructor/*"
            element={
              <PrivateRoute allowedRoles={["INSTRUCTOR"]}>
                <>
                  <Navbar />
                  <InstructorDashboard />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/empleado/*"
            element={
              <PrivateRoute allowedRoles={["EMPLEADO"]}>
                <>
                  <Navbar />
                  <EmpleadoDashboard />
                </>
              </PrivateRoute>
            }
          />
          <Route path="/test/:evaluacionId" element={<EvaluacionViewer />} />
          <Route 
            path="/admin/evaluaciones/:evaluacionId/resultados" 
            element={
              <PrivateRoute allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                <ResultadosEvaluacion />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/empleado/certificados" 
            element={
              <PrivateRoute allowedRoles={["EMPLEADO"]}>
                <>
                  <Navbar />
                  <MisCertificados />
                </>
              </PrivateRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
        <PWAInstallPrompt />

      </div>
    </DragDropProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;