import React from 'react';
import './estilos.css'; // Importa el archivo CSS

interface DatosProps {
  // Si necesitas recibir propiedades, defínelas aquí
  // Ejemplo: onSubmit?: (formValues: Record<string, any>) => void;
}

const Datos: React.FC<DatosProps> = () => {
  return (
    <div className="Datos-contenedor">
      <form className="Form-datos-generales">
        {/* INFORMACIÓN DEL CONDUCTOR */}
        <h4>Información del Conductor</h4>
        <div>
          <label>Primer Apellido</label>
          <input type="text" name="DatoPrimerApellido" />
        </div>
        <div>
          <label>Segundo Apellido</label>
          <input type="text" name="DatoSegundoApellido" />
        </div>
        <div>
          <label>Nombres</label>
          <input type="text" name="DatoNombres" />
        </div>
        <div>
          <label>Cédula de Ciudadanía</label>
          <input type="text" name="DatoCedulaCiudadania" />
        </div>
        <div>
          <label>Expedida en</label>
          <input type="text" name="DatoExpedidaEn" />
        </div>
        <div>
          <label>Dirección</label>
          <input type="text" name="DatoDireccionConductor" />
        </div>
        <div>
          <label>Ciudad</label>
          <input type="text" name="DatoCiudadConductor" />
        </div>
        <div>
          <label>Celular</label>
          <input type="text" name="DatoCelularConductor" />
        </div>
        <div>
          <label>Correo Electrónico</label>
          <input type="email" name="DatoCorreoConductor" />
        </div>
        <div>
          <label>EPS</label>
          <input type="text" name="DatoEps" />
        </div>
        <div>
          <label>ARL</label>
          <input type="text" name="DatoArl" />
        </div>
        <div>
          <label>No. Licencia</label>
          <input type="text" name="DatoNoLicencia" />
        </div>
        <div>
          <label>Fecha de Vencimiento</label>
          <input type="date" name="DatoFechaVencimiento" />
        </div>
        <div>
          <label>Categoría</label>
          <input type="text" name="DatoCategoria" />
        </div>
        <div>
          <label>Grupo Sanguíneo RH</label>
          <input type="text" name="DatoGrupoSanguineo" />
        </div>

        {/* EN CASO DE EMERGENCIA */}
        <h4>En Caso de Emergencia Avisar a:</h4>
        <div>
          <label>Nombre</label>
          <input type="text" name="DatoNombreEmergencia" />
        </div>
        <div>
          <label>Celular</label>
          <input type="text" name="DatoCelularEmergencia" />
        </div>
        <div>
          <label>Parentesco</label>
          <input type="text" name="DatoParentescoEmergencia" />
        </div>

        {/* REFERENCIAS */}
        <h4>Referencias Personales</h4>
        {/* Referencia 1 */}
        <div>
          <label>Nombre y Apellido </label>
          <input type="text" name="DatoNombreApellidoRef1" />
        </div>
        <div>
          <label>Celular </label>
          <input type="text" name="DatoCelularRef1" />
        </div>
        <div>
          <label>Ciudad </label>
          <input type="text" name="DatoCiudadRef1" />
        </div>
        <div>
          <label>Parentesco </label>
          <input type="text" name="DatoParentescoRef1" />
        </div>

        <h4>Referencias Laborales</h4>

        {/* Referencia 2 */}
        <div>
          <label>Empresa </label>
          <input type="text" name="DatoEmpresaRef2" />
        </div>
        <div>
          <label>Celular </label>
          <input type="text" name="DatoCelularRef2" />
        </div>
        <div>
          <label>Ciudad </label>
          <input type="text" name="DatoCiudadRef2" />
        </div>
        <div>
          <label>Nro. Viajes</label>
          <input type="number" name="DatoNroViajesRef2" />
        </div>
        <div>
          <label>Antigüedad</label>
          <input type="text" name="DatoAntiguedadRef2" />
        </div>
        <div>
          <label>Merc. Transportada</label>
          <input type="text" name="DatoMercTransportada" />
        </div>

        {/* DATOS DEL PROPIETARIO */}
        <h4>Datos del Propietario</h4>
        <div>
          <label>Nombre/Razón Social</label>
          <input type="text" name="DatoNombrePropietario" />
        </div>
        <div>
          <label>Cédula/NIT</label>
          <input type="text" name="DatoCedulaNitPropietario" />
        </div>
        <div>
          <label>Expedida en</label>
          <input type="text" name="DatoExpedidaEnPropietario" />
        </div>
        <div>
          <label>Correo Electrónico</label>
          <input type="email" name="DatoCorreoPropietario" />
        </div>
        <div>
          <label>Dirección</label>
          <input type="text" name="DatoDireccionPropietario" />
        </div>
        <div>
          <label>Ciudad</label>
          <input type="text" name="DatoCiudadPropietario" />
        </div>
        <div>
          <label>Celular</label>
          <input type="text" name="DatoCelularPropietario" />
        </div>

        {/* DATOS DEL TENEDOR */}
        <h4>Datos del Tenedor (En caso que sea distinto al propietario)</h4>
        <div>
          <label>Nombre/Razón Social</label>
          <input type="text" name="DatoNombreTenedor" />
        </div>
        <div>
          <label>Cédula/NIT</label>
          <input type="text" name="DatoCedulaNitTenedor" />
        </div>
        <div>
          <label>Expedida en</label>
          <input type="text" name="DatoExpedidaEnTenedor" />
        </div>
        <div>
          <label>Correo Electrónico</label>
          <input type="email" name="DatoCorreoTenedor" />
        </div>
        <div>
          <label>Dirección</label>
          <input type="text" name="DatoDireccionTenedor" />
        </div>
        <div>
          <label>Ciudad</label>
          <input type="text" name="DatoCiudadTenedor" />
        </div>
        <div>
          <label>Celular</label>
          <input type="text" name="DatoCelularTenedor" />
        </div>

        {/* INFORMACIÓN VEHÍCULO */}
        <h4>Información del Vehículo</h4>
        <div>
          <label>Placa</label>
          <input type="text" name="DatoPlacaVehiculo" />
        </div>
        <div>
          <label>Modelo</label>
          <input type="text" name="DatoModeloVehiculo" />
        </div>
        <div>
          <label>Marca</label>
          <input type="text" name="DatoMarcaVehiculo" />
        </div>
        <div>
          <label>Tipo Carrocería</label>
          <input type="text" name="DatoTipoCarroceriaVehiculo" />
        </div>
        <div>
          <label>Línea</label>
          <input type="text" name="DatoLineaVehiculo" />
        </div>
        <div>
          <label>Color</label>
          <input type="text" name="DatoColorVehiculo" />
        </div>
        <div>
          <label>Repotenciado (Sí/No)</label>
          <input type="text" name="DatoRepotenciado" />
        </div>
        <div>
          <label>Año</label>
          <input type="number" name="DatoAnoRepotenciado" />
        </div>
        <div>
          <label>Satelital (Sí/No)</label>
          <input type="text" name="DatoSatelital" />
        </div>
        <div>
          <label>Empresa Satelital</label>
          <input type="text" name="DatoEmpresaSatelital" />
        </div>
        <div>
          <label>Usuario</label>
          <input type="text" name="DatoUsuario" />
        </div>
        <div>
          <label>Clave</label>
          <input type="text" name="DatoClave" />
        </div>

        {/* INFORMACIÓN DE TRAYLER (REMOLQUE) */}
        <h4>Información de Trayler (Remolque)</h4>
        <div>
          <label>Placa</label>
          <input type="text" name="DatoPlacaRemolque" />
        </div>
        <div>
          <label>Modelo</label>
          <input type="text" name="DatoModeloRemolque" />
        </div>
        <div>
          <label>Clase/Config</label>
          <input type="text" name="DatoClaseConfigRemolque" />
        </div>
        <div>
          <label>Tipo Carrocería</label>
          <input type="text" name="DatoTipoCarroceriaRemolque" />
        </div>
        <div>
          <label>Medidas (Alto)</label>
          <input type="text" name="DatoMedidasAltoRemolque" />
        </div>
        <div>
          <label>Medidas (Largo)</label>
          <input type="text" name="DatoMedidasLargoRemolque" />
        </div>
        <div>
          <label>Medidas (Ancho)</label>
          <input type="text" name="DatoMedidasAnchoRemolque" />
        </div>
      </form>
    </div>
  );
};

export default Datos;
