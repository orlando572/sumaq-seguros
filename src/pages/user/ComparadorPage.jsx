import React, { useState, useEffect } from "react";
import { Car, Home, Heart, Shield, CheckSquare, FileText, TrendingUp, DollarSign, Info, X, Mail, Send } from "lucide-react";
import ComparadorService from "../../service/user/ComparadorService";
import CotizacionService from "../../service/user/CotizacionService";

const ComparadorPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Vehicular");
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparacion, setComparacion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [planDetalle, setPlanDetalle] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [showCotizacionModal, setShowCotizacionModal] = useState(false);
  const [comentariosCotizacion, setComentariosCotizacion] = useState("");
  const [enviandoCotizacion, setEnviandoCotizacion] = useState(false);

  const categoryIcons = {
    "Vehicular": Car,
    "Hogar": Home,
    "Salud": Heart,
    "Vida": Shield
  };

  useEffect(() => {
    cargarSeguros();
    cargarEstadisticas();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedPlans.length >= 2) {
      compararPlanes();
    } else {
      setComparacion(null);
    }
  }, [selectedPlans]);

  const cargarSeguros = async () => {
    setLoading(true);
    try {
      const response = await ComparadorService.obtenerSegurosPorCategoria(selectedCategory);
      setSeguros(response.data);
    } catch (error) {
      console.error("Error al cargar seguros:", error);
      alert("Error al cargar los seguros");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await ComparadorService.obtenerEstadisticas(selectedCategory);
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const togglePlanSelection = (plan) => {
    setSelectedPlans((prev) => {
      const isSelected = prev.some((p) => p.idSeguro === plan.idSeguro);
      
      if (isSelected) {
        return prev.filter((p) => p.idSeguro !== plan.idSeguro);
      } else {
        if (prev.length >= 3) {
          alert("Solo puedes comparar hasta 3 planes a la vez");
          return prev;
        }
        return [...prev, plan];
      }
    });
  };

  const compararPlanes = async () => {
    try {
      const ids = selectedPlans.map(p => p.idSeguro);
      const response = await ComparadorService.compararPlanes(ids);
      setComparacion(response.data);
    } catch (error) {
      console.error("Error al comparar planes:", error);
    }
  };

  const verDetallePlan = async (idSeguro) => {
    try {
      const response = await ComparadorService.obtenerResumenPlan(idSeguro);
      setPlanDetalle(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      alert("Error al cargar el detalle del plan");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
  };

  const solicitarCotizacion = async () => {
    if (selectedPlans.length === 0) {
      alert("Debe seleccionar al menos un plan para cotizar");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('user'));
    if (!usuario || !usuario.idUsuario) {
      alert("Debe iniciar sesión para solicitar una cotización");
      return;
    }

    setEnviandoCotizacion(true);
    try {
      const idsPlanes = selectedPlans.map(p => p.idSeguro);
      const response = await CotizacionService.solicitarCotizacion(
        usuario.idUsuario,
        idsPlanes,
        comentariosCotizacion
      );

      if (response.data.exitoso) {
        alert(`✅ ${response.data.mensaje}\n\nLa cotización ha sido enviada a: ${response.data.correo}`);
        setShowCotizacionModal(false);
        setComentariosCotizacion("");
      } else {
        alert(`❌ ${response.data.mensaje}`);
      }
    } catch (error) {
      console.error("Error al solicitar cotización:", error);
      alert("Error al solicitar la cotización. Por favor, intente nuevamente.");
    } finally {
      setEnviandoCotizacion(false);
    }
  };

  const parseCoberturas = (coberturaPrincipal) => {
    if (!coberturaPrincipal || typeof coberturaPrincipal !== 'string') return [];
    // Dividir por comas o "y" para obtener las coberturas individuales
    return coberturaPrincipal
      .split(/,\s*|\s+y\s+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);
  };

  // Agrupar seguros por compañía
  const segurosPorCompania = seguros.reduce((acc, seguro) => {
    if (!seguro || !seguro.compania || !seguro.compania.nombre) return acc;
    const compania = seguro.compania.nombre;
    if (!acc[compania]) {
      acc[compania] = [];
    }
    acc[compania].push(seguro);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comparador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Comparador de Seguros</h1>

      {/* Estadísticas */}
      {estadisticas && estadisticas.totalPlanes > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Planes disponibles</p>
              <p className="text-2xl font-bold text-emerald-700">{estadisticas.totalPlanes}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Prima desde</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(estadisticas.primaMinima)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Cobertura hasta</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(estadisticas.coberturaMaxima)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Compañías</p>
              <p className="text-2xl font-bold text-emerald-700">{estadisticas.companias}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de categoría */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(categoryIcons).map(([category, Icon]) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setSelectedPlans([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              selectedCategory === category
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {category}
          </button>
        ))}
      </div>

      {/* Contador de planes seleccionados */}
      {selectedPlans.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedPlans.length} plan{selectedPlans.length !== 1 ? 'es' : ''} seleccionado{selectedPlans.length !== 1 ? 's' : ''} para comparar
            </span>
          </div>
          <button
            onClick={() => setSelectedPlans([])}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* Grid de seguros por compañía */}
      {Object.keys(segurosPorCompania).length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay planes disponibles</h3>
          <p className="text-gray-600">No se encontraron planes de seguro en la categoría "{selectedCategory}".</p>
          <p className="text-sm text-gray-500 mt-2">Por favor, seleccione otra categoría o intente más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(segurosPorCompania).map(([compania, planes]) => (
          <div key={compania} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {compania}
            </h3>
            <div className="space-y-4">
              {planes.map((plan) => {
                if (!plan || !plan.tipoSeguro || !plan.compania) return null;
                const Icon = categoryIcons[selectedCategory];
                const isSelected = selectedPlans.some((p) => p.idSeguro === plan.idSeguro);
                const coberturas = parseCoberturas(plan.tipoSeguro.coberturaPrincipal);

                return (
                  <div
                    key={plan.idSeguro}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{plan.tipoSeguro.nombre}</h4>
                        <p className="text-xs text-gray-500 mt-1">{plan.tipoSeguro.descripcion}</p>
                      </div>
                      <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prima mensual:</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(plan.primaMensual)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prima anual:</span>
                        <span className="font-semibold text-gray-700">{formatCurrency(plan.primaAnual)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cobertura:</span>
                        <span className="font-semibold text-gray-700">{formatCurrency(plan.montoAsegurado)}</span>
                      </div>
                      {plan.deducible && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Deducible:</span>
                          <span className="font-semibold text-gray-700">{formatCurrency(plan.deducible)}</span>
                        </div>
                      )}
                    </div>

                    {/* Coberturas principales - Solo mostrar si hay coberturas */}
                    {coberturas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">Coberturas principales:</p>
                        <div className="space-y-1">
                          {coberturas.slice(0, 3).map((cobertura, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <CheckSquare className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{cobertura}</span>
                            </div>
                          ))}
                          {coberturas.length > 3 && (
                            <p className="text-xs text-blue-600 font-medium">
                              +{coberturas.length - 3} coberturas más
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePlanSelection(plan)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        {isSelected ? "Seleccionado" : "Comparar"}
                      </button>
                      <button
                        onClick={() => verDetallePlan(plan.idSeguro)}
                        className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Ver detalles"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Tabla comparativa */}
      {comparacion && selectedPlans.length >= 2 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Comparativa de Planes</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  Mejor precio: <span className="font-bold text-green-600">{formatCurrency(comparacion.precioMin)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">
                  Mayor cobertura: <span className="font-bold text-blue-600">{formatCurrency(comparacion.coberturaMax)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="text-left p-3 font-semibold">Característica</th>
                  {selectedPlans.map((plan) => (
                    <th key={plan.idSeguro} className="text-left p-3 font-semibold min-w-[200px]">
                      {plan.tipoSeguro.nombre}
                      <div className="text-xs font-normal text-emerald-100 mt-1">
                        {plan.compania.nombre}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">Prima mensual</td>
                  {selectedPlans.map((plan) => (
                    <td key={plan.idSeguro} className="p-3">
                      <span className={`font-bold ${
                        plan.primaMensual === comparacion.precioMin ? 'text-green-600' : 'text-gray-800'
                      }`}>
                        {formatCurrency(plan.primaMensual)}
                      </span>
                      {plan.primaMensual === comparacion.precioMin && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Mejor precio</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-white">
                  <td className="p-3 font-medium text-gray-700">Prima anual</td>
                  {selectedPlans.map((plan) => (
                    <td key={plan.idSeguro} className="p-3 text-gray-800">
                      {formatCurrency(plan.primaAnual)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">Cobertura</td>
                  {selectedPlans.map((plan) => (
                    <td key={plan.idSeguro} className="p-3">
                      <span className={`font-bold ${
                        plan.montoAsegurado === comparacion.coberturaMax ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {formatCurrency(plan.montoAsegurado)}
                      </span>
                      {plan.montoAsegurado === comparacion.coberturaMax && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Mayor cobertura</span>
                      )}
                    </td>
                  ))}
                </tr>
                {selectedPlans.some(p => p.deducible) && (
                  <tr className="bg-white">
                    <td className="p-3 font-medium text-gray-700">Deducible</td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.idSeguro} className="p-3 text-gray-800">
                        {plan.deducible ? formatCurrency(plan.deducible) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">Forma de pago</td>
                  {selectedPlans.map((plan) => (
                    <td key={plan.idSeguro} className="p-3 text-gray-800">
                      {plan.formaPago}
                    </td>
                  ))}
                </tr>
                {/* Solo mostrar fila de coberturas si al menos un plan tiene coberturas */}
                {selectedPlans.some(plan => parseCoberturas(plan.coberturas).length > 0) && (
                  <tr className="bg-white">
                    <td className="p-3 font-medium text-gray-700 align-top">Coberturas</td>
                    {selectedPlans.map((plan) => {
                      const coberturas = parseCoberturas(plan.coberturas);
                      return (
                        <td key={plan.idSeguro} className="p-3">
                          {coberturas.length > 0 ? (
                            <ul className="space-y-1">
                              {coberturas.map((cob, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckSquare className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{cob}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Sin información</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
                <tr className="bg-emerald-50">
                  <td className="p-3 font-medium text-gray-700">Acción</td>
                  {selectedPlans.map((plan) => (
                    <td key={plan.idSeguro} className="p-3">
                      <button 
                        onClick={() => {
                          setSelectedPlans([plan]);
                          setShowCotizacionModal(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Cotizar
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cotización */}
      {showCotizacionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Solicitar Cotización</h2>
                </div>
                <button
                  onClick={() => setShowCotizacionModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  📧 Planes seleccionados: {selectedPlans.length}
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  {selectedPlans.map((plan, idx) => (
                    <li key={idx}>• {plan.tipoSeguro.nombre} - {plan.compania.nombre}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  value={comentariosCotizacion}
                  onChange={(e) => setComentariosCotizacion(e.target.value)}
                  placeholder="Ej: Necesito información sobre formas de pago, descuentos por familia, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ℹ️ La cotización detallada será enviada a su correo electrónico registrado.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCotizacionModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  disabled={enviandoCotizacion}
                >
                  Cancelar
                </button>
                <button
                  onClick={solicitarCotizacion}
                  disabled={enviandoCotizacion}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoCotizacion ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Cotización
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparadorPage;