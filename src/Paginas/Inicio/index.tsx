import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import Cookies from 'js-cookie';
import BotonSencillo from "../../Componentes/BotonSencillo";
import { ContextoApp } from "../../Contexto/index";
import HashLoader from "react-spinners/HashLoader";
import "./estilos.css";

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
      const response = await fetch("https://integrappi-dvmh.onrender.com/usuarios/token", {
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
    <div className="inicio-contenedor">
      {loading ? (
        <div className="inicio-loading-container">
          <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={loading} />
          <p>Estamos verificando tu identidad</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="Logo Integra" className="inicio-logo" />
          <div className="inicio-titulo">
            <h1>Integr</h1>
            <h1>App</h1>
          </div>

          {errorMessage && <div className="mensajeError">{errorMessage}</div>}

          <form className="inicio-formulario" onSubmit={manejarEnvioFormulario}>
            <div className="inicio-contenedorInput">
              <label htmlFor="email" className="inicio-etiqueta">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="conductores@gmail.com"
                className="inicio-input"
                value={almacenVariables?.email || ""}
                onChange={manejarCambio}
              />
            </div>

            <div className="inicio-contenedorInput">
              <label htmlFor="password" className="inicio-etiqueta">
                Contraseña
              </label>
              <div className="inicio-inputWrapper">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Digite su contraseña"
                  className="inicio-input"
                  value={almacenVariables?.password || ""}
                  onChange={manejarCambio}
                />
                <button
                  type="button"
                  onClick={manejarVisibilidadPassword}
                  className="inicio-verContrasenaBtn"
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

          <div className="inicio-pieDePagina">
            <Link to="/Registro" className="inicio-enlace">
              Registrarse
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Inicio;
