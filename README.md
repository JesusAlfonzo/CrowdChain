# 💰 CrowdChain - Plataforma de Crowdfunding Descentralizado

![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-3C3C3D?style=for-the-badge&logo=ethereum) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**CrowdChain** es una DApp (Aplicación Descentralizada) que permite crear campañas de financiamiento colectivo, realizar donaciones en Ethereum y gestionar reembolsos de manera **segura, transparente e inmutable** mediante Smart Contracts. Desarrollado como proyecto destacado para portafolio universitario.

## ✨ Características Principales

*   **🤝 Creación de Campañas**: Cualquier usuario puede iniciar una campaña con una meta financiera y un plazo definido.
*   **🔗 Donaciones Descentralizadas**: Los contribuyentes envían ETH directamente al Smart Contract, sin intermediarios.
*   **📊 Transparencia Total**: Todas las transacciones, donaciones y reembolsos se registran en la blockchain y son públicos.
*   **⚙️ Lógica Automatizada**:
    *   **Retiros Seguros**: El creador solo puede retirar los fondos si la **meta se cumple** y **el plazo ha finalizado**.
    *   **Reembolsos Garantizados**: Si la campaña no alcanza su meta, los donantes pueden **reclamar un reembolso completo**.
*   **⏳ Temporizador Integrado**: Cada campaña tiene una fecha límite configurada en el contrato.
*   **🎨 Frontend Moderno**: Interfaz intuitiva y responsiva construida con Tailwind CSS.

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **🖥️ Frontend** | HTML5, JavaScript (Vanilla), Tailwind CSS | Interfaz de usuario responsive y moderna. |
| **📡 Conexión Blockchain** | Web3.js | Conexión entre la interfaz y la blockchain. |
| **🤖 Backend/Contratos** | Solidity (^0.8.0) | Lógica de negocio en Smart Contracts. |
| **🔧 Desarrollo** | Truffle Suite | Entorno de desarrollo, compilación y despliegue. |
| **🏗️ Blockchain Local** | Ganache | Red Ethereum local para desarrollo y pruebas. |
| **👛 Gestión de Cuentas** | MetaMask | Extensión para gestionar wallets y firmar transacciones. |

## 📦 Guía de Instalación y Despliegue Local

### Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v16 o superior) y npm.
- [Git](https://git-scm.com/).
- [MetaMask](https://metamask.io/) instalado en tu navegador.
- Ganache (`npm install -g ganache`).

### Pasos
1.  **Clonar el Repositorio**
    ```bash
    git clone https://github.com/TU_USUARIO/CrowdChain-DApp.git
    cd CrowdChain-DApp
    ```
2.  **Instalar Dependencias**
    ```bash
    npm install
    ```
3.  **Iniciar Blockchain Local**
    ```bash
    ganache --deterministic
    ```
    *Anota las direcciones y claves privadas generadas.*
4.  **Configurar MetaMask**
    *   Crear una nueva red:
        *   **Nombre:** Ganache Local
        *   **RPC URL:** `http://127.0.0.1:8545`
        *   **ID de cadena:** `1337`
    *   Importar una cuenta usando la **Clave Privada** de Ganache.
5.  **Compilar y Desplegar el Contrato**
    ```bash
    truffle compile
    truffle migrate --reset
    ```
    *Copia la **dirección del contrato** que se muestra.*
6.  **Configurar el Frontend**
    Abre `src/js/app.js` y pega la dirección del contrato:
    ```javascript
    const contractAddress = "0xTU_DIRECCION_DEL_CONTRATO_AQUI";
    ```
7.  **Ejecutar el Servidor**
    ```bash
    npx live-server src/ --port=3000
    ```
    La aplicación se abrirá en `http://localhost:3000`.

## 🧪 Probar la Aplicación
1.  Conéctate con MetaMask a la red "Ganache Local".
2.  Crea una **Nueva Campaña** (nombre, descripción, meta en ETH, plazo).
3.  Cambia a otra cuenta en MetaMask y **realiza una donación**.
4.  Observa la **barra de progreso** actualizarse.
5.  Prueba las funciones de **"Retirar Fondos"** y **"Solicitar Reembolso"**.

## 📁 Estructura del Proyecto

```text
CrowdChain-DApp/
├── contracts/          # Contratos Inteligentes (Solidity)
├── migrations/         # Scripts de despliegue de Truffle
├── src/                # Código Fuente del Frontend
│   ├── index.html      # Interfaz de usuario
│   ├── css/            # Estilos (si aplicase)
│   └── js/             # Lógica (app.js)
├── test/               # Pruebas para Smart Contracts
├── truffle-config.js   # Configuración de Truffle
└── README.md           # Documentación del proyecto

## 🤝 Cómo Contribuir
¡Las contribuciones son bienvenidas!
1.  Haz un **Fork** del proyecto.
2.  Crea una rama (`git checkout -b feature/NuevaFuncionalidad`).
3.  Haz commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`).
4.  Sube a tu fork (`git push origin feature/NuevaFuncionalidad`).
5.  Abre un **Pull Request**.

## 📄 Licencia
Este proyecto está bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

---
Desarrollado con ❤️ y Solidity como parte de un portafolio universitario.