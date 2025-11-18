# 🎧 Conversor de YouTube a MP3/MP4

Aplicación web para descargar y convertir videos de YouTube a formato MP3 (audio) o MP4 (video).

![Conversor de YouTube](https://img.shields.io/badge/YouTube-Converter-red?style=for-the-badge&logo=youtube)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

## ✨ Características

- 🎵 Descarga audio en formato MP3
- 🎬 Descarga video en formato MP4
- 🖼️ Muestra miniatura, título y duración del video
- 🧹 Limpieza automática de archivos antiguos
- 📱 Diseño responsive para móviles
- ⚡ Interfaz moderna y rápida

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
   - Descargar: https://nodejs.org

2. **Python 3**
   - Descargar: https://python.org

3. **yt-dlp** (instalado vía pip)
   ```bash
   pip install yt-dlp
   ```

4. **FFmpeg** (necesario para conversión a MP3)
   ```bash
   # Windows
   winget install ffmpeg
   
   # Mac
   brew install ffmpeg
   
   # Linux
   sudo apt install ffmpeg
   ```

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU-USUARIO/youtube-converter.git
   cd youtube-converter
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Verificar que yt-dlp funcione**
   ```bash
   yt-dlp --version
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
youtube-converter/
│
├── public/
│   └── index.html          # Frontend (HTML, CSS, JS)
│
├── downloads/              # Archivos descargados (se crea automáticamente)
│
├── server.js               # Backend (Node.js + Express)
├── package.json            # Dependencias del proyecto
├── .gitignore              # Archivos ignorados por Git
└── README.md               # Este archivo
```

## 🎯 Uso

1. Abre la aplicación en tu navegador
2. Pega la URL de un video de YouTube
3. Selecciona el formato deseado (MP3 o MP4)
4. Haz clic en "Convertir Video"
5. Espera a que termine el proceso
6. Haz clic en "Descargar Archivo"

### Ejemplos de URLs válidas:

- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/shorts/abc123`

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (con diseño moderno y gradientes)
  - JavaScript (Vanilla)

- **Backend:**
  - Node.js
  - Express.js
  - yt-dlp (para descargar videos)
  - FFmpeg (para conversión de audio)

## ⚙️ Configuración

### Cambiar el puerto del servidor

Edita `server.js` línea 9:

```javascript
const PORT = 3000; // Cambiar a otro puerto si es necesario
```

### Cambiar intervalo de limpieza automática

Edita `server.js` línea 49:

```javascript
setInterval(cleanOldFiles, 600000); // 600000ms = 10 minutos
```

## 🐛 Solución de Problemas

### Error: "No se pudo iniciar yt-dlp"

**Solución:**
```bash
pip install --upgrade yt-dlp
```

### Error: "FFmpeg not found"

**Solución:** Instala FFmpeg siguiendo las instrucciones de la sección "Requisitos Previos"

### Error: "Puerto 3000 en uso"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 📝 Notas

- Los archivos descargados se eliminan automáticamente después de 1 hora
- Solo funciona con videos públicos de YouTube
- Respeta los derechos de autor al descargar contenido

## 📄 Licencia

Este proyecto es de uso educativo.

## 👤 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Herramienta de descarga
- [FFmpeg](https://ffmpeg.org/) - Conversión multimedia
- [Express.js](https://expressjs.com/) - Framework web

---

⭐ Si te gustó este proyecto, ¡dale una estrella en GitHub!
