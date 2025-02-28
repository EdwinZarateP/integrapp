// obtenerVehiculoPorPlaca.tsx
export async function obtenerVehiculoPorPlaca(placa: string): Promise<any> {
  try {
    const respuesta = await fetch(
      `https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculo/${placa}`,
      {
        cache: "no-store",
      }
    );
    if (!respuesta.ok) {
      throw new Error("Error al obtener la información del vehículo.");
    }
    return await respuesta.json();
  } catch (error) {
    console.error("Error en la llamada a la API:", error);
    return null;
  }
}
