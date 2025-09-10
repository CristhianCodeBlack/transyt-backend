import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, BookOpen, Users, Award } from "lucide-react";
import { authService } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import logo from "../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    correo: "",
    clave: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mostrar toast de carga para cold starts
    const loadingToast = toast.loading('🔐 Conectando con el servidor...', {
      duration: 30000 // 30 segundos máximo
    });
    
    try {
      const response = await authService.login(formData.correo, formData.clave);
      
      // Descartar toast de carga
      toast.dismiss(loadingToast);
      
      // Guardar datos en localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("rol", response.rol);
      localStorage.setItem("nombre", response.nombre);
      
      toast.success(`🎉 ¡Bienvenido, ${response.nombre}!`);
      
      // Redirigir según el rol
      setTimeout(() => {
        if (response.rol === "ADMIN") navigate("/admin");
        else if (response.rol === "INSTRUCTOR") navigate("/instructor");
        else navigate("/empleado");
      }, 1000);
      
    } catch (error) {
      // Descartar toast de carga
      toast.dismiss(loadingToast);
      
      let errorMessage = "Error de conexión. Verifica tus credenciales.";
      
      if (error.message === 'Servidor no disponible. Intenta de nuevo en unos minutos.') {
        errorMessage = '⚠️ Servidor temporalmente no disponible. Intenta de nuevo en 1-2 minutos.';
      } else if (error.message === 'Credenciales incorrectas') {
        errorMessage = '❌ Correo o contraseña incorrectos.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <Toaster position="top-center" />
      
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-dark-800 dark:via-dark-700 dark:to-dark-800 relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              TRANSYT
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Plataforma de Capacitación Empresarial
            </p>
            <p className="text-blue-200 text-lg leading-relaxed">
              Desarrolla el talento de tu equipo con cursos especializados, 
              evaluaciones interactivas y certificaciones profesionales.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-300" />
              <span className="text-blue-100">Cursos interactivos y multimedia</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-300" />
              <span className="text-blue-100">Gestión completa de equipos</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-blue-300" />
              <span className="text-blue-100">Certificaciones verificables</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel derecho - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md border border-gray-100 dark:border-dark-600">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600 dark:text-gray-300">Accede a tu plataforma TRANSYT</p>
          </div>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          {/* Campo Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:bg-white dark:focus:bg-dark-600 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="tu@transyt.com"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="clave"
                value={formData.clave}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:bg-white dark:focus:bg-dark-600 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

          {/* Link a registro */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              ¿No tienes una cuenta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
          
          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-dark-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 TRANSYT. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;