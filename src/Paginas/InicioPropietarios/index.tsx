import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import Cookies from 'js-cookie';
import BotonSencillo from "../../Componentes/BotonSencillo";
import { ContextoApp } from "../../Contexto/index";
import HashLoader from "react-spinners/HashLoader";
import "./estilos.css";

const InicioPropietarios: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (almacenVariables) {
      switch (name) {
        case "email":
          almacenVariables.setEmail(value);          
          break;
        case "password":
          almacenVariables.setPassword(value);
          break;
        default:
          break;
      }
    }
  };

  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      
      // const response = await fetch("https://integrappi-dvmh.onrender.com/usuarios/token", {
      const response = await fetch("http://127.0.0.1:8000/usuarios/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: almacenVariables?.email || "",
          password: almacenVariables?.password || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      if (data.nombre) {
        almacenVariables?.setNombre(data.nombre);
        Cookies.set('nombreIntegrapp', data.nombre, { expires: 7 });
      }

      if (data.tenedor) {
        await almacenVariables?.setTenedor(data.tenedor); 
        Cookies.set('tenedorIntegrapp', data.tenedor, { expires: 7 });     
      } else {
        throw new Error("El servidor no devolvió el tenedor.");
      }

      navigate("/SalaEspera");
    } catch (error) {
      console.error("Error en el proceso:", error);
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="InicioPropietarios-contenedor">
      {loading ? (
        <div className="InicioPropietarios-loading-container">
          <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={loading} />
          <p>Estamos verificando tu identidad</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="Logo Integra" className="InicioPropietarios-logo" />
          <div className="InicioPropietarios-titulo">
            <h1>Integr</h1>
            <h1>App</h1>
          </div>

          {errorMessage && <div className="mensajeError">{errorMessage}</div>}

          <form className="InicioPropietarios-formulario" onSubmit={manejarEnvioFormulario}>
            <div className="InicioPropietarios-contenedorInput">
              <label htmlFor="email" className="InicioPropietarios-etiqueta">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="conductores@gmail.com"
                className="InicioPropietarios-input"
                value={almacenVariables?.email || ""}
                onChange={manejarCambio}
              />
            </div>

            <div className="InicioPropietarios-contenedorInput">
              <label htmlFor="password" className="InicioPropietarios-etiqueta">
                Contraseña
              </label>
              <div className="InicioPropietarios-inputWrapper">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Digite su contraseña"
                  className="InicioPropietarios-input"
                  value={almacenVariables?.password || ""}
                  onChange={manejarCambio}
                />
                <button
                  type="button"
                  onClick={manejarVisibilidadPassword}
                  className="InicioPropietarios-verContrasenaBtn"
                >
                  {passwordVisible ? (
                    <span role="img" aria-label="Hide password">
                      👁️
                    </span>
                  ) : (
                    <span role="img" aria-label="Show password">
                      👁️‍🗨️
                    </span>
                  )}
                </button>
              </div>
            </div>

            <BotonSencillo type="submit" texto="Ingresar" colorClass="negro" />
          </form>

          <div className="InicioPropietarios-pieDePagina">
            <Link to="/Registro" className="InicioPropietarios-enlace">
              Registrarse
            </Link>
          </div>

          <div className="InicioPropietarios-pieDePagina">
            <Link to="/olvidoclave" className="InicioPropietarios-enlace">
              Olvidé la clave
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default InicioPropietarios;
