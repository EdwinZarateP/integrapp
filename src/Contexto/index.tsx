import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Si quiere usar una variable de aquí en alguna parte de la App, siga estos pasos:
// 1. En el componente elegido, import { useContext } from 'react';
// 2. En el componente elegido, traiga el proveedor así: import { ContextoApp } from '../../Contexto/index'
// 3. Antes del return del componente, cree lo siguiente: const almacenVariables = useContext(ContextoApp)
// 4. Use la variable que desee del ProveedorVariables, por ejemplo: almacenVariables.esFavorito

//-------------------------------------------------------------------------------------
// 1. Define la interfaz para el contexto
//-------------------------------------------------------------------------------------

interface ContextProps {
  // Abrir o cerrar cosas
  estaAbiertoAlgo: boolean;
  setEstaAbiertoAlgo: Dispatch<SetStateAction<boolean>>;
  abrirAlgo: () => void; 
  cerrarAlgo: () => void; 

  // Variables de tipo string
  nombre: string;
  setNombre: Dispatch<SetStateAction<string>>;
  tenedor: string;
  setTenedor: Dispatch<SetStateAction<string>>;
  celular: string;
  setCelular: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  placa: string;
  setPlaca: Dispatch<SetStateAction<string>>;
  
  // Variables de tipo boolenas
  verDocumento: boolean;
  setVerDocumento: Dispatch<SetStateAction<boolean>>;

  // Agrega respuesta
  respuesta: any; // Define el tipo según tus necesidades
  setRespuesta: Dispatch<SetStateAction<any>>;

  // Agrega estado
  estado: string;
  setEstado: Dispatch<SetStateAction<string>>;
  
  //link de novedad
  link: string;
  setLink: Dispatch<SetStateAction<string>>;

  //Diccionarios de las apis:

  DiccionarioManifiestosTodos: any[];
  setDiccionarioManifiestosTodos: Dispatch<SetStateAction<any[]>>;
  DiccionarioManifiestosPagos: any[]; // Ajusta el tipo según tus necesidades
  setDiccionarioManifiestosPagos: Dispatch<SetStateAction<any[]>>;
  DiccionarioSaldos: any[];
  setDiccionarioSaldos: Dispatch<SetStateAction<any[]>>;
  DiccionarioNovedades: any[];
  setDiccionarioNovedades: Dispatch<SetStateAction<any[]>>;
  
}

// Crea el contexto con un valor inicial undefined
export const ContextoApp = createContext<ContextProps | undefined>(undefined);

// Props para el proveedor de variables
interface ProveedorVariablesProps {
  hijo: ReactNode;
}

//-------------------------------------------------------------------------------------
// 2. Proveedor de variables que utiliza el contexto 
//-------------------------------------------------------------------------------------

export const ProveedorVariables: React.FC<ProveedorVariablesProps> = ({ hijo }) => {
  
  // Estado para abrir y cerrar el Algo
  const [estaAbiertoAlgo, setEstaAbiertoAlgo] = useState(false);
  const abrirAlgo = () => setEstaAbiertoAlgo(true);
  const cerrarAlgo = () => setEstaAbiertoAlgo(false);

  // Estados para las variables de tipo string
  const [nombre, setNombre] = useState('');
  const [tenedor, setTenedor] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [placa, setPlaca] = useState('');

    // Variables de tipo boolenas
  const [verDocumento, setVerDocumento] = useState<boolean>(false); 
  // Estado para la respuesta
  const [respuesta, setRespuesta] = useState(null);

  // Estado para la respuesta
  const [estado, setEstado] = useState('');

  // link de novedad
  const [link, setLink] = useState('');

  //Diccionarios de las apis
  const [DiccionarioManifiestosTodos, setDiccionarioManifiestosTodos] = useState<any[]>([]);
  const [DiccionarioManifiestosPagos, setDiccionarioManifiestosPagos] = useState<any[]>([]);
  const [DiccionarioSaldos, setDiccionarioSaldos] = useState<any[]>([]);
  const [DiccionarioNovedades, setDiccionarioNovedades] = useState<any[]>([]);

  //-------------------------------------------------------------------------------------
  // 3. Crea el objeto de contexto con los valores y funciones necesarios que quieres proveer
  //-------------------------------------------------------------------------------------
  
  const contextValue: ContextProps = {
    estaAbiertoAlgo,
    setEstaAbiertoAlgo,
    abrirAlgo,
    cerrarAlgo,
    
    // Variables de tipo string
    nombre,  setNombre,
    tenedor, setTenedor,
    celular, setCelular,
    email, setEmail,
    password, setPassword,
    placa, setPlaca,
    
    // variables boolenas
    verDocumento, setVerDocumento,

    // Agrega respuesta
    respuesta,setRespuesta,

    // Agrega estado
    estado, setEstado,

    //Link
    link, setLink,

    //Diccionarios apis
    DiccionarioManifiestosTodos, setDiccionarioManifiestosTodos,
    DiccionarioManifiestosPagos,setDiccionarioManifiestosPagos,
    DiccionarioSaldos,setDiccionarioSaldos,
    DiccionarioNovedades,setDiccionarioNovedades

  };
  
  // Renderiza el proveedor de contexto con el valor proporcionado
  return (
    <ContextoApp.Provider value={contextValue}>
      {hijo}
    </ContextoApp.Provider>
  );
};
