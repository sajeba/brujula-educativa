# Brújula Educativa — Reserva de Aulas

Guía completa para instalar, configurar y publicar la app, pensada para alguien que nunca programó. Segui los pasos en orden, sin saltear ninguno.

---

## Índice

1. [Instalar Node.js](#1-instalar-nodejs)
2. [Crear el proyecto e instalar las librerías](#2-crear-el-proyecto-e-instalar-las-librerías)
3. [Crear el proyecto en Firebase](#3-crear-el-proyecto-en-firebase)
4. [Copiar el código fuente](#4-copiar-el-código-fuente)
5. [Probar la app en tu computadora](#5-probar-la-app-en-tu-computadora)
6. [Publicar gratis en Vercel](#6-publicar-gratis-en-vercel)
7. [Cómo funciona la app](#7-cómo-funciona-la-app)
8. [Sobre la seguridad del panel de administración](#8-sobre-la-seguridad-del-panel-de-administración)
9. [Personalizar](#9-personalizar)

---

## 1. Instalar Node.js

Node.js es el programa que te permite ejecutar y compilar el proyecto.

1. Andá a **https://nodejs.org**
2. Descargá la versión **LTS** (la recomendada, no la "Current").
3. Abrí el instalador y hacé clic en "Siguiente" hasta terminar (las opciones por defecto están bien).
4. Reiniciá tu computadora si el instalador te lo pide.
5. Para confirmar que quedó instalado, abrí una terminal:
   - **Windows**: buscá "cmd" o "PowerShell" en el menú inicio.
   - **Mac**: buscá "Terminal" con Spotlight (Cmd + Espacio).
6. Escribí estos dos comandos, uno por vez, y presioná Enter:
   ```bash
   node -v
   npm -v
   ```
   Si ves números de versión (por ejemplo `v20.11.0` y `10.2.4`), quedó instalado correctamente.

---

## 2. Crear el proyecto e instalar las librerías

Ya tenés el código fuente de este proyecto (carpeta `brujula-educativa`). Solo falta instalar las librerías que usa.

1. Abrí la terminal.
2. Navegá hasta la carpeta del proyecto con `cd`. Por ejemplo, si la carpeta está en tu Escritorio:
   ```bash
   cd Desktop/brujula-educativa
   ```
3. Instalá todas las dependencias con un solo comando:
   ```bash
   npm install
   ```
   Esto puede tardar 1–2 minutos. Vas a ver que aparece una carpeta nueva `node_modules` — es normal, ahí quedan guardadas las librerías.

> Si en algún momento necesitás crear un proyecto de Vite desde cero (por ejemplo para empezar de nuevo), el comando es:
> ```bash
> npm create vite@latest brujula-educativa -- --template react
> cd brujula-educativa
> npm install
> npm install firebase lucide-react
> npm install -D tailwindcss postcss autoprefixer
> ```
> Pero como ya tenés todos los archivos de este proyecto, con el paso 3 alcanza.

---

## 3. Crear el proyecto en Firebase

Firebase es la base de datos gratuita donde se van a guardar las reservas en tiempo real.

1. Andá a **https://console.firebase.google.com**
2. Iniciá sesión con una cuenta de Google.
3. Hacé clic en **"Crear un proyecto"** (o "Add project").
4. Ponele un nombre, por ejemplo `brujula-educativa`, y hacé clic en **Continuar**.
5. Podés desactivar Google Analytics (no lo necesitamos) y hacer clic en **Crear proyecto**.
6. Una vez creado, en el menú lateral izquierdo hacé clic en **Compilación (Build) → Firestore Database**.
7. Hacé clic en **Crear base de datos**.
8. Elegí **"Comenzar en modo de prueba"** (test mode) — esto nos deja leer y escribir libremente por ahora. Más adelante vas a copiar las reglas de seguridad del paso 8 de esta guía.
9. Elegí la ubicación del servidor más cercana a tu país (por ejemplo `southamerica-east1`) y confirmá.

### Obtener las credenciales (firebaseConfig)

1. Hacé clic en el ícono de **engranaje ⚙️** arriba a la izquierda → **Configuración del proyecto**.
2. Bajá hasta la sección **"Tus apps"** y hacé clic en el ícono **`</>`** (Web).
3. Ponele un apodo a la app, por ejemplo `brujula-web`, y hacé clic en **Registrar app**.
4. Firebase te va a mostrar un bloque de código como este:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "brujula-educativa.firebaseapp.com",
     projectId: "brujula-educativa",
     storageBucket: "brujula-educativa.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
5. **Copiá esos valores** y pegalos en el archivo `src/firebase.js` de tu proyecto, reemplazando los valores de ejemplo (`"TU_API_KEY"`, etc.).

---

## 4. Copiar el código fuente

Ya tenés todos los archivos necesarios en la carpeta del proyecto:

```
brujula-educativa/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── src/
    ├── main.jsx
    ├── App.jsx        ← pantalla de reserva
    ├── Admin.jsx       ← panel de administración
    ├── firebase.js     ← acá pegás tu firebaseConfig (paso 3)
    └── index.css
```

Solo tenés que editar `src/firebase.js` con tus credenciales de Firebase (paso 3) y, si querés, `src/App.jsx` para cambiar el número de WhatsApp (ver [Personalizar](#9-personalizar)).

---

## 5. Probar la app en tu computadora

Con las dependencias instaladas y `firebase.js` configurado:

```bash
npm run dev
```

La terminal te va a mostrar una dirección como `http://localhost:5173`. Abrila en tu navegador y ya deberías ver la pantalla de reserva funcionando.

Para probar el panel de administración, andá a `http://localhost:5173/admin` (PIN por defecto: `1234`).

Para detener el servidor, volvé a la terminal y presioná `Ctrl + C`.

---

## 6. Publicar gratis en Vercel

1. Subí tu proyecto a GitHub (si no sabés cómo, Vercel también te permite arrastrar la carpeta directamente, ver más abajo).
2. Andá a **https://vercel.com** y creá una cuenta gratis (podés usar tu cuenta de GitHub para entrar más rápido).
3. Hacé clic en **"Add New… → Project"**.
4. Si conectaste GitHub, elegí el repositorio `brujula-educativa` y hacé clic en **Import**.
5. Vercel detecta automáticamente que es un proyecto Vite. Dejá la configuración por defecto y hacé clic en **Deploy**.
6. Esperá 1–2 minutos. Al terminar te va a dar un enlace público como:
   ```
   https://brujula-educativa.vercel.app
   ```
7. Ese es el enlace que vas a compartir con profesores y profesionales, y el que usa el botón de WhatsApp para volver desde el comprobante.

> **Alternativa sin GitHub:** en la pantalla de "Add New Project" también existe la opción de arrastrar la carpeta del proyecto directamente. Es más simple para empezar, pero perdés la posibilidad de "recompilar" con un solo clic cuando hagas cambios — para eso conviene GitHub.

El archivo `vercel.json` que ya está en el proyecto le indica a Vercel que la ruta `/admin` debe cargar la aplicación (no un error 404), así que no necesitás configurar nada extra.

---

## 7. Cómo funciona la app

- **Sin login para usuarios**: cualquiera entra al enlace, completa nombre, rol, fecha, aula y horario, y confirma. No hace falta crear cuenta.
- **Disponibilidad en tiempo real**: la grilla de horarios consulta Firestore con `onSnapshot`, así que si dos personas están mirando la pantalla al mismo tiempo, en cuanto una reserva, el horario desaparece para la otra sin necesidad de recargar la página.
- **Duración según el rol**: "Profesor" reserva en bloques de 1 hora; "Profesional" en bloques de 3 horas continuas. El sistema solo muestra los bloques donde las 1 o 3 horas están completamente libres.
- **Comprobante**: al confirmar, la pantalla cambia a una tarjeta lista para captura de pantalla, con un código único (por ejemplo `#BE-4821`) y un botón que abre WhatsApp con el mensaje ya redactado, dirigido al número configurado en `NUMERO_WHATSAPP`.
- **Panel `/admin`**: pide un PIN (por defecto `1234`, cambialo en `src/Admin.jsx`) y muestra una grilla de Aulas × Horarios para el día elegido, actualizada en vivo, con un botón para liberar cualquier turno manualmente.

---

## 8. Sobre la seguridad del panel de administración

Es importante que sepas esto: el PIN del panel de administración es **solo una traba visual dentro de la aplicación**, no es una autenticación real de Firebase. Como pediste que los usuarios comunes reserven sin ningún login, la base de datos tiene que aceptar escrituras de cualquier persona — y eso técnicamente también incluye a alguien con conocimientos técnicos que intente saltarse el PIN.

Para un instituto chico esto suele ser un riesgo aceptable, pero si más adelante querés más seguridad, las dos mejoras posibles son:

1. **Reglas de Firestore más estrictas** (nivel básico): en la consola de Firebase, andá a **Firestore Database → Reglas** y pegá esto:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /reservas/{docId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasAll(
           ['aula', 'fecha', 'horaInicio', 'horaFin', 'nombre', 'rol', 'codigo']
         );
         allow delete: if true;
         allow update: if false;
       }
     }
   }
   ```
   Esto exige que cualquier reserva nueva tenga los campos correctos, pero sigue sin exigir autenticación real (porque no la hay).

2. **Firebase Authentication real** (nivel avanzado, opcional): si en el futuro querés que solo los dueños con usuario y contraseña puedan borrar reservas, se puede agregar Firebase Auth y restringir el `allow delete` a usuarios autenticados. Es un cambio más grande que si querés lo armamos en otra iteración.

---

## 9. Personalizar

Todo lo editable está agrupado arriba de cada archivo:

- **`src/App.jsx`**, al principio del archivo:
  - `NOMBRE_INSTITUTO` — nombre que aparece en el encabezado y el comprobante.
  - `NUMERO_WHATSAPP` — número de administración, con código de país y sin "+" ni espacios (ej. `5491112345678`).
  - `HORA_APERTURA` / `HORA_CIERRE` — horario de funcionamiento del instituto.
  - `AULAS` — nombres y capacidades de las aulas.
- **`src/Admin.jsx`**, al principio del archivo:
  - `ADMIN_PIN` — el PIN de acceso al panel.
- **`tailwind.config.js`**: paleta de colores y tipografías, por si más adelante querés ajustar el diseño.

Cualquier cambio que hagas se ve al instante si tenés `npm run dev` corriendo, y se publica solo cuando volvés a hacer `Deploy` en Vercel (o subís los cambios a GitHub, si conectaste el repositorio).
