import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { formatearFechaLarga } from './utils/date';
import { descargarPDF } from './utils/pdfGenerator';
import { nombreArchivoSugerido } from './utils/templateLoader';
import { ContactForm } from './components/ContactForm';
import { CVSelector } from './components/CVSelector';
import { CoverLetterEditor, COVER_LETTER_DEFAULTS } from './components/CoverLetterEditor';
import { PreviewPane } from './components/PreviewPane';
import './App.css';

const CONTACT_DEFAULTS = {
  nombre: 'CANDELA GONZALEZ',
  tituloProfesional: 'Administración | Atención al Cliente | Control de Stock',
  telefono: '(3549) 559939',
  email: 'gcande720@gmail.com',
  zona: 'Córdoba Capital – Zona General Paz',
  linkedin: '',
};

const COVER_INITIAL = {
  ...COVER_LETTER_DEFAULTS,
  fecha: formatearFechaLarga(new Date()),
};

export default function App() {
  const [datosContacto, setDatosContacto] = useLocalStorage('candela-contact-data', CONTACT_DEFAULTS);
  const [datosCarta, setDatosCarta] = useLocalStorage('candela-cover-letter-data', COVER_INITIAL);
  const [selectedCV, setSelectedCV] = useLocalStorage('candela-selected-cv', 'cv-administrativa-recepcionista');
  const [fotoDataUrl, setFotoDataUrl] = useLocalStorage('candela-foto', null);
  const [incluirFoto, setIncluirFoto] = useLocalStorage('candela-incluir-foto', false);
  const [modo, setModo] = useState('cv');
  const [htmlActual, setHtmlActual] = useState('');
  const [descargando, setDescargando] = useState(false);

  const handleHTMLReady = useCallback((html) => {
    setHtmlActual(html || '');
  }, []);

  const handleDescargar = async () => {
    if (descargando) return;
    if (!htmlActual) return;
    setDescargando(true);
    try {
      const nombre = nombreArchivoSugerido(modo, selectedCV, datosCarta);
      descargarPDF(htmlActual, nombre);
    } finally {
      setTimeout(() => setDescargando(false), 1500);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Editor de CV — Candela González</h1>
        <p className="app-subtitle">
          Editá tus datos, elegí la variante y descargá el PDF en una página A4.
        </p>
      </header>

      <main className="app-main">
        <div className="app-col-left">
          <ContactForm
            datos={datosContacto}
            onChange={setDatosContacto}
            fotoDataUrl={fotoDataUrl}
            onFotoChange={setFotoDataUrl}
            incluirFoto={incluirFoto}
            onIncluirFotoChange={setIncluirFoto}
          />
          <CVSelector selectedCV={selectedCV} onSelect={setSelectedCV} />
          <CoverLetterEditor datos={datosCarta} onChange={setDatosCarta} />
        </div>

        <div className="app-col-right">
          <div className="preview-sticky">
            <PreviewPane
              modo={modo}
              onModoChange={setModo}
              selectedCV={selectedCV}
              datosContacto={datosContacto}
              datosCarta={datosCarta}
              fotoDataUrl={fotoDataUrl}
              incluirFoto={incluirFoto}
              onHTMLReady={handleHTMLReady}
            />
          </div>
        </div>
      </main>

      <button
        type="button"
        className="fab-descargar"
        onClick={handleDescargar}
        disabled={descargando || !htmlActual}
        title="Descargar como PDF"
      >
        {descargando ? 'Preparando…' : 'Descargar como PDF'}
      </button>
    </div>
  );
}
