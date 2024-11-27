import React, { useContext, useState } from "react";
import TarjetaResumen from "../TarjetaResumen/index";
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";
import FiltradoPlacas from "../FiltradoPlacas/index";

interface ContenedorTarjetasProps {
  manifiestos: any[];
}

const ContenedorTarjetas: React.FC<ContenedorTarjetasProps> = ({ manifiestos }) => {
  const almacenVariables = useContext(ContextoApp);

  // Estado local para el checkbox que controla si se muestran solo las tarjetas con "Saldo"
  const [mostrarConSaldo, setMostrarConSaldo] = useState(false);

  // Filtra los manifiestos según las condiciones específicas
  const manifiestosFiltrados = manifiestos
    .filter((manifiesto) => {
      const cumplePlaca =
        !almacenVariables?.placa || manifiesto.Placa === almacenVariables.placa;

      if (almacenVariables?.estado === "LIQUIDADO") {
        const coincideConPagos = almacenVariables.DiccionarioManifiestosPagos.some(
          (pago) => pago.Manifiesto === manifiesto.Manif_numero
        );

        if (!coincideConPagos || !cumplePlaca) return false;

        // Si "mostrarConSaldo" está activado, filtrar solo los que tienen saldo
        if (mostrarConSaldo) {
          const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
            (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
          );
          return saldoInfo?.Saldo !== undefined; // Solo mostrar los que tienen saldo
        }

        return true; // Mostrar todos si el checkbox está desactivado
      }

      // Si el estado no es "LIQUIDADO", aplica el filtro de estado y placa normalmente
      return (
        manifiesto.Estado_mft === almacenVariables?.estado && cumplePlaca
      );
    })
    // Ordenar por fecha en orden descendente
    .sort((a, b) => {
      const fechaA = new Date(a.Fecha);
      const fechaB = new Date(b.Fecha);
      return fechaB.getTime() - fechaA.getTime(); // Orden descendente
    });

  return (
    <div className="ContenedorTarjetas-contenedor">
      {/* Contenedor fijo para los filtros */}
      <div className="ContenedorTarjetas-filtros">
        <h1 className="ContenedorTarjetas-titulo">
          Manifiestos {almacenVariables?.estado || "Sin Estado"}
        </h1>
        <div className="ContenedorTarjetas-filtrosOpciones">
          {almacenVariables?.estado === "LIQUIDADO" && (
            <div className="ContenedorTarjetas-filtroSaldo">
              <label>
                <input
                  type="checkbox"
                  checked={mostrarConSaldo}
                  onChange={() => setMostrarConSaldo((prev) => !prev)}
                />
                Mostrar manifiestos con fecha pago saldo
              </label>
            </div>
          )}
          {/* Combobox para filtrar por placa */}
          <FiltradoPlacas />
        </div>
      </div>

      <div className="ContenedorTarjetas-grid">
        {manifiestosFiltrados.length > 0 ? (
          manifiestosFiltrados.map((manifiesto, index) => {
            // Buscar saldo y Fecha_saldo en DiccionarioSaldos
            const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
              (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
            );

            return (
              <TarjetaResumen
                key={index}
                manifiesto={manifiesto.Manif_numero}
                origenDestino={`${manifiesto.Origen} - ${manifiesto.Destino}`}
                placa={manifiesto.Placa}
                fecha={manifiesto.Fecha}
                flete={manifiesto.MontoTotal}
                reteFuente={manifiesto.ReteFuente}
                reteICA={manifiesto.ReteICA}
                anticipo={manifiesto.ValorAnticipado}
                saldo={almacenVariables?.estado === "LIQUIDADO" ? saldoInfo?.Saldo : undefined}
                fechaSaldo={
                  almacenVariables?.estado === "LIQUIDADO"
                    ? saldoInfo?.Fecha_saldo
                    : undefined
                }
              />
            );
          })
        ) : (
          <p className="ContenedorTarjetas-sinDatos">
            No hay manifiestos disponibles para este estado y placa seleccionada.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContenedorTarjetas;
