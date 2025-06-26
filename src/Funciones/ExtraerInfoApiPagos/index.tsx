// src/hooks/ExtraccionPagos.ts

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

// Tipado de la respuesta de la consulta de pagos
interface QueryResponse {
  data: {
    data: Pago[];
  };
}

const ExtraccionPagos = () => {
  const codigoTenedor = Cookies.get("tenedorIntegrapp");
  const contexto = useContext(ContextoApp);
  if (!contexto) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor.");
  }

  const {
    DiccionarioManifiestosPagos,
    setDiccionarioManifiestosPagos,
  } = contexto;

  const fetchPagos = async (): Promise<Pago[]> => {
    // Si ya hay datos en el contexto, úsalos
    if (DiccionarioManifiestosPagos.length > 0) {
      return DiccionarioManifiestosPagos;
    }

    // 1) Login para obtener token
    const loginUrl =
      "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";
    const loginPayload = {
      username: "134APIINTEGRA",
      idname:
        "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
      agency: "001",
      proyect: "1",
      isGroup: 0,
    };

    // Tipamos la respuesta para que data no sea unknown
    const loginResp = await axios.post<LoginResponse>(
      loginUrl,
      loginPayload,
      { headers: { "Content-Type": "application/json" } }
    );
    const token = loginResp.data.data.access_token;

    // 2) Consulta de pagos
    const queryUrl =
      "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
    const queryPayload = {
      pageSize: 1000,
      rptId: 27,
      filter: [
        { campo: "Fecha", operador: "YEAR>", valor: "2023" },
        { campo: "Tenedor", operador: "=", valor: codigoTenedor },
        { campo: "Pago saldo", operador: "=", valor: "Aplicado" },
      ],
    };

    const queryResp = await axios.post<QueryResponse>(
      queryUrl,
      queryPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const pagos = queryResp.data.data;
    if (!Array.isArray(pagos)) {
      throw new Error("La API no devolvió un array válido en data.data.");
    }

    // 3) Desduplicar por Manifiesto
    const pagosUnicos = pagos.reduce<Pago[]>((acc, item) => {
      if (!acc.some((x) => x.Manifiesto === item.Manifiesto)) {
        acc.push(item);
      }
      return acc;
    }, []);

    // 4) Guardar en contexto y devolver
    setDiccionarioManifiestosPagos(pagosUnicos);
    return pagosUnicos;
  };

  return { fetchPagos };
};

export default ExtraccionPagos;
