import { useState, useEffect } from 'react';
import { generarHTMLActual } from '../utils/templateLoader';

export function PreviewPane({ modo, onModoChange, selectedCV, datosContacto, datosCarta, fotoDataUrl, incluirFoto, onHTMLReady }) {
  const [htmlFinal, setHtmlFinal] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setError(null);
    setCargando(true);
    setHtmlFinal('');

    (async () => {
      try {
        const html = await generarHTMLActual(modo, selectedCV, datosContacto, datosCarta, fotoDataUrl, incluirFoto);
        if (!cancelado) {
          setHtmlFinal(html);
          onHTMLReady?.(html);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'Error al cargar el template');
          onHTMLReady?.(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [modo, selectedCV, datosContacto, datosCarta, fotoDataUrl, incluirFoto, onHTMLReady]);

  return (
    <div className="preview-pane">
      <div className="preview-pane-header">
        <h2 className="card-title">Preview</h2>
        <div className="preview-tabs" role="tablist" aria-label="Cambiar entre CV y carta">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'cv'}
            className={`preview-tab ${modo === 'cv' ? 'preview-tab--active' : ''}`}
            onClick={() => onModoChange('cv')}
          >
            CV
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'carta'}
            className={`preview-tab ${modo === 'carta' ? 'preview-tab--active' : ''}`}
            onClick={() => onModoChange('carta')}
          >
            Carta
          </button>
        </div>
      </div>

      {cargando && (
        <div className="preview-status">Cargando template…</div>
      )}

      {error && (
        <div className="preview-error" role="alert">
          <strong>No se pudo cargar el template.</strong>
          <p>{error}</p>
          <p className="muted">
            Verificá que la app esté corriendo con <code>npm run dev</code> y no abriendo
            el HTML directamente. En producción, asegurate de que los archivos de{' '}
            <code>public/templates/</code> estén desplegados.
          </p>
        </div>
      )}

      {!error && !cargando && htmlFinal && (
        <iframe
          title="Preview del documento"
          srcDoc={htmlFinal}
          className="preview-iframe"
        />
      )}
    </div>
  );
}
