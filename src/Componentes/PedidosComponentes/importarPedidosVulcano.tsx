import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { cargarNumerosPedido } from '../../Funciones/ApiPedidos/apiPedidos';
import './ImportarPedidosVulcano.css';

const ImportarPedidosVulcano: React.FC = () => {
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
      const res = await cargarNumerosPedido(usuario, archivo);
      const lista = res.vehiculos_completados.map(v => `<li>${v}</li>`).join('');
      Swal.fire({
        title: res.mensaje,
        html: `<ul style="text-align:left">${lista}</ul>`,
        icon: 'success',
        width: 600
      }).then(() => window.location.reload());
    } catch (err: any) {
      const data = err.response?.data?.detail ?? err.response?.data;

      if (data?.errores && Array.isArray(data.errores)) {
        const erroresHtml = data.errores.map((e: string) => `<li>${e}</li>`).join('');
        Swal.fire({
          title: data?.mensaje || 'Error en la carga',
          html: `<ul style="text-align:left">${erroresHtml}</ul>`,
          icon: 'error',
          width: 600
        });
      } else {
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
    <div className="ImportarPedidosVulcano-contenedor">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm"
        onChange={handleArchivo}
        disabled={loading}
        style={{ display: 'none' }}
      />
      <button
        className="ImportarPedidosVulcano-boton"
        onClick={lanzarSelector}
        disabled={loading}
      >
        {loading ? 'Importando...' : 'Importar pedidos vulcano'}
      </button>
    </div>
  );
};

export default ImportarPedidosVulcano;
