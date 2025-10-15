import { useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ContextoApp } from "../../Contexto/index";

// Interface para cada pago
interface Pago {
  Manifiesto: string;
  Tenedor: string;
  Fecha: string;
  PagoSaldo: string;
}

// Tipado de la respuesta del login
interface LoginResponse {
  data: {
    access_token: string;
  };
}

// Tipado flexible para la respuesta real de la consulta de pagos
interface QueryResponse {
  data: {
    data: {
      data: Pago[];
      current_page: number;
      // otros campos si los usas
    };
  };
}

const ExtraccionPagos = () => {
  const codigoTenedor = Cookies.get("tenedorIntegrapp");
  // console.log("🔷 Código de tenedor kobtenido de Cookies:", codigoTenedor);

  const contexto = useContext(ContextoApp);
  if (!contexto) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor.");
  }

  const { DiccionarioManifiestosPagos, setDiccionarioManifiestosPagos } = contexto;

  const fetchPagos = async (): Promise<Pago[]> => {
    // console.log("🔷 Inicio de fetchPagos");

    if (DiccionarioManifiestosPagos.length > 0) {
      // console.log("🔷 Usando pagos desde contexto (cached):", DiccionarioManifiestosPagos.length, "registros");
      return DiccionarioManifiestosPagos;
    }

    // 1) Login para obtener token
    const loginUrl = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";
    const loginPayload = {
      username: "134APIINTEGRA",
      idname: "eyJpdiI6Inl1cHZlZWFOQnc4TFB1a1hkS1VMWGc9PSIsInZhbHVlIjoia1JDRWduZ3FFZmZvRmZYUkJ3Q1JpT2RSU1htRHZkRzhQSkg0ekE5S2xwcz0iLCJtYWMiOiJjNjQxZjdlNDVlMzcwZTEzYzY4Mzc1MGYwNjI3MWQyOTI2ZTAzY2NhZDk1YjQ3MDgwYjg3ODEzODEyYzY3NzI5IiwidGFnIjoiIn0=",
      agency: "001",
      proyect: "1",
      isGroup: 0,
    };
    console.log("🔷 Payload de login:", loginPayload);

    // console.log("🔷 Realizando login para obtener token...");
    const loginResp = await axios.post<LoginResponse>(
      loginUrl,
      loginPayload,
      { headers: { "Content-Type": "application/json" } }
    );
    // console.log("🔷 Respuesta de login:", loginResp.data);
    const token = loginResp.data.data.access_token;
    // console.log("🔷 Token obtenido correctamente:", token);

    // 2) Consulta de pagos con try/catch extendido
    const queryUrl =
      "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
    const queryPayload = {
      pageSize: 1000,
      rptId: 27,
      filter: [
        { campo: "Fecha", operador: "YEAR>", valor: "2024" },
        { campo: "Tenedor", operador: "=", valor: codigoTenedor },
        { campo: "Pago saldo", operador: "=", valor: "Aplicado" },
      ],
    };
    // console.log("🔷 Payload de consulta de pagos:", queryPayload);

    let queryResp;
    try {
      // console.log("🔷 Enviando consulta de pagos a:", queryUrl);
      queryResp = await axios.post<QueryResponse>(
        queryUrl,
        queryPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("🔍 Respuesta completa de pagos:", JSON.stringify(queryResp.data, null, 2));
    } catch (error: any) {
      // console.error("❌ Error en la consulta de pagos (axios):", error);
      throw new Error("Error en la consulta de pagos. Revisa tu conexión y credenciales.");
    }

    // Validación de estructura paso a paso
    // console.log("🔍 Verificando que queryResp.data exista:", !!queryResp.data);
    // console.log("🔍 Verificando que queryResp.data.data exista:", !!queryResp.data.data);
    // console.log("🔍 Verificando que queryResp.data.data.data exista:", !!queryResp.data.data.data);

    const pagos = queryResp.data.data.data;
    // console.log("🔍 Valor de pagos extraído:", pagos);

    if (!Array.isArray(pagos)) {
      console.error(
        "⚠️ La API no devolvió un array válido. Respuesta recibida:",
        JSON.stringify(queryResp.data, null, 2)
      );
      throw new Error("La API no devolvió un array válido en data.data.data.");
    }

    // 3) Desduplicar por Manifiesto
    const pagosUnicos = pagos.reduce<Pago[]>((acc, item) => {
      if (!acc.some((x) => x.Manifiesto === item.Manifiesto)) {
        acc.push(item);
      }
      return acc;
    }, []);
    // console.log(`🔷 Desduplicación completada: ${pagosUnicos.length} pagos únicos.`);

    // 4) Guardar en contexto y devolver
    setDiccionarioManifiestosPagos(pagosUnicos);
    // console.log("🔷 Pagos guardados en contexto y función completada.");
    return pagosUnicos;
  };

  return { fetchPagos };
};

export default ExtraccionPagos;
