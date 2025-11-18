// server.js - Versión Corregida y Mejorada
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Crear carpeta de descargas si no existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Servir archivos estáticos (tu HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// ✅ Función para formatear duración
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ✅ Función para limpiar archivos antiguos (más de 1 hora)
function cleanOldFiles() {
  try {
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(DOWNLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;
      
      // Eliminar si tiene más de 1 hora (3600000 ms)
      if (fileAge > 3600000) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Archivo eliminado: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error al limpiar archivos:', error);
  }
}

// Ejecutar limpieza cada 10 minutos
setInterval(cleanOldFiles, 600000);

// ✅ Ruta para convertir video (VERSIÓN MEJORADA)
app.post('/api/convert', async (req, res) => {
  const { url, format } = req.body;

  if (!url || !format || !['mp3', 'mp4'].includes(format)) {
    return res.status(400).json({ error: 'URL o formato inválido' });
  }

  console.log(`📥 Nueva solicitud: ${url} -> ${format}`);

  try {
    // PASO 1: Obtener metadatos del video
    const infoProcess = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--no-playlist',
      url
    ]);

    let videoInfo = '';
    let infoError = '';

    infoProcess.stdout.on('data', (data) => {
      videoInfo += data.toString();
    });

    infoProcess.stderr.on('data', (data) => {
      infoError += data.toString();
    });

    infoProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Error al obtener info del video:', infoError);
        return res.status(500).json({ 
          error: 'No se pudo obtener información del video. Verifica la URL.' 
        });
      }

      try {
        const info = JSON.parse(videoInfo);
        console.log(`✅ Video encontrado: ${info.title}`);

        // PASO 2: Descargar el video/audio
        const timestamp = Date.now();
        const sanitizedTitle = info.title
          .substring(0, 50)
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        
        // ✅ Usar template para que yt-dlp ponga la extensión correcta
        const outputTemplate = path.join(
          DOWNLOAD_DIR, 
          `${timestamp}_${sanitizedTitle}.%(ext)s`
        );

        const args = [
          url,
          '-o', outputTemplate,
          '--no-warnings',
          '--no-playlist',
          '--restrict-filenames'
        ];

        // Configuración específica según formato
        if (format === 'mp3') {
          args.push(
            '-x',                    // Extraer audio
            '--audio-format', 'mp3', // Convertir a MP3
            '--audio-quality', '0'   // Mejor calidad
          );
        } else {
          args.push(
            '-f', 'best[ext=mp4]'   // Mejor calidad en MP4
          );
        }

        console.log(`🚀 Iniciando descarga con yt-dlp...`);
        const ytDlp = spawn('yt-dlp', args);

        let downloadError = '';

        ytDlp.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`📊 ${output.trim()}`);
        });

        ytDlp.stderr.on('data', (data) => {
          downloadError += data.toString();
          console.error(`⚠️ ${data.toString().trim()}`);
        });

        ytDlp.on('error', (err) => {
          console.error('❌ Error al iniciar yt-dlp:', err);
          return res.status(500).json({ 
            error: 'No se pudo iniciar yt-dlp. ¿Está instalado?' 
          });
        });

        ytDlp.on('close', (code) => {
          if (code !== 0) {
            console.error('❌ yt-dlp falló:', downloadError);
            return res.status(500).json({ 
              error: 'Error al descargar el video. Intenta nuevamente.' 
            });
          }

          // ✅ BUSCAR el archivo descargado (puede tener extensión diferente)
          try {
            const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => 
              f.startsWith(`${timestamp}_${sanitizedTitle}`)
            );

            if (files.length === 0) {
              console.error('❌ No se encontró el archivo descargado');
              return res.status(500).json({ 
                error: 'El archivo no se generó correctamente' 
              });
            }

            const downloadedFile = files[0];
            console.log(`✅ Descarga completa: ${downloadedFile}`);

            // Respuesta exitosa
            res.json({
              success: true,
              downloadUrl: `/download/${downloadedFile}`,
              title: info.title || 'Video descargado',
              duration: formatDuration(info.duration),
              thumbnail: info.thumbnail || `https://img.youtube.com/vi/${info.id}/mqdefault.jpg`
            });

          } catch (err) {
            console.error('❌ Error al buscar archivo:', err);
            res.status(500).json({ 
              error: 'Error al procesar el archivo descargado' 
            });
          }
        });

      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        res.status(500).json({ 
          error: 'Error al procesar información del video' 
        });
      }
    });

  } catch (error) {
    console.error('❌ Error general en /convert:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ Ruta para servir archivos descargados
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOAD_DIR, filename);

  // Validar que el archivo existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filename}`);
    return res.status(404).send('Archivo no encontrado');
  }

  console.log(`⬇️ Descargando: ${filename}`);

  // Establecer headers apropiados
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4'
  };

  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Enviar archivo
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('❌ Error al descargar:', err);
      if (!res.headersSent) {
        res.status(500).send('Error al descargar el archivo');
      }
    } else {
      console.log(`✅ Descarga completada: ${filename}`);
      
      // ⚠️ OPCIONAL: Descomentar para eliminar archivo después de descarga
      // setTimeout(() => {
      //   try {
      //     if (fs.existsSync(filePath)) {
      //       fs.unlinkSync(filePath);
      //       console.log(`🗑️ Archivo eliminado: ${filename}`);
      //     }
      //   } catch (unlinkError) {
      //     console.error('Error al eliminar archivo:', unlinkError);
      //   }
      // }, 1000);
    }
  });
});

// ✅ Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    downloadsFolder: DOWNLOAD_DIR
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Carpeta de descargas: ${DOWNLOAD_DIR}`);
  console.log(`🧹 Limpieza automática: cada 10 minutos (archivos > 1 hora)`);
  console.log(`\n🔍 Verifica que yt-dlp esté instalado ejecutando: yt-dlp --version\n`);
});