# Cryptium — Frontend

**Cryptium** es una plataforma web educativa y experimental orientada al aprendizaje, diseño, cifrado, análisis y criptoanálisis de construcciones criptográficas. Su propósito es facilitar la comprensión de los principios de la seguridad informática mediante herramientas interactivas que permiten experimentar con algoritmos, archivos y técnicas criptográficas.

Este repositorio contiene la interfaz de usuario de Cryptium, desde la cual se accede a sus diferentes funcionalidades.

## Objetivo

Proporcionar una interfaz intuitiva e interactiva que permita explorar conceptos criptográficos, ejecutar operaciones de cifrado y descifrado, analizar resultados y comprender experimentalmente las características y posibles debilidades de diferentes construcciones criptográficas.

## Funcionalidades

- **Cifrado y descifrado de texto:** realizar operaciones criptográficas sobre mensajes.
- **Cifrado y descifrado de archivos:** proteger archivos mediante herramientas de cifrado.
- **Aprendizaje de criptografía:** explorar conceptos de criptografía simétrica y asimétrica, funciones hash, firmas digitales y fundamentos de seguridad.
- **Constructor de cifrados experimentales:** diseñar y probar secuencias de transformaciones criptográficas.
- **Criptoanálisis:** visualizar estadísticas, frecuencias, efecto avalancha y patrones de bloques.
- **Análisis antimalware:** acceder a la funcionalidad de análisis de archivos disponible en el sistema.

*La disponibilidad de cada funcionalidad depende de su implementación y de la conexión con el backend.*

## Tecnologías

- React
- Vite
- JavaScript
- CSS
- Node.js y npm

## Requisitos previos

- Node.js en una versión compatible con las dependencias del proyecto.
- npm.
- Backend de Cryptium disponible para las funcionalidades que requieren comunicación con la API.

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Daniel-B7602/cryptium-frontend.git
   ```

2. Entrar en el directorio del proyecto:

   ```bash
   cd cryptium-frontend
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir en el navegador la dirección que indique Vite, normalmente:

   `http://localhost:5173`

## Integración con el backend

El frontend se comunica con la API de Cryptium para ejecutar las operaciones que requieren procesamiento en el servidor. La dirección de la API debe configurarse mediante las variables de entorno correspondientes, según la configuración del proyecto.

No se deben publicar credenciales, claves privadas ni secretos en el repositorio.

## Estructura general

- `src/`: código fuente de la interfaz.
- `public/`: recursos estáticos.
- `package.json`: dependencias y scripts del proyecto.
- `vite.config.js`: configuración de Vite.
