import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { exportarAutorizados } from '../../Funciones/ApiPedidos/apiPedidos';
import Swal from 'sweetalert2';
import './ExportarAutorizados.css';

const ExportarAutorizados: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const perfil = Cookies.get('perfilPedidosCookie');
    if (perfil === 'ADMIN' || perfil === 'ANALISTA') {
      setVisible(true);
    }
  }, []);

  const manejarExportacion = async () => {
    try {
      const blob = await exportarAutorizados();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pedidos_autorizados.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exportando:', err);

      let mensaje = 'Error desconocido';
      const response = err?.response;

      if (response?.data instanceof Blob) {
        try {
          const texto = await response.data.text();
          const json = JSON.parse(texto);

          if (json?.detail) {
            mensaje = json.detail;
          } else if (json?.mensaje) {
            mensaje = json.mensaje;
          } else {
            mensaje = JSON.stringify(json);
          }
        } catch {
          mensaje = await response.data.text();
        }
      } else if (typeof err?.message === 'string') {
        mensaje = err.message;
      }

      Swal.fire('Error', mensaje, 'error');
    }
  };

  if (!visible) return null;

  return (
    <div className="ExportarAutorizados-contenedor">
      <button className="ExportarAutorizados-boton" onClick={manejarExportacion}>
        Exportar pedidos autorizados
      </button>
    </div>
  );
};

export default ExportarAutorizados;
