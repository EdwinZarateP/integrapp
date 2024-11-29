import React, { useContext, useState, useMemo } from "react";
import TarjetaResumen from "../TarjetaResumen/index";
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";
import FiltradoPlacas from "../FiltradoPlacas/index";

interface ContenedorTarjetasProps {
  manifiestos: any[];
}

const ContenedorTarjetas: React.FC<ContenedorTarjetasProps> = ({ manifiestos }) => {
  const almacenVariables = useContext(ContextoApp);

  // Estados locales para los checkboxes
  const [mostrarConSaldo, setMostrarConSaldo] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false); // Nuevo checkbox

  // Filtra los manifiestos según las condiciones específicas
  const manifiestosFiltrados = useMemo(() => {
    return manifiestos
      .filter((manifiesto) => {
        const cumplePlaca =
          !almacenVariables?.placa || manifiesto.Placa === almacenVariables.placa;

        if (almacenVariables?.estado === "LIQUIDADO") {
          const coincideConPagos = almacenVariables.DiccionarioManifiestosPagos.some(
            (pago) =>
              pago.Manifiesto === manifiesto.Manif_numero &&
              (mostrarHistorico
                ? pago["Pago saldo"] === "Aplicado" // Si "Mostrar histórico" está activo
                : pago["Pago saldo"] === "No aplicado") // Si no, mostrar solo "No aplicado"
          );

          if (!coincideConPagos || !cumplePlaca) return false;

          // Filtrar solo los que tienen saldo si "mostrarConSaldo" está activado
          if (mostrarConSaldo) {
            const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
              (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
            );
            return saldoInfo?.Saldo !== undefined; // Solo mostrar los que tienen saldo
          }

          return true; // Mostrar todos si "mostrarConSaldo" está desactivado
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
  }, [almacenVariables, manifiestos, mostrarConSaldo, mostrarHistorico]);

  // Calcula el total de los saldos visibles
  const totalSaldos = useMemo(() => {
    return manifiestosFiltrados.reduce((total, manifiesto) => {
      const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
        (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
      );
      return total + (saldoInfo?.Saldo || 0);
    }, 0);
  }, [manifiestosFiltrados, almacenVariables]);

  // Calcula el número de manifiestos con saldo
  const cantidadManifiestosConSaldo = useMemo(() => {
    return manifiestosFiltrados.filter((manifiesto) => {
      const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
        (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
      );
      return saldoInfo?.Saldo !== undefined; // Contar solo los que tienen saldo
    }).length;
  }, [manifiestosFiltrados, almacenVariables]);

  return (
    <div className="ContenedorTarjetas-contenedor">
      {/* Contenedor fijo para los filtros */}
      <div className="ContenedorTarjetas-filtros">
        <h1 className="ContenedorTarjetas-titulo">
          Manifiestos {almacenVariables?.estado || "Sin Estado"}
        </h1>
        <div className="ContenedorTarjetas-filtrosOpciones">
          {almacenVariables?.estado === "LIQUIDADO" && (
            <>
              <div className="ContenedorTarjetas-checkbox">
                <input
                  type="checkbox"
                  checked={mostrarConSaldo}
                  onChange={() => setMostrarConSaldo((prev) => !prev)}
                />
                <label>Mostrar manifiestos con fecha pago saldo</label>
              </div>
              <div className="ContenedorTarjetas-checkbox">
                <input
                  type="checkbox"
                  checked={mostrarHistorico}
                  onChange={() => setMostrarHistorico((prev) => !prev)}
                />
                <label>Mostrar histórico</label>
              </div>
            </>
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

      {/* Contenedor fijo para el total de saldos */}
      {almacenVariables?.estado === "LIQUIDADO" && mostrarConSaldo && (
        <div className="ContenedorTarjetas-total">
          <p>
            <strong>${totalSaldos.toLocaleString()}</strong>
          </p>
          <p>
            Tienes {cantidadManifiestosConSaldo} Manifiestos con saldo para
            pago
          </p>
        </div>
      )}
    </div>
  );
};

export default ContenedorTarjetas;
