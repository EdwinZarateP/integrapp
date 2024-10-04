import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./estilos.css";

interface GoogleRegistroProps {
  onLoginSuccess: (usuario: {
    nombre: string;
    email: string;
    userId: string;
  }) => void;
}

const GoogleRegistro: React.FC<GoogleRegistroProps> = ({ onLoginSuccess }) => {
  const handleSuccess = (
    credentialResponse: CredentialResponse | undefined
  ) => {
    if (credentialResponse?.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const nombreUsuario: string = decoded.name;
      const emailUsuario: string = decoded.email;
      const userId: string = decoded.sub;

      onLoginSuccess({ nombre: nombreUsuario, email: emailUsuario, userId });
    } else {
      console.log("No se recibió el credencial");
    }
  };

  return (
    <div className="contenedor_login_Google">
      <h3 className="subtitulo_login_Google">
        O regístrate con tu cuenta de Google
      </h3>
      <span>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </span>
    </div>
  );
};

export default GoogleRegistro;
