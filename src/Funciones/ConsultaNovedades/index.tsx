import axios from 'axios';


const consultaNovedades = async (tenedor: string): Promise<any[]> => {
    try {
        const response = await axios.get(`https://integrappi.onrender.com/Novedades/tenedor/${tenedor}`);
        return response.data; // Devuelve el array de manifiestos
    } catch (err: any) {
        console.error("Error al consultar Novedades:", err);
        throw new Error("No se pudieron obtener los Novedades."); // Lanza un error si la consulta falla
    }
};

export default consultaNovedades;
