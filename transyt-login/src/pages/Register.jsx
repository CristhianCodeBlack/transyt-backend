import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Building } from 'lucide-react';
import { authService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    clave: '',
    confirmClave: '',
    rol: 'EMPLEADO',
    empresaId: 1 // Por ahora fijo, luego se puede hacer dinámico
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.clave !== formData.confirmClave) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (formData.clave.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { confirmClave, ...registerData } = formData;
      await authService.register(registerData);
      
      toast.success('¡Registro exitoso! Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error en el registro. Intenta nuevamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-4 py-8">
      <Toaster position="top-center" />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Únete a TRANSYT</h1>
          <p className="text-gray-600">Crea tu cuenta en nuestra plataforma de capacitación</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Campo Nombre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="Tu nombre completo"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Campo Rol */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Rol
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white hover:border-blue-300"
                required
              >
                <option value="EMPLEADO">Empleado</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="clave"
                value={formData.clave}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmClave"
                value={formData.confirmClave}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-indigo-600 font-semibold hover:underline transition-colors"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;