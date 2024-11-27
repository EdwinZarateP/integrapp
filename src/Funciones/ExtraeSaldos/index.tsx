import axios from 'axios';


const consultaSaldos = async (tenedor: string): Promise<any[]> => {
    try {
        const response = await axios.get(`https://integrappi.onrender.com/manifiestos/tenedor/${tenedor}`);
        return response.data; // Devuelve el array de manifiestos
    } catch (err: any) {
        console.error("Error al consultar saldos:", err);
        throw new Error("No se pudieron obtener los saldos."); // Lanza un error si la consulta falla
    }
};

export default consultaSaldos;
