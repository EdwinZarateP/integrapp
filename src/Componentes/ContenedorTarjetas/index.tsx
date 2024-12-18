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
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  
  // Filtrar manifiestos según las condiciones específicas
  const manifiestosFiltrados = useMemo(() => {
    return manifiestos
      .filter((manifiesto) => {
        const cumplePlaca = !almacenVariables?.placa || manifiesto.Placa === almacenVariables.placa;

        if (almacenVariables?.estado === "LIQUIDADO") {
          const coincideConPagos = almacenVariables.DiccionarioManifiestosPagos.some(
            (pago) =>
              pago.Manifiesto === manifiesto.Manif_numero &&
              (mostrarHistorico ? pago["Pago saldo"] === "Aplicado" : pago["Pago saldo"] === "No aplicado")
          );

          if (!coincideConPagos || !cumplePlaca) return false;

          if (mostrarConSaldo) {
            const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
              (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
            );
            return saldoInfo?.Saldo !== undefined;
          }

          return true;
        }

        return manifiesto.Estado_mft === almacenVariables?.estado && cumplePlaca;
      })
      .sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime());
  }, [almacenVariables, manifiestos, mostrarConSaldo, mostrarHistorico]);

  // Calcula el total de saldos visibles
  const totalSaldos = useMemo(() => {
    return manifiestosFiltrados.reduce((total, manifiesto) => {
      const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
        (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
      );
      return total + (saldoInfo?.Saldo || 0);
    }, 0);
  }, [manifiestosFiltrados, almacenVariables]);

  // Número de manifiestos con saldo
  const cantidadManifiestosConSaldo = useMemo(() => {
    return manifiestosFiltrados.filter((manifiesto) => {
      const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
        (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
      );
      return saldoInfo?.Saldo !== undefined;
    }).length;
  }, [manifiestosFiltrados, almacenVariables]);

  // Crear la lógica para buscar novedadesInfo similar a saldoInfo
  const obtenerNovedadesInfo = (manifiesto: any) => {
    almacenVariables?.DiccionarioNovedades?.forEach(() => {      
    });
  
    return almacenVariables?.DiccionarioNovedades.find(
      (novedad) => String(novedad.Manifiesto).trim() === String(manifiesto.Manif_numero).trim()
    );
  };  

  
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
          <FiltradoPlacas />
        </div>
      </div>

      <div className="ContenedorTarjetas-grid">
        {manifiestosFiltrados.length > 0 ? (
          manifiestosFiltrados.map((manifiesto, index) => {
            const saldoInfo = almacenVariables?.DiccionarioSaldos.find(
              (saldo) => saldo.Manifiesto === manifiesto.Manif_numero
            );
            const novedadesInfo = obtenerNovedadesInfo(manifiesto);
            return (
              <TarjetaResumen
                key={index}
                manifiesto={manifiesto.Manif_numero}
                origenDestino={`${manifiesto.Origen} - ${manifiesto.Destino}`}
                placa={manifiesto.Placa}
                fecha={manifiesto.Fecha}
                fecha_cumplido={manifiesto["Fecha cumpl."]}
                link={almacenVariables?.estado === "LIQUIDADO" || almacenVariables?.estado === "CUMPLIDO" ? novedadesInfo?.Link : undefined}
                flete={manifiesto.MontoTotal}
                reteFuente={manifiesto.ReteFuente}
                reteICA={manifiesto.ReteICA}
                anticipo={manifiesto.ValorAnticipado}
                saldo={almacenVariables?.estado === "LIQUIDADO" ? saldoInfo?.Saldo : undefined}
                fechaSaldo={
                  almacenVariables?.estado === "LIQUIDADO" ? saldoInfo?.Fecha_saldo : undefined
                }
                estado={almacenVariables?.estado || "Sin Estado"}
              />

            );
          })
        ) : (
          <p className="ContenedorTarjetas-sinDatos">
            No hay manifiestos disponibles para este estado y placa seleccionada.
          </p>
        )}
      </div>

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
