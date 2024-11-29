import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";
import BotonSencillo from "../../Componentes/BotonSencillo";
import { ContextoApp } from "../../Contexto/index";
import HashLoader from "react-spinners/HashLoader";

const Inicio: React.FC = () => {
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
      const response = await fetch("https://integrappi.onrender.com/usuarios/token", {
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
      }

      if (data.tenedor) {
        await almacenVariables?.setTenedor(data.tenedor);      
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
    <div className="contenedor">
      {loading ? (
        <div className="inicio-loading-container">
          <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={loading} />
          <p>Estamos verificando tu identidad</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="Logo Integra" className="logo" />
          <div className="titulo">
            <h1>Integr</h1>
            <h1>App</h1>
          </div>

          {errorMessage && <div className="mensajeError">{errorMessage}</div>}

          <form className="formulario" onSubmit={manejarEnvioFormulario}>
            <div className="contenedorInput">
              <label htmlFor="email" className="etiqueta">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="conductores@gmail.com"
                className="input"
                value={almacenVariables?.email || ""}
                onChange={manejarCambio}
              />
            </div>

            <div className="contenedorInput">
              <label htmlFor="password" className="etiqueta">
                Contraseña
              </label>
              <div className="inputWrapper">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Digite su contraseña"
                  className="input"
                  value={almacenVariables?.password || ""}
                  onChange={manejarCambio}
                />
                <button
                  type="button"
                  onClick={manejarVisibilidadPassword}
                  className="verContrasenaBtn"
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

          <div className="pieDePagina">
            {/* <Link to="/Olvidoclave" className="enlace">
              Olvidé la clave
            </Link> */}
            <Link to="/Registro" className="enlace">
              Registrarse
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Inicio;
