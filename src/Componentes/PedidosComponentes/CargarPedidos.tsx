import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { cargarPedidosMasivo } from '../../Funciones/ApiPedidos/apiPedidos';
import './CargarPedidos.css';

const CargarPedidos: React.FC = () => {
  const [autorizado, setAutorizado] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const perfil = Cookies.get('perfilPedidosCookie');
    if (perfil === 'ADMIN' || perfil === 'OPERADOR') {
      setAutorizado(true);
    }
  }, []);

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0] ?? null;
    if (!archivo) return;

    const usuario = Cookies.get('usuarioPedidosCookie');
    if (!usuario) {
      Swal.fire('Error', 'Usuario no válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Llamada al backend
      const res = await cargarPedidosMasivo(usuario, archivo);

      // Popup de éxito con tiempo redondeado a segundos
      const segundos = Math.round(res.tiempo_segundos);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        html: `
          ${res.mensaje}<br/>
          <b>Tiempo:</b> ${segundos} s
        `,
        confirmButtonText: 'OK'
      }).then(() => window.location.reload());

    } catch (err: any) {
      console.error('Error de API:', err.response?.data);

      let data = err.response?.data?.detail ?? err.response?.data;

      // Intentar parsear si viene como string JSON
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          // Si no es JSON válido, dejarlo como string
        }
      }

      if (typeof data === 'string') {
        // Mensaje de error simple
        Swal.fire('Error', data, 'error');
      } else if (data?.errores && Array.isArray(data.errores)) {
        // Lista de errores del archivo
        Swal.fire({
          title: data.mensaje || 'Errores en el archivo',
          html: `<ul style="text-align:left">${data.errores
            .map((e: string) => `<li>${e}</li>`)
            .join('')}</ul>`,
          icon: 'error',
          width: 600
        });
      } else {
        // Cualquier otro formato de error
        const msg = data?.mensaje || err.response?.statusText || err.message;
        Swal.fire('Error', msg, 'error');
      }
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const lanzarSelector = () => {
    if (inputRef.current) inputRef.current.click();
  };

  if (!autorizado) return null;

  return (
    <div className="CargarPedidos-contenedor">
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".xlsx,.xls,.xlsm"
        onChange={handleArchivo}
        disabled={loading}
      />
      <button
        className="CargarPedidos-boton"
        onClick={lanzarSelector}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Cargar pedidos'}
      </button>
    </div>
  );
};

export default CargarPedidos;
