import React, { useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image, pdf, Svg, Path } from '@react-pdf/renderer';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import "./estilos.css";
import logo from "../../Imagenes/albatros.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// --- TIPOS ---
import { Vehiculo } from '../../Paginas/revision';

interface HvVehiculosProps {
    vehiculo: Vehiculo;
}

interface HuellasResponse {
    encontrado: boolean;
    huellas: (string | null)[]; 
}

// --- ESTILOS DEL PDF ---
const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 8, fontFamily: 'Helvetica' },
    headerBox: { border: '1px solid #000', marginBottom: 5 },
    row: { flexDirection: 'row', borderBottom: '1px solid #000' },
    col: { borderRight: '1px solid #000', padding: 2 },
    headerGreen: { backgroundColor: '#ccffcc', padding: 3, fontWeight: 'bold', fontSize: 7, textAlign: 'center', borderBottom: '1px solid #000' },
    label: { fontSize: 6, color: '#444', marginBottom: 1, textTransform: 'uppercase' },
    value: { fontSize: 8, fontWeight: 'bold' },
    sectionTitle: { backgroundColor: '#ccffcc', padding: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 9, border: '1px solid #000', borderBottom: 'none' },
    
    // Grilla de documentos
    docGrid: { flexDirection: 'row', border: '1px solid #000', marginBottom: 5, alignItems: 'stretch' },
    docCol: { flex: 1, padding: 0, borderRight: '1px solid #000', display: 'flex', flexDirection: 'column' },
    docColContent: { padding: 2, flexGrow: 1 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, justifyContent: 'space-between', paddingRight: 2 },
    // Ajuste checkBox para centrar bien el SVG
    checkBox: { width: 10, height: 10, border: '1px solid #000', alignItems: 'center', justifyContent: 'center' },
    
    // Huellas
    huellasContainer: { flexDirection: 'row', flexWrap: 'wrap', border: '1px solid #000', marginTop: 5 },
    huellaBox: { width: '20%', height: 90, borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, alignItems: 'center', justifyContent: 'flex-start' },
    
    // ESTILO IMPORTANTE PARA LA IMAGEN DE HUELLA
    huellaImageContainer: { 
        width: 50, 
        height: 60, 
        marginTop: 5,
        marginBottom: 5, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f9f9f9' 
    },
    huellaImage: { 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain' 
    },
    
    firmaBox: { height: 60, border: '1px solid #000', marginTop: 5, padding: 5 },
    w50: { width: '50%' },
    w33: { width: '33.33%' },
    w25: { width: '25%' },
});

const upper = (text?: string) => text ? text.toUpperCase() : "";

// --- 2. CAMBIO EN CHECKITEM: USAMOS SVG PARA EL CHULO ---
const CheckItem = ({ label, checked }: { label: string, checked: boolean }) => (
    <View style={styles.checkRow}>
        <Text style={{ fontSize: 6, flex: 1, paddingRight: 2 }}>{label.toUpperCase()}</Text>
        <View style={styles.checkBox}>
            {checked && (
                <Svg viewBox="0 0 24 24" style={{ width: 8, height: 8 }}>
                    <Path 
                        d="M20 6L9 17l-5-5" 
                        stroke="#777777" 
                        strokeWidth={3} 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                </Svg>
            )}
        </View>
    </View>
);

const DocuPDF = ({ veh, huellas }: { veh: Vehiculo, huellas: (string | null)[] }) => {
    
    const getHuella = (idx: number) => {
        if (huellas && huellas.length > idx && huellas[idx]) {
            return huellas[idx];
        }
        return null;
    };

    const NombresHuellasDerecha = ["PULGAR", "ÍNDICE", "MEDIO", "ANULAR", "MEÑIQUE"];
    const NombresHuellasIzquierda = ["PULGAR", "ÍNDICE", "MEDIO", "ANULAR", "MEÑIQUE"];

    // 3. LÓGICA: Siempre devuelve TRUE para que todo salga marcado
    const hasDoc = (_keyCandidates: string[]) => true;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* CABECERA */}
                <View style={styles.headerBox}>
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '20%', justifyContent: 'center', alignItems: 'center', padding: 2 }]}>
                             <Image 
                                src={logo} 
                                style={{ width: '25%', height: 'auto', objectFit: 'contain' }} 
                             />
                        </View>
                        <View style={[styles.col, { width: '60%' }]}>
                            <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: 'bold', marginTop: 5 }}>FORMATO - HOJA DE VIDA CONDUCTOR VEHÍCULO</Text>
                            <Text style={{ textAlign: 'center', fontSize: 8 }}>INTEGRA CADENA DE SERVICIOS S.A.S.</Text>
                        </View>
                        <View style={[styles.col, { width: '20%', borderRight: 'none' }]}>
                            <Text>CÓDIGO: FORM-TRASEG-001</Text>
                            <Text>VERSIÓN: 8</Text>
                            <Text>FECHA: {new Date().toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                {/* DOCUMENTOS REQUERIDOS */}
                <View style={styles.sectionTitle}><Text>DOCUMENTOS REQUERIDOS</Text></View>
                <View style={styles.docGrid}>
                    <View style={styles.docCol}>
                        <Text style={styles.headerGreen}>1. VEHÍCULO</Text>
                        <View style={styles.docColContent}>
                            <CheckItem label="Tarjeta de Propiedad" checked={hasDoc(['tarjetaPropiedad'])} />
                            <CheckItem label="SOAT" checked={hasDoc(['soat'])} />
                            <CheckItem label="Fotos" checked={hasDoc(['fotos'])} />
                            <CheckItem label="Revisión Tecnomecánica" checked={hasDoc(['revisionTecnomecanica'])} />
                            <CheckItem label="Tarjeta de Remolque" checked={hasDoc(['tarjetaRemolque'])} />
                            <CheckItem label="Póliza Resp. Civil" checked={hasDoc(['polizaResponsabilidadCivil'])} />
                        </View>
                    </View>
                    <View style={styles.docCol}>
                        <Text style={styles.headerGreen}>2. CONDUCTOR</Text>
                        <View style={styles.docColContent}>
                            <CheckItem label="Doc. Identidad Conductor" checked={hasDoc(['documentoIdentidadConductor'])} />
                            <CheckItem label="Licencia Conducción Vig." checked={hasDoc(['licenciaConduccion'])} />
                            <CheckItem label="Planilla EPS y ARL" checked={hasDoc(['planillaEpsArl'])} />
                            <CheckItem label="Foto Conductor" checked={hasDoc(['fotoConductor'])} />
                            <CheckItem label="Cert. Bancaria Conductor" checked={hasDoc(['certificacionBancariaConductor'])} />
                        </View>
                    </View>
                    <View style={[styles.docCol, { borderRight: 'none' }]}>
                        <Text style={styles.headerGreen}>3. TENEDOR</Text>
                        <View style={styles.docColContent}>
                            <CheckItem label="Doc. Identidad Tenedor" checked={hasDoc(['documentoIdentidadTenedor'])} />
                            <CheckItem label="Cert. Bancaria Tenedor" checked={hasDoc(['certificacionBancariaTenedor'])} />
                            <CheckItem label="Doc. Acredita Tenedor" checked={hasDoc(['documentoAcreditacionTenedor'])} />
                            <CheckItem label="RUT Tenedor" checked={hasDoc(['rutTenedor'])} />
                        </View>
                        <Text style={[styles.headerGreen, { borderTop: '1px solid #000' }]}>4. PROPIETARIO</Text>
                        <View style={styles.docColContent}>
                            <CheckItem label="Doc. Identidad Propietario" checked={hasDoc(['documentoIdentidadPropietario'])} />
                            <CheckItem label="Cert. Bancaria Propietario" checked={hasDoc(['certificacionBancariaPropietario'])} />
                            <CheckItem label="RUT Propietario" checked={hasDoc(['rutPropietario'])} />
                        </View>
                    </View>
                </View>

                {/* INFO CONDUCTOR */}
                <View style={styles.sectionTitle}><Text>INFORMACIÓN DEL CONDUCTOR</Text></View>
                <View style={{ border: '1px solid #000', marginBottom: 5 }}>
                    <View style={styles.row}>
                        <View style={[styles.col, styles.w50]}><Text style={styles.label}>NOMBRES Y APELLIDOS</Text><Text style={styles.value}>{upper(veh.condNombres)} {upper(veh.condPrimerApellido)} {upper(veh.condSegundoApellido)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>CÉDULA</Text><Text style={styles.value}>{upper(veh.condCedulaCiudadania)}</Text></View>
                        <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>EXPEDIDA EN</Text><Text style={styles.value}>{upper(veh.condExpedidaEn)}</Text></View>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.col, styles.w50]}><Text style={styles.label}>DIRECCIÓN</Text><Text style={styles.value}>{upper(veh.condDireccion)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>CIUDAD</Text><Text style={styles.value}>{upper(veh.condCiudad)}</Text></View>
                        <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>CELULAR</Text><Text style={styles.value}>{upper(veh.condCelular)}</Text></View>
                    </View>
                    <View style={[styles.row, { borderBottom: 'none' }]}>
                         <View style={[styles.col, styles.w25]}><Text style={styles.label}>EPS</Text><Text style={styles.value}>{upper(veh.condEps)}</Text></View>
                         <View style={[styles.col, styles.w25]}><Text style={styles.label}>ARL</Text><Text style={styles.value}>{upper(veh.condArl)}</Text></View>
                         <View style={[styles.col, styles.w25]}><Text style={styles.label}>LICENCIA No.</Text><Text style={styles.value}>{upper(veh.condNoLicencia)}</Text></View>
                         <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>VENCE</Text><Text style={styles.value}>{upper(veh.condFechaVencimientoLic)}</Text></View>
                    </View>
                </View>

                {/* REFERENCIAS */}
                <View style={styles.sectionTitle}><Text>EN CASO DE EMERGENCIA AVISAR A / REFERENCIAS</Text></View>
                <View style={{ border: '1px solid #000', marginBottom: 5 }}>
                    <View style={styles.row}>
                         <View style={[styles.col, styles.w50]}><Text style={styles.label}>NOMBRE EMERGENCIA</Text><Text style={styles.value}>{upper(veh.condNombreEmergencia)}</Text></View>
                         <View style={[styles.col, styles.w25]}><Text style={styles.label}>PARENTESCO</Text><Text style={styles.value}>{upper(veh.condParentescoEmergencia)}</Text></View>
                         <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>CELULAR</Text><Text style={styles.value}>{upper(veh.condCelularEmergencia)}</Text></View>
                    </View>
                    <View style={[styles.row, { borderBottom: 'none' }]}>
                         <View style={[styles.col, styles.w33]}><Text style={styles.label}>EMPRESA REF.</Text><Text style={styles.value}>{upper(veh.condEmpresaRef)}</Text></View>
                         <View style={[styles.col, styles.w33]}><Text style={styles.label}>CONTACTO</Text><Text style={styles.value}>{upper(veh.condCelularRef)}</Text></View>
                         <View style={[styles.col, styles.w33, { borderRight: 'none' }]}><Text style={styles.label}>MERCANCÍA</Text><Text style={styles.value}>{upper(veh.condMercTransportada)}</Text></View>
                    </View>
                </View>

                {/* DATOS PROP Y TENEDOR */}
                <View style={styles.sectionTitle}><Text>DATOS DEL PROPIETARIO Y TENEDOR</Text></View>
                <View style={{ border: '1px solid #000', marginBottom: 5 }}>
                    <View style={styles.row}>
                         <View style={[styles.col, styles.w50]}><Text style={styles.label}>PROPIETARIO - NOMBRE</Text><Text style={styles.value}>{upper(veh.propNombre)}</Text></View>
                         <View style={[styles.col, styles.w25]}><Text style={styles.label}>DOCUMENTO</Text><Text style={styles.value}>{upper(veh.propDocumento)}</Text></View>
                         <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>CELULAR</Text><Text style={styles.value}>{upper(veh.propCelular)}</Text></View>
                    </View>
                    <View style={[styles.row, { borderBottom: 'none' }]}>
                        <View style={[styles.col, styles.w50]}><Text style={styles.label}>TENEDOR - NOMBRE</Text><Text style={styles.value}>{upper(veh.tenedNombre)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>DOCUMENTO</Text><Text style={styles.value}>{upper(veh.tenedDocumento)}</Text></View>
                        <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>CELULAR</Text><Text style={styles.value}>{upper(veh.tenedCelular)}</Text></View>
                    </View>
                </View>

                {/* VEHICULO */}
                <View style={styles.sectionTitle}><Text>INFORMACIÓN DEL VEHÍCULO</Text></View>
                <View style={{ border: '1px solid #000', marginBottom: 5 }}>
                    <View style={styles.row}>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>PLACA</Text><Text style={styles.value}>{upper(veh.placa)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>MODELO</Text><Text style={styles.value}>{upper(veh.vehModelo)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>MARCA</Text><Text style={styles.value}>{upper(veh.vehMarca)}</Text></View>
                        <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>COLOR</Text><Text style={styles.value}>{upper(veh.vehColor)}</Text></View>
                    </View>
                     <View style={[styles.row, { borderBottom: 'none' }]}>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>CARROCERÍA</Text><Text style={styles.value}>{upper(veh.vehTipoCarroceria)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>SATELITAL</Text><Text style={styles.value}>{upper(veh.vehEmpresaSat)}</Text></View>
                        <View style={[styles.col, styles.w25]}><Text style={styles.label}>USUARIO</Text><Text style={styles.value}>{upper(veh.vehUsuarioSat)}</Text></View>
                        <View style={[styles.col, styles.w25, { borderRight: 'none' }]}><Text style={styles.label}>CLAVE</Text><Text style={styles.value}>{upper(veh.vehClaveSat)}</Text></View>
                    </View>
                </View>

                {/* --- SECCIÓN HUELLAS DACTILARES --- */}
                <View style={styles.sectionTitle}><Text>REGISTRO DACTILAR Y AUTORIZACIÓN</Text></View>
                <View style={styles.huellasContainer}>
                    <Text style={[styles.headerGreen, { width: '100%' }]}>MANO DERECHA</Text>
                    {NombresHuellasDerecha.map((nombre, i) => {
                        const urlHuella = getHuella(i);
                        
                        return (
                            <View key={`der-${i}`} style={styles.huellaBox}>
                                <View style={styles.huellaImageContainer}>
                                    {urlHuella ? (
                                        <Image src={urlHuella} style={styles.huellaImage} />
                                    ) : (
                                        <Text style={{fontSize:6, color:'#999'}}>SIN HUELLA</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 6 }}>{nombre}</Text>
                            </View>
                        );
                    })}

                    <Text style={[styles.headerGreen, { width: '100%' }]}>MANO IZQUIERDA</Text>
                    {NombresHuellasIzquierda.map((nombre, i) => {
                        const urlHuella = getHuella(i + 5);

                        return (
                            <View key={`izq-${i}`} style={[styles.huellaBox, i === 4 ? { borderRight: 'none' } : {}]}>
                                <View style={styles.huellaImageContainer}>
                                    {urlHuella ? (
                                        <Image src={urlHuella} style={styles.huellaImage} />
                                    ) : (
                                        <Text style={{fontSize:6, color:'#999'}}>SIN HUELLA</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 6 }}>{nombre}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* FIRMA */}
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <View style={{ width: '70%', paddingRight: 5 }}>
                         <Text style={{ fontSize: 5, textAlign: 'justify', color: '#555' }}>
                            AUTORIZO A INTEGRA CADENA DE SERVICIOS S.A.S O A QUIEN EN EL FUTURO REPRESENTE SUS DERECHOS U OSTENTE LA CALIDAD DE ACREEDOR...
                        </Text>
                    </View>
                    <View style={{ width: '30%' }}>
                         <View style={styles.firmaBox}>
                             <Text style={{ fontSize: 6 }}>FIRMA:</Text>
                         </View>
                         <Text style={{ fontSize: 6, textAlign: 'center' }}>C.C. {upper(veh.condCedulaCiudadania)}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const HvVehiculos: React.FC<HvVehiculosProps> = ({ vehiculo }) => {
    const [cargandoHuellas, setCargandoHuellas] = useState(false);

    const documentoBusqueda = vehiculo.condCedulaCiudadania; 

    const manejarDescargaDirecta = async () => {
        if (cargandoHuellas) return;

        console.log("🔍 Buscando huellas para conductor:", documentoBusqueda);
        setCargandoHuellas(true);
        
        try {
            // 1. Obtener datos del API
            const res = await axios.get<HuellasResponse>(`${API_BASE}/verificacion/obtener-huellas-pdf/${documentoBusqueda}`);
            
            let huellasData: (string | null)[] = [];
            
            if (res.data && res.data.encontrado && Array.isArray(res.data.huellas)) {
                console.log(`✅ Huellas encontradas: ${res.data.huellas.filter(h => h).length} imágenes`);
                huellasData = res.data.huellas;
            } else {
                console.warn("⚠️ No se encontraron huellas, generando PDF sin ellas.");
            }

            // 2. Generar el PDF en memoria (Blob)
            const blob = await pdf(<DocuPDF veh={vehiculo} huellas={huellasData} />).toBlob();

            // 3. Crear un enlace temporal y descargar
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HV_${vehiculo.placa}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("❌ Error generando PDF:", error);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setCargandoHuellas(false);
        }
    };

    return (
        <div>
            <button 
                className="btn-descarga-pdf" 
                onClick={manejarDescargaDirecta} 
                disabled={cargandoHuellas}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                {cargandoHuellas ? <FaSpinner className="spin" /> : <FaFilePdf />}
                {cargandoHuellas ? " GENERANDO..." : " DESCARGAR HV"}
            </button>
        </div>
    );
};

export default HvVehiculos;