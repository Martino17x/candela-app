import { useRef, useState } from 'react';

const MAX_INPUT_BYTES = 5_000_000;
const MAX_DIM = { width: 300, height: 375 };
const JPEG_QUALITY = 0.85;

function bytesToKb(bytes) {
  if (!bytes) return '0';
  return (bytes / 1024).toFixed(1);
}

function approxBytesFromDataUrl(dataUrl) {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx < 0) return 0;
  const b64 = dataUrl.slice(commaIdx + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

function drawResized(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagen inválida o corrupta'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = MAX_DIM.width;
        canvas.height = MAX_DIM.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const ratio = Math.min(
          MAX_DIM.width / img.width,
          MAX_DIM.height / img.height
        );
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (MAX_DIM.width - w) / 2;
        const y = (MAX_DIM.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader({ fotoDataUrl, onFotoChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado no es una imagen.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError(`La imagen pesa ${bytesToKb(file.size)} KB. Máximo permitido: ${(MAX_INPUT_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await drawResized(file);
      onFotoChange(dataUrl);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la imagen.');
    } finally {
      e.target.value = '';
    }
  };

  const handleQuitar = () => {
    onFotoChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const pesoKb = fotoDataUrl ? bytesToKb(approxBytesFromDataUrl(fotoDataUrl)) : null;

  return (
    <div className="photo-uploader">
      <div className="photo-uploader-row">
        <label className="photo-uploader-label" htmlFor="photo-input">
          <span>Foto de perfil <span className="muted">(opcional)</span></span>
          <input
            ref={inputRef}
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="photo-uploader-input"
          />
        </label>

        {fotoDataUrl && (
          <div className="photo-uploader-preview">
            <img src={fotoDataUrl} alt="Vista previa" />
          </div>
        )}
      </div>

      <div className="photo-uploader-meta">
        {fotoDataUrl && (
          <>
            <span className="photo-uploader-size">~{pesoKb} KB guardados en este navegador</span>
            <button type="button" className="btn-link" onClick={handleQuitar}>
              Quitar foto
            </button>
          </>
        )}
      </div>

      {error && <p className="photo-uploader-error" role="alert">{error}</p>}

      <p className="photo-uploader-help muted">
        La foto vive solo en tu navegador, no se sube a ningún servidor.
      </p>
    </div>
  );
}
