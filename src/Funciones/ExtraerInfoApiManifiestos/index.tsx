// src/hooks/useExtraccionManifiestos.ts

import { useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ContextoApp } from "../../Contexto/index";

// Interfaces para el resultado final
interface Manifiesto {
  Manif_numero: string;
  Estado_mft: string;
  Fecha: string;
  Manif_ministerio: string;
  Tipo_manifiesto: string;
  Origen: string;
  Destino: string;
  FechaPagoSaldo: string;
  MontoTotal: number;
  ReteFuente: number;
  ReteICA: number;
  ReteCREE: string;
  ValorAnticipado: number;
  AjusteFlete: string;
  Placa: string;
  Fecha_cumpl: string;
  TenId: string;
  Tenedor: string;
  deducciones: string;
}

// Interfaz para los registros “crudos” que vienen de la API
interface ManifiestoAPI {
  Manif_numero: string;
  Estado_mft: string;
  Fecha: string;
  Manif_ministerio: string;
  Tipo_manifiesto: string;
  Origen: string;
  Destino: string;
  FechaPagoSaldo: string;
  MontoTotal: string;
  ReteFuente: string;
  ReteICA: string;
  ReteCREE: string;
  ValorAnticipado: string;
  AjusteFlete: string;
  Placa: string;
  Fecha_cumpl: string;
  TenId: string;
  Tenedor: string;
  deducciones: string;
  [key: string]: any;
}

// Tipado de la respuesta del login
interface LoginResponse {
  data: {
    access_token: string;
  };
}

// Tipado de la respuesta de consulta de manifiestos
interface QueryResponse {
  data: {
    data: ManifiestoAPI[];
  };
}

const useExtraccionManifiestos = () => {
  const codigoTenedor = Cookies.get("tenedorIntegrapp");
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error(
      "Contexto no definido. Asegúrate de envolver con el proveedor."
    );
  }

  const { DiccionarioManifiestosTodos, setDiccionarioManifiestosTodos } =
    contexto;

  const fetchManifiestos = async (): Promise<Manifiesto[]> => {
    // Si ya los tenemos en contexto, no volvemos a llamar
    if (DiccionarioManifiestosTodos.length > 0) {
      return DiccionarioManifiestosTodos;
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

    // axios.post<LoginResponse> infiere que `response.data` es LoginResponse
    const loginResp = await axios.post<LoginResponse>(loginUrl, loginPayload, {
      headers: { "Content-Type": "application/json" },
    });
    const token = loginResp.data.data.access_token;

    // 2) Consulta de manifiestos
    const queryUrl =
      "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
    const queryPayload = {
      pageSize: 1000,
      rptId: 26,
      filter: [
        { campo: "Fecha", operador: "YEAR>", valor: "2023" },
        { campo: "Tenedor", operador: "=", valor: codigoTenedor },
      ],
    };

    // axios.post<QueryResponse> infiere que `response.data` es QueryResponse
    const queryResp = await axios.post<QueryResponse>(queryUrl, queryPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const registros = queryResp.data.data.data;
    if (!Array.isArray(registros)) {
      throw new Error(
        "La API no devolvió un array válido en `data.data`."
      );
    }

    // 3) Parseo de strings a number y desduplicado
    const procesados: Manifiesto[] = registros.map((r) => ({
      ...r,
      MontoTotal: parseFloat(r.MontoTotal),
      ReteFuente: parseFloat(r.ReteFuente),
      ReteICA: parseFloat(r.ReteICA),
      ValorAnticipado: parseFloat(r.ValorAnticipado),
    }));

    const unicos = procesados.reduce<Manifiesto[]>((acc, m) => {
      if (!acc.find((x) => x.Manif_numero === m.Manif_numero)) {
        acc.push(m);
      }
      return acc;
    }, []);

    // 4) Guardar en contexto y devolver
    setDiccionarioManifiestosTodos(unicos);
    return unicos;
  };

  return { fetchManifiestos };
};

export default useExtraccionManifiestos;
