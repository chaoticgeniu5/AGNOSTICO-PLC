# 🏭 Manual Completo - Industrial Gateway Platform

**Sistema Universal de Gateway y Emulador de PLCs para Automatización Industrial**

Versión 1.0.0 | © 2026 Industrial Automation Solutions

---

## 📋 Índice

1. [Introducción](#introducción)
2. [¿Qué es Industrial Gateway Platform?](#qué-es-industrial-gateway-platform)
3. [Casos de Uso](#casos-de-uso)
4. [Requerimientos del Sistema](#requerimientos-del-sistema)
5. [Instalación](#instalación)
   - [Ubuntu/Debian](#instalación-en-ubuntudebian)
   - [Red Hat/CentOS](#instalación-en-red-hatcentos)
   - [Docker](#instalación-con-docker)
   - [Windows (Desarrollo)](#instalación-en-windows)
6. [Interfaz Web](#interfaz-web)
7. [CLI - Interfaz de Línea de Comandos](#cli---interfaz-de-línea-de-comandos)
8. [TUI - Interfaz de Terminal](#tui---interfaz-de-terminal)
9. [Configuración de PLCs](#configuración-de-plcs)
10. [Mapeo de Tags](#mapeo-de-tags)
11. [Protocolos Soportados](#protocolos-soportados)
12. [API REST](#api-rest)
13. [Seguridad](#seguridad)
14. [Monitoreo y Logs](#monitoreo-y-logs)
15. [Troubleshooting](#troubleshooting)
16. [Scripts de Demo](#scripts-de-demo)
17. [Mejores Prácticas](#mejores-prácticas)
18. [Soporte y Licenciamiento](#soporte-y-licenciamiento)

---

## Introducción

Industrial Gateway Platform es una solución profesional de software que resuelve el desafío crítico de integración en entornos de automatización industrial modernos: **conectar múltiples marcas y protocolos de PLCs con dashboards y sistemas SCADA que hablan diferentes lenguajes**.

### Problema que Resuelve

En plantas industriales modernas, es común encontrar:
- PLCs Siemens usando S7Comm
- Allen-Bradley usando EtherNet/IP
- Schneider usando Modbus TCP
- Sistemas legacy con Modbus RTU
- Dashboards que solo hablan OPC UA

**Resultado:** Integración compleja, costosa y propensa a errores.

### Nuestra Solución

Un gateway universal que:
1. **Se conecta** a cualquier marca/protocolo de PLC (lado INPUT)
2. **Normaliza** los datos en tiempo real
3. **Emula** el PLC que tu dashboard necesita (lado OUTPUT)
4. **Mapea y transforma** valores según tus necesidades

**Todo sin tocar tus PLCs reales ni modificar tu SCADA existente.**

---

## ¿Qué es Industrial Gateway Platform?

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    LADO INPUT (Fuentes)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Siemens S7  │  │Allen-Bradley│  │  Schneider  │        │
│  │  (S7Comm)   │  │(EtherNet/IP)│  │(Modbus TCP) │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │  MOTOR NORMALIZACIÓN  │                      │
│              │   • Unificación       │                      │
│              │   • Transformación    │                      │
│              │   • Re-etiquetado     │                      │
│              │   • Escalamiento      │                      │
│              └───────────┬───────────┘                      │
│                          │                                   │
│                    LADO OUTPUT (Emuladores)                 │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                 │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐       │
│  │  OPC UA     │  │   Modbus    │  │  Genérico   │       │
│  │  Server     │  │   Server    │  │             │       │
│  │ (Siemens/AB)│  │ (Schneider) │  │             │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │   DASHBOARDS/SCADA    │                      │
│              │  (Sin modificaciones) │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

#### 1. Backend (Motor del Gateway)
- **Lenguaje:** Node.js + TypeScript
- **Base de datos:** SQLite (Prisma ORM)
- **API REST:** Fastify
- **Real-time:** Socket.IO (WebSocket)
- **Protocolos:** node-opcua, modbus-serial

#### 2. Frontend Web
- **Framework:** React 18 + TypeScript
- **Styling:** TailwindCSS
- **Build:** Vite
- **Animaciones:** Framer Motion
- **Gráficas:** Recharts

#### 3. CLI/TUI
- **CLI Framework:** Commander.js
- **TUI Framework:** blessed + blessed-contrib
- **Salida:** Chalk (colores), Ora (spinners)
- **Interacción:** Inquirer (prompts)

### Modos de Deployment

| Modo | Plataforma | Uso Recomendado |
|------|-----------|-----------------|
| **Web** | Windows, macOS, Linux, Docker | Operadores, ingenieros, control rooms |
| **CLI/TUI** | Linux (Ubuntu, Red Hat, CentOS) | Servidores, edge devices, automation |
| **Hybrid** | Ambos en paralelo | Entornos enterprise multi-site |

---

## Casos de Uso

### 1. Integración Multi-Vendor

**Escenario:**
Planta con 5 PLCs de marcas diferentes que necesitan alimentar un único dashboard Ignition.

**Solución:**
```
PLCs → Industrial Gateway → OPC UA Server → Ignition
(5 protocolos)     ↓            ↓         (1 conexión)
               Normaliza    Unifica tags
```

**Beneficio:** Reducción de 90% en complejidad de integración.

### 2. Modernización de SCADA Legacy

**Escenario:**
Sistema SCADA viejo que solo habla Modbus, pero PLCs nuevos usan OPC UA.

**Solución:**
```
PLCs Modernos → Gateway → Modbus TCP Emulator → SCADA Legacy
  (OPC UA)         ↓            ↓              (Sin cambios)
               Convierte    Presenta como
                           Modbus
```

**Beneficio:** Modernización sin reemplazar SCADA (costo 80% menor).

### 3. Edge Computing en Plantas Remotas

**Escenario:**
Planta remota sin personal permanente, acceso solo SSH.

**Solución:**
```
PLCs Locales → Gateway (Linux CLI/TUI) → Cloud SCADA
                    ↓
              Gestión SSH remota
              Monitoreo igp tui
```

**Beneficio:** Operación headless, bajo consumo, gestión remota.

### 4. Normalización y Re-escalamiento

**Escenario:**
Dashboard requiere temperatura en °F pero PLCs envían °C.

**Solución:**
```
PLC (°C) → Gateway Mapping (× 1.8 + 32) → Dashboard (°F)
```

**Beneficio:** Conversión automática sin programación PLC.

### 5. Agregación Multi-Site

**Escenario:**
3 plantas diferentes, dashboard corporativo único.

**Solución:**
```
Planta A (Siemens) ──┐
Planta B (AB)       ──┼→ Gateway Central → Dashboard Corporativo
Planta C (Schneider)──┘
```

**Beneficio:** Vista unificada con tags estandarizados.

---

## Requerimientos del Sistema

### Mínimos (Producción Ligera)

| Componente | Especificación |
|------------|----------------|
| **CPU** | 2 cores @ 2.0 GHz |
| **RAM** | 2 GB |
| **Disco** | 5 GB disponibles |
| **OS** | Ubuntu 20.04+, Debian 10+, RHEL 8+, CentOS 8+ |
| **Red** | 100 Mbps |
| **Puertos** | 3000, 4840, 502 (configurables) |

### Recomendados (Producción Media)

| Componente | Especificación |
|------------|----------------|
| **CPU** | 4 cores @ 2.5 GHz |
| **RAM** | 4 GB |
| **Disco** | 10 GB SSD |
| **OS** | Ubuntu 22.04 LTS, RHEL 9 |
| **Red** | 1 Gbps |

### Enterprise (Carga Alta)

| Componente | Especificación |
|------------|----------------|
| **CPU** | 8+ cores @ 3.0 GHz |
| **RAM** | 8+ GB |
| **Disco** | 50 GB SSD NVMe |
| **OS** | Cualquier Linux moderno |
| **Red** | 10 Gbps |
| **HA** | Cluster con load balancer |

### Capacidad por Instancia

| Métrica | Valor Típico | Máximo Probado |
|---------|--------------|----------------|
| **PLCs INPUT** | 10-20 | 100 |
| **PLCs OUTPUT** | 5-10 | 50 |
| **Tags Totales** | 1,000-5,000 | 10,000 |
| **Mappings** | 500-1,000 | 5,000 |
| **Clientes OPC UA** | 5-10 | 20 |
| **Latencia** | < 50ms | < 100ms |

### Software Requerido

**Servidor Linux:**
- Node.js 20.x o superior
- npm 10.x o superior
- systemd (para service management)
- SQLite 3.x (incluido)

**Desarrollo:**
- Git
- TypeScript 5.x
- Build tools (gcc, make, python3)

**Opcional:**
- Docker 24.x + Docker Compose
- Nginx (reverse proxy)
- SSL certificates (Let's Encrypt)

---

## Instalación

### Instalación en Ubuntu/Debian

#### Paso 1: Descargar el Instalador

```bash
# Descargar desde releases oficiales
wget https://releases.industrial-gateway.io/latest/install-debian.sh

# O si tienes el código fuente
cd /path/to/industrial-gateway-platform
chmod +x install-debian.sh
```

#### Paso 2: Ejecutar Instalación

```bash
sudo ./install-debian.sh
```

**El instalador realiza automáticamente:**
1. ✅ Instala Node.js 20.x
2. ✅ Instala build tools
3. ✅ Copia archivos a `/opt/industrial-gateway`
4. ✅ Instala dependencias npm
5. ✅ Genera cliente Prisma
6. ✅ Crea usuario de sistema `industrial`
7. ✅ Inicializa base de datos
8. ✅ Genera secreto JWT seguro
9. ✅ Configura servicio systemd
10. ✅ Inicia el servicio
11. ✅ Habilita auto-inicio

#### Paso 3: Verificar Instalación

```bash
# Ver estado del servicio
systemctl status industrial-gateway

# Debe mostrar: "active (running)"

# Probar CLI
igp --version
igp status

# Ver logs
journalctl -u industrial-gateway -f
```

#### Paso 4: Primer Acceso

```bash
# Login via CLI
igp login
# Username: admin
# Password: admin123

# O lanzar TUI
igp tui
```

### Instalación en Red Hat/CentOS

#### Paso 1: Descargar el Instalador

```bash
wget https://releases.industrial-gateway.io/latest/install-redhat.sh
chmod +x install-redhat.sh
```

#### Paso 2: Ejecutar Instalación

```bash
sudo ./install-redhat.sh
```

**Diferencias con Debian:**
- Usa `dnf` en lugar de `apt`
- Configura SELinux contexts
- Abre puertos en firewalld automáticamente
- Instala EPEL repository

#### Paso 3: Configurar Firewall (si es necesario)

```bash
# Verificar reglas
sudo firewall-cmd --list-all

# Agregar puertos manualmente si falta
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=4840/tcp
sudo firewall-cmd --permanent --add-port=502/tcp
sudo firewall-cmd --reload
```

#### Paso 4: Configurar SELinux (si está habilitado)

```bash
# Ver estado de SELinux
getenforce

# Si muestra "Enforcing" y hay problemas:
sudo ausearch -m avc -ts recent

# Aplicar contextos
sudo semanage fcontext -a -t bin_t "/opt/industrial-gateway/packages/backend/dist/index.js"
sudo restorecon -v "/opt/industrial-gateway/packages/backend/dist/index.js"
```

### Instalación con Docker

#### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar o copiar el proyecto
cd /path/to/industrial-gateway-platform

# Iniciar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acceder
# Web UI: http://localhost
# API: http://localhost:3000
```

#### Opción 2: Docker Manual

```bash
# Build backend
docker build -f Dockerfile.backend -t igp-backend .

# Build frontend
docker build -f Dockerfile.frontend -t igp-frontend .

# Run backend
docker run -d \
  --name igp-backend \
  -p 3000:3000 \
  -p 4840:4840 \
  -p 502:502 \
  -v igp-data:/var/lib/industrial-gateway \
  igp-backend

# Run frontend
docker run -d \
  --name igp-frontend \
  -p 80:80 \
  --link igp-backend:backend \
  igp-frontend
```

#### Configuración Docker Compose

El archivo `docker-compose.yml` incluido:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
      - "4840:4840"
      - "502:502"
    environment:
      - DATABASE_URL=file:/app/data/dev.db
      - JWT_SECRET=${JWT_SECRET:-change-this}
      - PORT=3000
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Instalación en Windows (Desarrollo)

```powershell
# Clonar repositorio
git clone https://github.com/industrial-gateway/platform.git
cd platform

# Instalar backend
cd packages\backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npx tsx src\database\seed.ts

# Terminal 1: Iniciar backend
npm run dev

# Terminal 2: Instalar y ejecutar frontend
cd ..\frontend
npm install
npm run dev

# Acceder a http://localhost:5173
```

---

## Interfaz Web

### Acceso

**URL:** `http://localhost:5173` (desarrollo) o `http://localhost` (Docker)

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

### Páginas Principales

#### 1. Dashboard

**Ruta:** `/`

**Características:**
- 4 tarjetas de estadísticas en tiempo real
  - PLCs de entrada
  - PLCs de salida
  - Mapeos activos
  - Total de tags
- Logs del sistema en streaming
- Acciones rápidas
- Estado de conexión WebSocket

**Captura conceptual:**
```
╔══════════════════════════════════════════════════════════╗
║ $ INDUSTRIAL_GATEWAY                    ● admin | LOGOUT ║
╠══════════════════════════════════════════════════════════╣
║ DASHBOARD | INPUT PLCs | OUTPUT PLCs | MAPPINGS | LOGS  ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ┌─INPUT PLCs─┐ ┌─OUTPUT PLCs┐ ┌─MAPPINGS─┐ ┌─TAGS────┐║
║  │     3      │ │      1     │ │    2     │ │    7    │║
║  └────────────┘ └────────────┘ └──────────┘ └─────────┘║
║                                                          ║
║  ┌─ SYSTEM LOGS ────────────────────────────────────────┐║
║  │ [INFO] Started Siemens S7-1500                      │║
║  │ [INFO] Tag update: Temperature_Zone1 = 75.3°C      │║
║  └──────────────────────────────────────────────────────┘║
╚══════════════════════════════════════════════════════════╝
```

#### 2. INPUT PLCs

**Ruta:** `/input-plcs`

**Funcionalidad:**
- Listar todos los PLCs simulados (fuentes de datos)
- Ver estado (running/stopped)
- Crear nuevo PLC input
- Iniciar/detener simuladores
- Ver tags con gráficas en tiempo real
- Eliminar PLCs

**Crear PLC Input:**
```
1. Click "CREATE PLC"
2. Nombre: "Production Line 1"
3. Marca: Siemens
4. Protocolo: S7Comm (auto-seleccionado)
5. Click "CREATE"
6. Click "START"
```

#### 3. OUTPUT PLCs

**Ruta:** `/output-plcs`

**Funcionalidad:**
- Listar emuladores (PLCs virtuales)
- Ver endpoint de conexión (para dashboards)
- Crear emulador
- Iniciar/detener emuladores
- Copiar endpoint al portapapeles

**Crear PLC Output:**
```
1. Click "CREATE EMULATOR"
2. Nombre: "SCADA Gateway"
3. Emular como: Generic OPC UA PLC
4. Click "CREATE"
5. Copiar endpoint: opc.tcp://localhost:4840
6. Click "START"
```

#### 4. MAPPINGS

**Ruta:** `/mappings`

**Funcionalidad:**
- Listar todos los mapeos
- Ver flujo: Input → Transform → Output
- Crear nuevo mapeo
- Configurar transformaciones (escala, offset)
- Habilitar/deshabilitar mapeos
- Eliminar mapeos

**Crear Mapping:**
```
1. Click "CREATE MAPPING"
2. Input PLC: Siemens S7-1500
3. Input Tag: Temperature_Zone1
4. Transformación:
   - Scale: 1.8
   - Offset: 32
   (Convierte °C a °F)
5. Output PLC: SCADA Gateway
6. Output Tag Name: Temp_Zone1_F
7. Output Address: ns=1;s=TempF
8. Click "CREATE MAPPING"
```

#### 5. LOGS

**Ruta:** `/logs`

**Funcionalidad:**
- Stream de logs en tiempo real
- Filtros por nivel (INFO, WARN, ERROR)
- Contadores por nivel
- Auto-scroll
- Búsqueda (próximamente)

### Temas y Diseño

**Estética CLI-Inspired:**
- Colores: Negro profundo + acentos neón
- Tipografía: JetBrains Mono (monospace)
- Paneles tipo terminal
- Comandos visuales simulados
- Feedback inmediato

**Paleta de Colores:**
```css
Background:   #0a0e14  /* Negro profundo */
Cyan:         #00d9ff  /* Primary, títulos */
Green:        #00ff9f  /* Success, running */
Magenta:      #ff007f  /* Mappings, enlaces */
Yellow:       #ffcc00  /* Warnings */
Red:          #ff3333  /* Errors, stop */
Text Dim:     #6c7a89  /* Texto secundario */
```

---

## CLI - Interfaz de Línea de Comandos

### Instalación del CLI

**Post-instalación automática:**
El CLI se instala automáticamente como `igp` y está disponible globalmente.

```bash
# Verificar instalación
which igp
# Output: /usr/local/bin/igp

# Ver versión
igp --version
# Output: 1.0.0
```

### Comandos Disponibles

#### Sistema

**igp status**
Muestra estado general del sistema.

```bash
igp status

# Output:
# SYSTEM STATUS
# ────────────────────────────────────────
# │ Metric        │ Value                │
# ────────────────────────────────────────
# │ Status        │ ● RUNNING            │
# │ Input PLCs    │ 3                    │
# │ Output PLCs   │ 1                    │
# │ Active Mappings│ 2                   │
# │ Total Tags    │ 7                    │
# ────────────────────────────────────────
```

**igp health**
Health check del sistema.

```bash
igp health

# Output:
# ✓ System healthy
# Response:
# {
#   "status": "ok",
#   "timestamp": "2026-01-15T10:30:00Z"
# }
```

**igp start [--daemon]**
Inicia el gateway (modo desarrollo).

```bash
# Foreground
igp start

# Background (daemon)
igp start --daemon
```

**igp stop**
Detiene el gateway.

**igp restart**
Reinicia el gateway.

**igp tui**
Lanza la interfaz de terminal interactiva.

#### PLCs

**igp plc list [--type INPUT|OUTPUT]**
Lista todos los PLCs.

```bash
# Todos
igp plc list

# Solo inputs
igp plc list --type INPUT

# Solo outputs
igp plc list --type OUTPUT

# Output ejemplo:
# PLCs
# ───────────────────────────────────────────────────
# │ ID    │ Name         │ Brand   │ Status      │
# ───────────────────────────────────────────────────
# │ plc1  │ Siemens S7   │ SIEMENS │ ● RUNNING   │
# │ plc2  │ Allen-Bradley│ ALLEN_B │ ● RUNNING   │
# ───────────────────────────────────────────────────
```

**igp plc create**
Crea un PLC (modo interactivo).

```bash
igp plc create

# Prompts:
# ? PLC Name: Production Line 1
# ? Select Brand: Siemens (S7COMM)
# ? PLC Type: Input (Simulator)
# ✓ PLC created successfully
# ? Start this PLC now? Yes
# ✓ PLC started successfully
```

**igp plc create (no interactivo)**

```bash
igp plc create \
  --name "Line 1" \
  --brand SIEMENS \
  --protocol S7COMM \
  --type INPUT
```

**igp plc start <id>**
Inicia un PLC.

```bash
igp plc start plc-abc123
# ✓ PLC started successfully
```

**igp plc stop <id>**
Detiene un PLC.

**igp plc info <id>**
Muestra detalles completos de un PLC.

```bash
igp plc info plc-abc123

# Output:
# PLC DETAILS
# ────────────────────────────────────
# │ Property  │ Value              │
# ────────────────────────────────────
# │ ID        │ plc-abc123         │
# │ Name      │ Siemens S7-1500    │
# │ Brand     │ Siemens            │
# │ Protocol  │ S7COMM             │
# │ Type      │ INPUT              │
# │ Status    │ ● RUNNING          │
# │ Tags      │ 3                  │
# ────────────────────────────────────
#
# TAGS
# ────────────────────────────────────
# │ Name              │ Value  │ Unit│
# ────────────────────────────────────
# │ Temperature_Zone1 │ 75.34  │ °C │
# │ Pressure_Tank1    │ 101.25 │ PSI│
# ────────────────────────────────────
```

**igp plc delete <id>**
Elimina un PLC.

```bash
igp plc delete plc-abc123
# ? Are you sure? Yes
# ✓ PLC deleted successfully
```

#### Tags

**igp tag list <plcId>**
Lista tags de un PLC.

```bash
igp tag list plc-abc123

# Output:
# TAGS
# ───────────────────────────────────────────────────────
# │ Name              │ Address │ Value │ Unit │ Signal│
# ───────────────────────────────────────────────────────
# │ Temperature_Zone1 │ DB1.DBD0│ 75.34 │ °C   │ SINE  │
# │ Pressure_Tank1    │ DB1.DBD4│ 101.2 │ PSI  │ SINE  │
# ───────────────────────────────────────────────────────
```

**igp tag create**
Crea un tag.

```bash
igp tag create \
  --plc plc-abc123 \
  --name Temperature_Zone2 \
  --address DB1.DBD12 \
  --type FLOAT \
  --unit °C \
  --signal SINE
```

**igp tag watch <tagId>**
Observa un tag en tiempo real.

```bash
igp tag watch tag-xyz789

# Output (actualización continua):
# 👁  Watching tag (Press Ctrl+C to stop)
#
# Connected to server
#
# 10:30:45 Temperature_Zone1: 75.342 GOOD
# 10:30:46 Temperature_Zone1: 76.128 GOOD
# 10:30:47 Temperature_Zone1: 77.015 GOOD
# ...
```

#### Mappings

**igp mapping list**
Lista todos los mapeos.

```bash
igp mapping list

# Output:
# TAG MAPPINGS
# ──────────────────────────────────────────────────────────────
# │ Input Tag    │ → │ Output Tag      │ Transform  │ Status │
# ──────────────────────────────────────────────────────────────
# │ Temp_Zone1   │ → │ Gateway_Temp    │ ×1.0 +0    │ ● ON  │
# │ Pressure_T1  │ → │ Gateway_Press   │ ×0.069 +0  │ ● ON  │
# ──────────────────────────────────────────────────────────────
```

**igp mapping create**
Crea un mapeo.

```bash
igp mapping create \
  --input tag-input-123 \
  --output plc-output-456 \
  --name Gateway_Temperature \
  --address "ns=1;s=Temperature" \
  --scale 1.0 \
  --offset 0.0
```

**Ejemplo: Conversión °C a °F**

```bash
igp mapping create \
  --input tag-temp-celsius \
  --output plc-gateway \
  --name Temperature_F \
  --address "ns=1;s=TempF" \
  --scale 1.8 \
  --offset 32
```

**igp mapping delete <id>**
Elimina un mapeo.

#### Logs

**igp logs [-n N] [--level LEVEL]**
Muestra logs recientes.

```bash
# Últimos 50 (por defecto)
igp logs

# Últimos 100
igp logs -n 100

# Solo errores
igp logs --level ERROR

# Solo warnings
igp logs --level WARN
```

**igp logs -f**
Sigue logs en tiempo real (como `tail -f`).

```bash
igp logs -f

# Output (streaming):
# 📜 Following logs (Press Ctrl+C to stop)
#
# Connected
#
# 10:30:45 [INFO ] PLCSimulator     : Started Siemens S7-1500
# 10:30:46 [INFO ] NormalizationEng : Processed tag Temperature
# 10:30:47 [WARN ] PLCEmulator      : Output PLC not started
# 10:30:48 [ERROR] TagService       : Tag not found
# ...
```

#### Autenticación

**igp login**
Login interactivo.

```bash
igp login

# Prompts:
# 🔐 Login to Industrial Gateway Platform
#
# ? Username: admin
# ? Password: ********
#
# ✓ Login successful
#
# User: admin
# Role: admin
```

**igp logout**
Cierra sesión.

```bash
igp logout
# ✓ Logged out successfully
```

### Configuración del CLI

**Ubicación:** `~/.industrial-gateway/`

**Archivos:**
- `config.json` - Configuración (API URL)
- `token` - Token JWT de autenticación

**Cambiar API URL:**

```bash
# Variable de entorno (temporal)
export IGP_API_URL=http://192.168.1.100:3000/api
igp status

# Editar config (permanente)
nano ~/.industrial-gateway/config.json
# Cambiar "apiUrl": "http://192.168.1.100:3000/api"
```

---

## TUI - Interfaz de Terminal

### Lanzar el TUI

```bash
igp tui
```

### Layout del TUI

```
╔═══════════════════════════════════════════════════════════╗
║     🏭 INDUSTRIAL GATEWAY PLATFORM - TERMINAL UI          ║
╚═══════════════════════════════════════════════════════════╝

┌─ INPUT PLCs ──┐ ┌─ OUTPUT PLCs ─┐ ┌─ ACTIVE MAPPINGS ┐ ┌─ TOTAL TAGS ─┐
│      3        │ │      1        │ │        2         │ │      7       │
└───────────────┘ └───────────────┘ └──────────────────┘ └──────────────┘

┌─ PLCs ────────────────────────────┐ ┌─ Tag Values (Real-time) ─────────┐
│ Name            Brand    Protocol │ │                                  │
│ ───────────────────────────────── │ │  100 ┤                 ┌─Legend─┐│
│ Siemens S7      SIEMENS  S7COMM   │ │   90 ┤        ┌────    │ Temp   ││
│ Allen-Bradley   ALLEN_B  ETHERNET │ │   80 ┤    ┌───┘        │ Press  ││
│ Schneider       SCHNEID  MODBUS   │ │   70 ┤────┘            │ Flow   ││
│                 ● ON              │ │   60 └─────────────────────────  ││
└────────────────────────────────────┘ └──────────────────────────────────┘

┌─ System Logs ──────────────────────────────────────────────────────────┐
│ [INFO] PLCSimulator: Started simulator Siemens S7-1500                │
│ [INFO] NormalizationEngine: Processed tag Temperature_Zone1            │
│ [INFO] PLCEmulator: OPC UA server started on port 4840                │
│ [WARN] TagService: Tag quality degraded                               │
└────────────────────────────────────────────────────────────────────────┘

 Status: ● Connected | Press q to quit, r to refresh
```

### Componentes del TUI

#### 1. Header
- Título del sistema
- Versión (implícita)

#### 2. Paneles de Estadísticas (4 tarjetas)
- **INPUT PLCs:** Contador de PLCs simulados
- **OUTPUT PLCs:** Contador de emuladores activos
- **ACTIVE MAPPINGS:** Mapeos habilitados
- **TOTAL TAGS:** Suma de todos los tags

Color-coded:
- Verde: INPUT PLCs
- Azul: OUTPUT PLCs
- Magenta: Mappings
- Amarillo: Tags

#### 3. Tabla de PLCs
- Lista scrollable de todos los PLCs
- Columnas: Name, Brand, Protocol, Status
- Estado: ● ON (verde) / ○ OFF (gris)
- Auto-refresh cada 10 segundos

#### 4. Gráfica de Tags en Tiempo Real
- Muestra hasta 3 tags simultáneamente
- Tipo: Línea (line chart ASCII)
- Eje X: Tiempo (últimos 20 puntos)
- Eje Y: Valor del tag
- Leyenda con colores por tag
- Actualización: Real-time via WebSocket

#### 5. Logs del Sistema
- Stream de logs en tiempo real
- Color-coded por nivel:
  - Verde: [INFO]
  - Amarillo: [WARN]
  - Rojo: [ERROR]
- Auto-scroll
- Muestra últimos 100 logs

#### 6. Barra de Estado
- Indicador de conexión WebSocket
  - ● Connected (verde)
  - ○ Disconnected (rojo)
- Atajos de teclado

### Controles de Teclado

| Tecla | Acción |
|-------|--------|
| `q` | Salir del TUI |
| `ESC` | Salir del TUI |
| `Ctrl+C` | Salir del TUI |
| `r` | Refrescar datos manualmente |

### Características Técnicas

**Actualización de Datos:**
- Polling: Cada 10 segundos (tabla PLCs, stats)
- WebSocket: Tiempo real (tags, logs)

**Conexión WebSocket:**
- Auto-reconexión si se pierde
- Indicador visual de estado
- Buffer de logs local

**Rendimiento:**
- Optimizado para terminales de 80x24 mínimo
- Funciona en SSH con latencia alta
- Compatible con tmux/screen

**Compatibilidad de Terminales:**
- ✅ gnome-terminal
- ✅ konsole
- ✅ xterm
- ✅ iTerm2 (macOS)
- ✅ Windows Terminal (WSL)
- ✅ tmux
- ✅ screen

---

## Configuración de PLCs

### PLCs de Entrada (INPUT)

Los PLCs INPUT son **simuladores** que generan datos sintéticos para pruebas y demos.

#### Marcas y Protocolos Soportados

| Marca | Protocolo | Descripción |
|-------|-----------|-------------|
| **Siemens** | S7Comm | S7-300, S7-400, S7-1200, S7-1500 |
| **Allen-Bradley** | EtherNet/IP (CIP) | ControlLogix, CompactLogix |
| **Schneider** | Modbus TCP | Modicon M340, M580 |
| **Omron** | FINS | Serie NJ, NX |
| **Generic** | Modbus RTU | PLCs legacy genéricos |

#### Crear PLC Input

**Vía Web:**
1. Dashboard → INPUT PLCs → CREATE PLC
2. Nombre: "Production Line 1"
3. Marca: Siemens
4. Protocolo: S7Comm (auto)
5. CREATE → START

**Vía CLI:**
```bash
igp plc create \
  --name "Production Line 1" \
  --brand SIEMENS \
  --protocol S7COMM \
  --type INPUT
```

**Resultado:**
- PLC creado con ID único
- Sin tags (agregar posteriormente)
- Estado: STOPPED (iniciar manualmente)

#### Agregar Tags a PLC Input

Los tags definen los puntos de datos que el PLC simulará.

**Tipos de Señal:**
- **SINE:** Onda senoidal (temperatura, presión fluctuante)
- **RAMP:** Rampa lineal (contador, nivel creciente)
- **RANDOM:** Valores aleatorios (vibración, ruido)
- **DIGITAL:** ON/OFF binario (sensores, válvulas)

**Parámetros:**
- **name:** Nombre del tag (ej: Temperature_Zone1)
- **address:** Dirección PLC (ej: DB1.DBD0, N7:0, 40001)
- **dataType:** FLOAT, INT, BOOL
- **unit:** Unidad de medida (ej: °C, PSI, RPM)
- **signalType:** SINE, RAMP, RANDOM, DIGITAL
- **frequency:** Frecuencia de oscilación (Hz)
- **amplitude:** Amplitud de la señal
- **offset:** Valor base

**Ejemplo vía CLI:**
```bash
igp tag create \
  --plc plc-siemens-123 \
  --name Temperature_Zone1 \
  --address DB1.DBD0 \
  --type FLOAT \
  --unit °C \
  --signal SINE \
  --frequency 0.5 \
  --amplitude 25 \
  --offset 75

# Genera: 50°C - 100°C en onda senoidal
```

**Ejemplo vía API:**
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plcId": "plc-siemens-123",
    "name": "Pressure_Tank1",
    "address": "DB1.DBD4",
    "dataType": "FLOAT",
    "unit": "PSI",
    "signalType": "SINE",
    "frequency": 0.3,
    "amplitude": 50,
    "offset": 100
  }'
```

#### Iniciar Simulador

Una vez creado el PLC y sus tags:

```bash
# CLI
igp plc start plc-siemens-123

# Web: Click en botón "START"
```

**Qué sucede:**
1. Se inicia un loop de simulación (1 Hz por defecto)
2. Cada tag genera valores según su signalType
3. Valores se almacenan en base de datos
4. Se emiten eventos WebSocket (tag:update)
5. Frontend/TUI muestran valores en tiempo real

### PLCs de Salida (OUTPUT)

Los PLCs OUTPUT son **emuladores** que presentan los datos normalizados como PLCs virtuales.

#### Configuraciones Disponibles

| Configuración | Protocolo | Puerto | Uso |
|---------------|-----------|--------|-----|
| **Allen-Bradley Generic** | OPC UA | 4840 | Dashboards OPC UA (Ignition, etc.) |
| **Siemens Generic** | OPC UA | 4840 | Dashboards OPC UA |
| **Schneider Modicon** | Modbus TCP | 502/5502 | SCADA Modbus |
| **Generic OPC UA PLC** | OPC UA | 4840 | Universal OPC UA |
| **Generic Modbus PLC** | Modbus TCP | 502/5502 | Universal Modbus |

#### Crear PLC Output

**Vía CLI:**
```bash
igp plc create \
  --name "SCADA Gateway" \
  --brand GENERIC \
  --protocol OPCUA \
  --type OUTPUT
```

**Vía Web:**
1. OUTPUT PLCs → CREATE EMULATOR
2. Nombre: "SCADA Gateway"
3. Emulate as: Generic OPC UA PLC
4. CREATE

**Resultado:**
- Emulador creado (sin iniciar)
- Puerto asignado automáticamente (4840 para OPC UA)
- Endpoint generado (ej: opc.tcp://localhost:4840)

#### Iniciar Emulador

```bash
# CLI
igp plc start plc-output-456

# Web: Click "START"
```

**Qué sucede:**

**Para OPC UA:**
1. Se inicia servidor OPC UA (node-opcua)
2. Se crea namespace para el gateway
3. Se crean variables OPC UA para cada mapping
4. Se expone endpoint: `opc.tcp://localhost:4840`
5. Clientes pueden conectarse y leer/escribir tags

**Para Modbus TCP:**
1. Se inicia servidor Modbus TCP
2. Se crean holding registers según mappings
3. Se expone puerto 502 o 5502
4. Clientes Modbus pueden leer registros

#### Conectar Cliente Externo

**OPC UA (Python):**
```python
from opcua import Client

client = Client("opc.tcp://localhost:4840")
client.connect()

# Leer tag
temp_node = client.get_node("ns=1;s=Gateway_Temperature")
temperature = temp_node.get_value()
print(f"Temperatura: {temperature}°C")

client.disconnect()
```

**Modbus TCP (Python):**
```python
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient('localhost', port=5502)
client.connect()

# Leer registros
result = client.read_holding_registers(address=0, count=10)
if not result.isError():
    print(f"Valores: {result.registers}")

client.close()
```

---

## Mapeo de Tags

El mapeo conecta tags de entrada (INPUT) con PLCs de salida (OUTPUT), con transformaciones opcionales.

### Anatomía de un Mapping

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ INPUT TAG   │ ──→ │ TRANSFORM   │ ──→ │ OUTPUT TAG  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ PLC: Siemens│     │ Scale: 1.8  │     │ PLC: Gateway│
│ Tag: Temp_C │     │ Offset: 32  │     │ Tag: Temp_F │
│ Value: 25°C │     │ ────────────│     │ Value: 77°F │
│             │     │ Formula:    │     │ Address:    │
│             │     │ V×1.8+32    │     │ ns=1;s=TempF│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Componentes

1. **Input Tag ID:** Tag fuente (debe existir)
2. **Output PLC ID:** Emulador destino (debe existir)
3. **Output Tag Name:** Nombre del tag en el emulador
4. **Output Address:** Dirección en el protocolo de salida
5. **Scale Factor:** Factor de multiplicación (default: 1.0)
6. **Offset:** Valor a sumar (default: 0.0)
7. **Enabled:** Si el mapeo está activo

### Fórmula de Transformación

```
output_value = (input_value × scale_factor) + offset
```

### Ejemplos de Transformaciones

#### 1. Sin Transformación (1:1)
```
Input: 75.5
Scale: 1.0
Offset: 0.0
Output: 75.5
```

#### 2. Conversión °C a °F
```
Input: 25°C
Scale: 1.8
Offset: 32
Output: 77°F

Fórmula: (25 × 1.8) + 32 = 77
```

#### 3. Conversión PSI a Bar
```
Input: 100 PSI
Scale: 0.0689476
Offset: 0
Output: 6.89476 bar

Fórmula: 100 × 0.0689476 = 6.89476
```

#### 4. Normalización 0-100%
```
Input: 50-150 (rango real)
Queremos: 0-100%

Scale: 1.0
Offset: -50
Luego escalar: × (100/100) = 1

Mejor: Pre-procesar o usar dos mappings
```

#### 5. Inversión de Valor
```
Input: 0-100
Queremos: 100-0

Scale: -1.0
Offset: 100

Ejemplo: (50 × -1.0) + 100 = 50 (coincide)
        (0 × -1.0) + 100 = 100
        (100 × -1.0) + 100 = 0
```

### Crear Mapping

**Vía Web:**
```
1. MAPPINGS → CREATE MAPPING
2. Input PLC: Siemens S7-1500
3. Input Tag: Temperature_Zone1
4. Transform:
   - Scale Factor: 1.8
   - Offset: 32
5. Output PLC: SCADA Gateway
6. Output Tag Name: Temp_Zone1_F
7. Output Address: ns=1;s=TZ1_F
8. CREATE MAPPING
```

**Vía CLI:**
```bash
igp mapping create \
  --input tag-temp-celsius-123 \
  --output plc-gateway-456 \
  --name Temp_Zone1_F \
  --address "ns=1;s=TZ1_F" \
  --scale 1.8 \
  --offset 32
```

**Vía API:**
```bash
curl -X POST http://localhost:3000/api/mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputTagId": "tag-temp-celsius-123",
    "outputPlcId": "plc-gateway-456",
    "outputTagName": "Temp_Zone1_F",
    "outputAddress": "ns=1;s=TZ1_F",
    "scaleFactor": 1.8,
    "offset": 32,
    "enabled": true
  }'
```

### Flujo de Datos

```
1. PLC Input actualiza tag (cada 1s)
   └─> tag:update event emitido

2. Normalization Engine recibe event
   └─> Busca mappings para ese tag

3. Por cada mapping:
   └─> Aplica transformación
   └─> Emite output:write event

4. PLC Output Manager recibe output:write
   └─> Actualiza variable en emulador
   └─> Cliente externo lee nuevo valor
```

### Habilitar/Deshabilitar Mappings

**Temporal (sin eliminar):**

```bash
# Vía API (no hay comando CLI directo aún)
curl -X PUT http://localhost:3000/api/mappings/mapping-123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**Eliminar definitivamente:**

```bash
# CLI
igp mapping delete mapping-123

# Web: Click botón DELETE en la lista
```

---

## Protocolos Soportados

### Protocolos de Entrada (Simulados)

#### 1. S7Comm (Siemens)

**PLCs Compatibles:**
- S7-300
- S7-400
- S7-1200
- S7-1500

**Direccionamiento:**
- `DB1.DBD0` - Data Block 1, Double Word 0
- `DB10.DBD100` - Data Block 10, DW 100
- `M0.0` - Marca (Memory) bit 0
- `I0.0` - Input bit 0
- `Q0.0` - Output bit 0

**Características Simuladas:**
- Lectura/escritura de DBs
- Data types: BOOL, BYTE, WORD, DWORD, INT, REAL
- Actualización cíclica

#### 2. EtherNet/IP (Allen-Bradley)

**PLCs Compatibles:**
- ControlLogix
- CompactLogix
- MicroLogix (limitado)

**Direccionamiento:**
- `N7:0` - Integer file, word 0
- `F8:0` - Float file, word 0
- `B3:0/0` - Bit file, bit 0
- `Controller.Tag` - Controller-scoped tag

**Características Simuladas:**
- Lectura de tags
- CIP protocol emulation
- Explicit messaging

#### 3. Modbus TCP (Schneider)

**PLCs Compatibles:**
- Modicon M340
- Modicon M580
- Cualquier dispositivo Modbus TCP

**Direccionamiento:**
- `40001` - Holding register 1
- `30001` - Input register 1
- `00001` - Coil 1
- `10001` - Discrete input 1

**Características Simuladas:**
- Function codes: 01, 02, 03, 04, 05, 06, 15, 16
- Holding registers (R/W)
- Input registers (RO)

#### 4. FINS (Omron)

**PLCs Compatibles:**
- Serie NJ
- Serie NX
- Serie CJ

**Direccionamiento:**
- `D0` - Data Memory
- `W0` - Work area
- `H0` - Holding relay

**Características Simuladas:**
- FINS over TCP
- Memory area read/write
- Basic commands

#### 5. Modbus RTU (Generic)

**Dispositivos:**
- PLCs legacy
- RTUs
- Controladores industriales

**Características:**
- Simulación virtual (no puerto serial real)
- Mismo addressing que Modbus TCP
- Útil para pruebas

### Protocolos de Salida (Emulados)

#### 1. OPC UA

**Especificación:** IEC 62541

**Implementación:** node-opcua

**Características:**
- OPC UA Server completo
- Security: None, Sign, SignAndEncrypt (configurable)
- Discovery service
- Subscription support
- Read/Write/Monitor

**Estructura de Namespace:**
```
Root
└── Objects
    └── [PLC Name]
        ├── Tag1 (Variable)
        ├── Tag2 (Variable)
        └── Tag3 (Variable)
```

**Endpoint:**
```
opc.tcp://localhost:4840/UA/[PLCName]
```

**Node IDs:**
```
ns=1;s=TagName
```

**Ejemplo de Conexión (UaExpert):**
```
1. Add Server: opc.tcp://localhost:4840
2. Connect
3. Browse: Objects → [PLC Name]
4. Drag tags to Data Access View
5. Subscribe
```

#### 2. Modbus TCP

**Especificación:** Modbus Application Protocol V1.1b3

**Implementación:** modbus-serial (emulación)

**Function Codes Soportados:**
- `03` - Read Holding Registers
- `06` - Write Single Register
- `16` - Write Multiple Registers

**Registros:**
- Holding registers: 40001 - 49999
- Address mapping configurable en cada mapping

**Ejemplo de Conexión (pymodbus):**
```python
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient('localhost', port=5502)
client.connect()

# Leer 10 registros desde 40001
result = client.read_holding_registers(0, 10, unit=1)
print(result.registers)

client.close()
```

**Configuración de Puerto:**
- Default: 5502 (para no requerir root en Linux)
- Configurable en: `/etc/industrial-gateway.env`

---

## API REST

### Base URL

```
http://localhost:3000/api
```

### Autenticación

**Método:** JWT (JSON Web Token)

**Header:**
```
Authorization: Bearer <token>
```

**Obtener Token:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "username": "admin",
    "role": "admin"
  }
}
```

**Usar Token:**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/plcs \
  -H "Authorization: Bearer $TOKEN"
```

### Endpoints Principales

#### Health Check

**GET** `/health`

No requiere autenticación.

```bash
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

#### Autenticación

**POST** `/api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**GET** `/api/auth/me`

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### PLCs

**GET** `/api/plcs` - Listar todos

```bash
curl -X GET http://localhost:3000/api/plcs \
  -H "Authorization: Bearer $TOKEN"

# Query params:
# ?type=INPUT
# ?type=OUTPUT
```

**GET** `/api/plcs/:id` - Obtener uno

```bash
curl -X GET http://localhost:3000/api/plcs/plc-123 \
  -H "Authorization: Bearer $TOKEN"
```

**POST** `/api/plcs` - Crear

```bash
curl -X POST http://localhost:3000/api/plcs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Line 1",
    "brand": "SIEMENS",
    "protocol": "S7COMM",
    "type": "INPUT"
  }'
```

**PUT** `/api/plcs/:id` - Actualizar

```bash
curl -X PUT http://localhost:3000/api/plcs/plc-123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Line 1 Updated"
  }'
```

**DELETE** `/api/plcs/:id` - Eliminar

```bash
curl -X DELETE http://localhost:3000/api/plcs/plc-123 \
  -H "Authorization: Bearer $TOKEN"
```

**POST** `/api/plcs/:id/start` - Iniciar

```bash
curl -X POST http://localhost:3000/api/plcs/plc-123/start \
  -H "Authorization: Bearer $TOKEN"
```

**POST** `/api/plcs/:id/stop` - Detener

```bash
curl -X POST http://localhost:3000/api/plcs/plc-123/stop \
  -H "Authorization: Bearer $TOKEN"
```

#### Tags

**GET** `/api/tags/plc/:plcId` - Listar tags de un PLC

```bash
curl -X GET http://localhost:3000/api/tags/plc/plc-123 \
  -H "Authorization: Bearer $TOKEN"
```

**POST** `/api/tags` - Crear tag

```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plcId": "plc-123",
    "name": "Temperature_Zone1",
    "address": "DB1.DBD0",
    "dataType": "FLOAT",
    "unit": "°C",
    "signalType": "SINE",
    "frequency": 0.5,
    "amplitude": 25,
    "offset": 75
  }'
```

**PUT** `/api/tags/:id` - Actualizar tag

**DELETE** `/api/tags/:id` - Eliminar tag

**POST** `/api/tags/bulk` - Crear múltiples tags

```bash
curl -X POST http://localhost:3000/api/tags/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "plcId": "plc-123",
      "name": "Tag1",
      "address": "DB1.DBD0",
      "dataType": "FLOAT"
    },
    {
      "plcId": "plc-123",
      "name": "Tag2",
      "address": "DB1.DBD4",
      "dataType": "FLOAT"
    }
  ]'
```

#### Mappings

**GET** `/api/mappings` - Listar todos

```bash
curl -X GET http://localhost:3000/api/mappings \
  -H "Authorization: Bearer $TOKEN"
```

**GET** `/api/mappings/output/:plcId` - Mappings de un PLC output

```bash
curl -X GET http://localhost:3000/api/mappings/output/plc-456 \
  -H "Authorization: Bearer $TOKEN"
```

**POST** `/api/mappings` - Crear mapping

```bash
curl -X POST http://localhost:3000/api/mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputTagId": "tag-123",
    "outputPlcId": "plc-456",
    "outputTagName": "Gateway_Temperature",
    "outputAddress": "ns=1;s=Temperature",
    "scaleFactor": 1.0,
    "offset": 0.0,
    "enabled": true
  }'
```

**PUT** `/api/mappings/:id` - Actualizar mapping

**DELETE** `/api/mappings/:id` - Eliminar mapping

#### Logs

**GET** `/api/logs` - Obtener logs

```bash
curl -X GET http://localhost:3000/api/logs \
  -H "Authorization: Bearer $TOKEN"

# Query params:
# ?limit=100
# ?level=ERROR
# ?source=PLCSimulator
```

**DELETE** `/api/logs` - Limpiar logs antiguos (admin only)

```bash
curl -X DELETE http://localhost:3000/api/logs \
  -H "Authorization: Bearer $TOKEN"
```

### WebSocket Events

**Conexión:**

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');
});
```

**Eventos Disponibles:**

**1. tag:update**

Emitido cada vez que un tag se actualiza.

```javascript
socket.on('tag:update', (data) => {
  console.log(data);
  // {
  //   plcId: 'plc-123',
  //   tagId: 'tag-456',
  //   tagName: 'Temperature_Zone1',
  //   value: 75.34,
  //   quality: 'GOOD',
  //   timestamp: '2026-01-15T10:30:00Z'
  // }
});
```

**2. system:log**

Logs del sistema en tiempo real.

```javascript
socket.on('system:log', (log) => {
  console.log(log);
  // {
  //   level: 'INFO',
  //   source: 'PLCSimulator',
  //   message: 'Started simulator',
  //   timestamp: '2026-01-15T10:30:00Z'
  // }
});
```

**3. plc:status**

Cambios de estado de PLCs.

```javascript
socket.on('plc:status', (data) => {
  console.log(data);
  // {
  //   plcId: 'plc-123',
  //   plcName: 'Siemens S7-1500',
  //   status: 'running',
  //   message: 'Simulator started'
  // }
});
```

---

## Seguridad

### Security Hardening

#### 1. Autenticación JWT

**Configuración:**

```bash
# Generar secreto seguro
openssl rand -hex 32

# Editar /etc/industrial-gateway.env
JWT_SECRET="tu-secreto-generado-aqui"

# Reiniciar servicio
sudo systemctl restart industrial-gateway
```

**Buenas Prácticas:**
- ✅ Cambiar `JWT_SECRET` en producción
- ✅ Usar secretos de 256 bits mínimo
- ✅ Rotar secretos periódicamente
- ✅ No compartir el archivo `.env`

#### 2. Cambiar Contraseñas por Defecto

**Primera configuración:**

```bash
# Login
igp login
# Username: admin
# Password: admin123

# Vía API (cambiar contraseña no implementado en v1.0)
# Workaround: Acceder a DB directamente
```

**Acceso directo a DB:**

```bash
sudo sqlite3 /var/lib/industrial-gateway/production.db

# Ver usuarios
SELECT username, role FROM User;

# Cambiar contraseña (hash con bcrypt)
# Requiere generar hash manualmente
```

**Mejor práctica:** Crear nuevos usuarios y eliminar defaults.

#### 3. Firewall

**Ubuntu/Debian (ufw):**

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir puertos del gateway
sudo ufw allow 3000/tcp comment 'Industrial Gateway API'
sudo ufw allow 4840/tcp comment 'OPC UA'
sudo ufw allow 502/tcp comment 'Modbus TCP'

# Rechazar todo lo demás (default)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Ver estado
sudo ufw status verbose
```

**Red Hat/CentOS (firewalld):**

```bash
# Ya configurado por el instalador
sudo firewall-cmd --list-all

# Agregar reglas manualmente
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=4840/tcp
sudo firewall-cmd --permanent --add-port=502/tcp
sudo firewall-cmd --reload
```

#### 4. SELinux (Red Hat)

**Verificar estado:**

```bash
getenforce
# Output: Enforcing | Permissive | Disabled
```

**Configurar contextos:**

```bash
# Aplicar contexto correcto al ejecutable
sudo semanage fcontext -a -t bin_t "/opt/industrial-gateway/packages/backend/dist/index.js"
sudo restorecon -v "/opt/industrial-gateway/packages/backend/dist/index.js"

# Permitir conexiones de red
sudo setsebool -P httpd_can_network_connect 1
```

**Ver violaciones:**

```bash
sudo ausearch -m avc -ts recent
```

#### 5. Systemd Security

El servicio systemd incluye directivas de seguridad:

```ini
[Service]
# No permitir nuevos privilegios
NoNewPrivileges=true

# Directorio temporal privado
PrivateTmp=true

# Proteger sistema de archivos
ProtectSystem=strict
ProtectHome=true

# Solo escritura en directorio de datos
ReadWritePaths=/var/lib/industrial-gateway
```

#### 6. SSL/TLS (Recomendado para Producción)

**Opción 1: Reverse Proxy con Nginx**

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Obtener certificado (Let's Encrypt)
sudo certbot --nginx -d gateway.tuempresa.com

# Nginx config
sudo nano /etc/nginx/sites-available/industrial-gateway
```

```nginx
server {
    listen 443 ssl;
    server_name gateway.tuempresa.com;

    ssl_certificate /etc/letsencrypt/live/gateway.tuempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gateway.tuempresa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Opción 2: OPC UA con Security**

Configurar en código (no implementado en v1.0, roadmap).

#### 7. Restricciones de Red

**Limitar acceso por IP:**

```bash
# ufw
sudo ufw allow from 192.168.1.0/24 to any port 3000

# firewalld
sudo firewall-cmd --permanent --add-rich-rule='
  rule family="ipv4"
  source address="192.168.1.0/24"
  port protocol="tcp" port="3000" accept'
```

#### 8. Rate Limiting

**Nginx (si se usa):**

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3000;
}
```

#### 9. Logs y Auditoría

**Habilitar logging completo:**

```bash
# Ver logs en tiempo real
journalctl -u industrial-gateway -f

# Logs de autenticación
grep "login" /var/log/syslog

# Analizar actividad
journalctl -u industrial-gateway --since "1 hour ago" | grep ERROR
```

**Rotate logs:**

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/industrial-gateway
```

```
/var/log/industrial-gateway/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

#### 10. Backups

**Backup de base de datos:**

```bash
# Crear backup diario
sudo crontab -e

# Agregar línea:
0 2 * * * cp /var/lib/industrial-gateway/production.db /backups/igp-$(date +\%Y\%m\%d).db
```

**Backup completo:**

```bash
#!/bin/bash
# /usr/local/bin/backup-igp.sh

BACKUP_DIR="/backups/industrial-gateway"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# DB
cp /var/lib/industrial-gateway/production.db $BACKUP_DIR/db-$DATE.db

# Config
cp /etc/industrial-gateway.env $BACKUP_DIR/env-$DATE

# Code (opcional)
tar -czf $BACKUP_DIR/code-$DATE.tar.gz /opt/industrial-gateway

# Limpiar backups > 30 días
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completado: $DATE"
```

---

## Monitoreo y Logs

### Systemd Journal

**Ver logs en tiempo real:**

```bash
journalctl -u industrial-gateway -f
```

**Logs de las últimas 24 horas:**

```bash
journalctl -u industrial-gateway --since "24 hours ago"
```

**Logs de un rango de tiempo:**

```bash
journalctl -u industrial-gateway --since "2026-01-15 10:00:00" --until "2026-01-15 12:00:00"
```

**Solo errores:**

```bash
journalctl -u industrial-gateway -p err
```

**Exportar logs:**

```bash
journalctl -u industrial-gateway --since "1 week ago" > gateway-logs.txt
```

### Logs de la Aplicación

**Ubicación:** Se envían a journald via stdout/stderr

**Niveles:**
- `INFO` - Operaciones normales
- `WARN` - Advertencias no críticas
- `ERROR` - Errores que requieren atención

**Vía CLI:**

```bash
# Últimos 100 logs
igp logs -n 100

# Solo errores
igp logs --level ERROR

# Seguir en tiempo real
igp logs -f
```

**Vía API:**

```bash
curl -X GET http://localhost:3000/api/logs?limit=100 \
  -H "Authorization: Bearer $TOKEN"
```

### Monitoreo de Recursos

**Ver uso de CPU/RAM:**

```bash
# htop
sudo htop

# Filtrar por proceso
ps aux | grep node

# Systemd status
systemctl status industrial-gateway
```

**Prometheus + Grafana (Avanzado):**

Exportar métricas (no implementado en v1.0, roadmap):
- Número de PLCs activos
- Tags procesados/segundo
- Latencia de mapeos
- Conexiones OPC UA activas
- Errores por minuto

### Health Checks

**Endpoint de health:**

```bash
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

**Integración con Nagios/Zabbix:**

```bash
#!/bin/bash
# /usr/lib/nagios/plugins/check_igp_health

RESPONSE=$(curl -s http://localhost:3000/health)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" == "ok" ]; then
    echo "OK - Industrial Gateway is healthy"
    exit 0
else
    echo "CRITICAL - Gateway is down"
    exit 2
fi
```

### Alertas

**Ejemplo de alerta por email (cron):**

```bash
# /usr/local/bin/check-igp-and-alert.sh

#!/bin/bash
if ! systemctl is-active --quiet industrial-gateway; then
    echo "Gateway is down!" | mail -s "ALERT: Gateway Down" admin@empresa.com
fi
```

```bash
# Crontab (cada 5 minutos)
*/5 * * * * /usr/local/bin/check-igp-and-alert.sh
```

---

## Troubleshooting

### Problemas Comunes

#### 1. Servicio no inicia

**Síntomas:**
```bash
systemctl status industrial-gateway
# Estado: failed
```

**Diagnóstico:**

```bash
# Ver logs completos
journalctl -u industrial-gateway -n 100 --no-pager

# Errores comunes:
# - Puerto ocupado
# - Base de datos bloqueada
# - Permisos incorrectos
# - Node.js no encontrado
```

**Soluciones:**

**Puerto ocupado:**
```bash
# Ver qué proceso usa el puerto
sudo netstat -tulpn | grep :3000

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en /etc/industrial-gateway.env
PORT=3001
```

**Base de datos bloqueada:**
```bash
sudo systemctl stop industrial-gateway
sudo rm /var/lib/industrial-gateway/production.db-journal
sudo systemctl start industrial-gateway
```

**Permisos:**
```bash
sudo chown -R industrial:industrial /opt/industrial-gateway
sudo chown -R industrial:industrial /var/lib/industrial-gateway
```

#### 2. CLI no funciona

**Síntomas:**
```bash
igp status
# bash: igp: command not found
```

**Solución:**

```bash
# Verificar symlink
ls -la /usr/local/bin/igp

# Recrear symlink
sudo ln -sf /opt/industrial-gateway/packages/cli/dist/index.js /usr/local/bin/igp
sudo chmod +x /usr/local/bin/igp

# Verificar PATH
echo $PATH | grep /usr/local/bin
```

#### 3. TUI no muestra correctamente

**Síntomas:**
- Caracteres extraños
- Layout roto
- Sin colores

**Soluciones:**

```bash
# Verificar TERM
echo $TERM
# Debe ser: xterm-256color, screen-256color, etc.

# Configurar TERM
export TERM=xterm-256color

# Permanente
echo 'export TERM=xterm-256color' >> ~/.bashrc

# Probar terminal diferente
# gnome-terminal, konsole, xterm, etc.
```

#### 4. Conexión OPC UA falla

**Síntomas:**
- Cliente no puede conectar
- Timeout
- "BadConnectionClosed"

**Diagnóstico:**

```bash
# Verificar que emulador esté corriendo
igp plc list --type OUTPUT
# Debe mostrar ● RUNNING

# Verificar puerto abierto
sudo netstat -tulpn | grep :4840

# Verificar firewall
sudo ufw status | grep 4840
sudo firewall-cmd --list-ports | grep 4840
```

**Soluciones:**

```bash
# Iniciar emulador
igp plc start <output-plc-id>

# Abrir puerto
sudo ufw allow 4840/tcp
sudo firewall-cmd --permanent --add-port=4840/tcp && sudo firewall-cmd --reload

# Probar con herramienta
# UaExpert, OPC UA Client, etc.
```

#### 5. Mappings no actualizan valores

**Síntomas:**
- Input PLC funcionando
- Output PLC funcionando
- Pero valores no se transfieren

**Diagnóstico:**

```bash
# Ver mappings
igp mapping list

# Verificar que esté enabled
# Status debe ser: ● ON

# Ver logs
igp logs -f | grep Normalization
```

**Soluciones:**

```bash
# Verificar que ambos PLCs estén running
igp plc list

# Iniciar PLCs si están detenidos
igp plc start <input-id>
igp plc start <output-id>

# Verificar que mapping existe y está enabled
# Vía API:
curl http://localhost:3000/api/mappings -H "Authorization: Bearer $TOKEN"

# Recrear mapping si es necesario
igp mapping delete <mapping-id>
igp mapping create ...
```

#### 6. Alta latencia

**Síntomas:**
- Tags tardan > 1s en actualizar
- TUI lento
- API slow response

**Diagnóstico:**

```bash
# Ver uso de CPU/RAM
htop

# Ver carga del sistema
uptime

# Número de tags
igp status
# Verificar Total Tags
```

**Soluciones:**

```bash
# Reducir frecuencia de simuladores
# Editar tags en DB (no hay UI para esto en v1.0)

# Aumentar recursos del servidor
# Más RAM, más CPU

# Reducir número de tags
# Eliminar tags innecesarios

# Usar múltiples instancias
# Dividir PLCs en varios gateways
```

#### 7. WebSocket desconectado

**Síntomas:**
- Web UI: "○ DISCONNECTED"
- TUI: "○ Disconnected"

**Soluciones:**

```bash
# Verificar que backend esté corriendo
systemctl status industrial-gateway

# Verificar puerto 3000
sudo netstat -tulpn | grep :3000

# Verificar firewall
sudo ufw status | grep 3000

# Reiniciar servicio
sudo systemctl restart industrial-gateway

# En cliente (browser/TUI)
# Refrescar página / relanzar TUI
```

#### 8. Base de datos corrupta

**Síntomas:**
```
Error: SQLITE_CORRUPT
Error: database disk image is malformed
```

**Solución (última opción):**

```bash
# CUIDADO: Esto borra todos los datos

# 1. Detener servicio
sudo systemctl stop industrial-gateway

# 2. Backup (por si acaso)
sudo cp /var/lib/industrial-gateway/production.db /root/backup-corrupted.db

# 3. Eliminar DB
sudo rm /var/lib/industrial-gateway/production.db
sudo rm /var/lib/industrial-gateway/production.db-journal

# 4. Recrear DB
cd /opt/industrial-gateway/packages/backend
sudo -u industrial npx prisma db push
sudo -u industrial npx tsx src/database/seed.ts

# 5. Reiniciar
sudo systemctl start industrial-gateway
```

---

## Scripts de Demo

### Demo Script 1: Setup Básico

```bash
#!/bin/bash
# demo-basic-setup.sh
# Crea configuración básica: 2 PLCs input, 1 output, 2 mappings

set -e

echo "=== Industrial Gateway Platform - Demo Setup ==="
echo

# Login
echo "Logging in..."
igp login << EOF
admin
admin123
EOF

echo
echo "Creating INPUT PLCs..."

# Crear PLC Siemens
echo "- Siemens S7-1500..."
igp plc create \
  --name "Siemens S7-1500 (Demo)" \
  --brand SIEMENS \
  --protocol S7COMM \
  --type INPUT

# Crear PLC Allen-Bradley
echo "- Allen-Bradley ControlLogix..."
igp plc create \
  --name "Allen-Bradley ControlLogix (Demo)" \
  --brand ALLEN_BRADLEY \
  --protocol ETHERNET_IP \
  --type INPUT

echo
echo "Creating OUTPUT PLC..."

# Crear emulador OPC UA
igp plc create \
  --name "OPC UA Gateway (Demo)" \
  --brand GENERIC \
  --protocol OPCUA \
  --type OUTPUT

echo
echo "Starting PLCs..."

# Listar y obtener IDs
PLC_LIST=$(igp plc list)
echo "$PLC_LIST"

echo
echo "=== Setup Complete ==="
echo
echo "Next steps:"
echo "1. Create tags for input PLCs"
echo "2. Start all PLCs with: igp plc start <id>"
echo "3. Create mappings"
echo "4. Launch TUI: igp tui"
```

### Demo Script 2: Full Automation

```bash
#!/bin/bash
# demo-full-automation.sh
# Setup completo automatizado con tags y mappings

set -e

API="http://localhost:3000/api"

echo "=== Full Automation Demo ==="
echo

# Login y obtener token
echo "Authenticating..."
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

echo "Token: ${TOKEN:0:20}..."
echo

# Crear PLC Input
echo "Creating Siemens PLC..."
SIEMENS_ID=$(curl -s -X POST $API/plcs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Siemens Production Line",
    "brand": "SIEMENS",
    "protocol": "S7COMM",
    "type": "INPUT"
  }' | jq -r '.id')

echo "Siemens PLC ID: $SIEMENS_ID"
echo

# Crear tags para Siemens
echo "Creating tags..."
TEMP_TAG_ID=$(curl -s -X POST $API/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"plcId\": \"$SIEMENS_ID\",
    \"name\": \"Temperature_Zone1\",
    \"address\": \"DB1.DBD0\",
    \"dataType\": \"FLOAT\",
    \"unit\": \"°C\",
    \"signalType\": \"SINE\",
    \"frequency\": 0.5,
    \"amplitude\": 25,
    \"offset\": 75
  }" | jq -r '.id')

echo "Temperature Tag ID: $TEMP_TAG_ID"

PRESS_TAG_ID=$(curl -s -X POST $API/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"plcId\": \"$SIEMENS_ID\",
    \"name\": \"Pressure_Tank1\",
    \"address\": \"DB1.DBD4\",
    \"dataType\": \"FLOAT\",
    \"unit\": \"PSI\",
    \"signalType\": \"SINE\",
    \"frequency\": 0.3,
    \"amplitude\": 50,
    \"offset\": 100
  }" | jq -r '.id')

echo "Pressure Tag ID: $PRESS_TAG_ID"
echo

# Crear PLC Output
echo "Creating OPC UA Gateway..."
GATEWAY_ID=$(curl -s -X POST $API/plcs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OPC UA Gateway",
    "brand": "GENERIC",
    "protocol": "OPCUA",
    "type": "OUTPUT",
    "port": 4840
  }' | jq -r '.id')

echo "Gateway ID: $GATEWAY_ID"
echo

# Crear mappings
echo "Creating mappings..."

# Mapping 1: Temperature
curl -s -X POST $API/mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"inputTagId\": \"$TEMP_TAG_ID\",
    \"outputPlcId\": \"$GATEWAY_ID\",
    \"outputTagName\": \"Gateway_Temperature\",
    \"outputAddress\": \"ns=1;s=Temperature\",
    \"scaleFactor\": 1.0,
    \"offset\": 0.0
  }" > /dev/null

echo "✓ Temperature mapping created"

# Mapping 2: Pressure (PSI → bar)
curl -s -X POST $API/mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"inputTagId\": \"$PRESS_TAG_ID\",
    \"outputPlcId\": \"$GATEWAY_ID\",
    \"outputTagName\": \"Gateway_Pressure_Bar\",
    \"outputAddress\": \"ns=1;s=Pressure\",
    \"scaleFactor\": 0.0689476,
    \"offset\": 0.0
  }" > /dev/null

echo "✓ Pressure mapping created (PSI → bar)"
echo

# Iniciar PLCs
echo "Starting PLCs..."
curl -s -X POST $API/plcs/$SIEMENS_ID/start \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✓ Siemens started"

curl -s -X POST $API/plcs/$GATEWAY_ID/start \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✓ Gateway started"
echo

echo "=== Setup Complete ==="
echo
echo "OPC UA Endpoint: opc.tcp://localhost:4840"
echo
echo "Test with OPC UA client or:"
echo "  igp tui"
echo
```

### Demo Script 3: Stress Test

```bash
#!/bin/bash
# demo-stress-test.sh
# Crea múltiples PLCs y tags para prueba de carga

set -e

NUM_PLCS=10
TAGS_PER_PLC=10

API="http://localhost:3000/api"

echo "=== Stress Test Demo ==="
echo "Creating $NUM_PLCS PLCs with $TAGS_PER_PLC tags each..."
echo

# Login
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

for i in $(seq 1 $NUM_PLCS); do
  echo "Creating PLC $i/$NUM_PLCS..."

  # Crear PLC
  PLC_ID=$(curl -s -X POST $API/plcs \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test PLC $i\",
      \"brand\": \"SIEMENS\",
      \"protocol\": \"S7COMM\",
      \"type\": \"INPUT\"
    }" | jq -r '.id')

  # Crear tags
  for j in $(seq 1 $TAGS_PER_PLC); do
    curl -s -X POST $API/tags \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"plcId\": \"$PLC_ID\",
        \"name\": \"Tag_${j}\",
        \"address\": \"DB1.DBD${j}\",
        \"dataType\": \"FLOAT\",
        \"signalType\": \"SINE\"
      }" > /dev/null
  done

  # Iniciar PLC
  curl -s -X POST $API/plcs/$PLC_ID/start \
    -H "Authorization: Bearer $TOKEN" > /dev/null

  echo "✓ PLC $i created and started with $TAGS_PER_PLC tags"
done

echo
echo "=== Stress Test Setup Complete ==="
echo "Total: $((NUM_PLCS * TAGS_PER_PLC)) tags running"
echo
echo "Monitor with: igp tui"
echo "or: htop"
```

### Demo Script 4: Limpieza

```bash
#!/bin/bash
# demo-cleanup.sh
# Elimina todos los PLCs creados en demos

set -e

API="http://localhost:3000/api"

echo "=== Cleanup Demo Data ==="
echo

# Login
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# Obtener todos los PLCs
PLCS=$(curl -s -X GET $API/plcs \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[].id')

# Contar
COUNT=$(echo "$PLCS" | wc -l)

echo "Found $COUNT PLCs to delete"
echo

# Eliminar cada uno
for PLC_ID in $PLCS; do
  echo "Deleting $PLC_ID..."
  curl -s -X DELETE $API/plcs/$PLC_ID \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  echo "✓ Deleted"
done

echo
echo "=== Cleanup Complete ==="
echo

# Verificar
REMAINING=$(curl -s -X GET $API/plcs \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length')

echo "Remaining PLCs: $REMAINING"
```

---

## Mejores Prácticas

### Desarrollo

1. **Entornos Separados:**
   - Desarrollo: npm run dev
   - Staging: Docker Compose
   - Producción: Instalación Linux con systemd

2. **Versionado:**
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

3. **Pruebas:**
   - Probar cada mapping individualmente
   - Validar transformaciones con datos conocidos
   - Stress test antes de producción

4. **Documentación:**
   - Documentar cada PLC y su propósito
   - Mantener lista de mappings actualizada
   - Registrar cambios de configuración

### Operación

1. **Backups Regulares:**
   ```bash
   # Diario
   0 2 * * * /usr/local/bin/backup-igp.sh
   ```

2. **Monitoreo Activo:**
   - Health checks cada 5 minutos
   - Alertas por email/SMS si el servicio cae
   - Dashboard de métricas (Grafana)

3. **Mantenimiento:**
   - Rotar logs semanalmente
   - Limpiar logs antiguos mensualmente
   - Actualizar dependencias trimestralmente

4. **Seguridad:**
   - Cambiar contraseñas cada 90 días
   - Rotar JWT_SECRET anualmente
   - Revisar logs de autenticación semanalmente
   - Auditoría de acceso mensual

### Escalamiento

1. **Vertical (Single Server):**
   - Aumentar RAM hasta 16GB
   - SSD NVMe
   - CPU más rápida

2. **Horizontal (Multiple Instances):**
   - Dividir PLCs por sitio/línea
   - Load balancer para API
   - Base de datos centralizada (PostgreSQL)

3. **Alta Disponibilidad:**
   - Cluster de 3+ nodos
   - Shared storage (NFS, GlusterFS)
   - Keepalived para failover
   - HAProxy o Nginx load balancer

### Integración

1. **CI/CD Pipeline:**
   ```yaml
   # .gitlab-ci.yml
   stages:
     - test
     - build
     - deploy

   test:
     script:
       - npm test
       - npm run lint

   build:
     script:
       - docker build -t igp:$CI_COMMIT_TAG .

   deploy:
     script:
       - ssh production "cd /opt/igp && git pull && systemctl restart industrial-gateway"
   ```

2. **Infraestructura como Código:**
   - Terraform para provisioning
   - Ansible para configuración
   - Docker Compose para containers

3. **Observabilidad:**
   - Logs → ELK Stack (Elasticsearch, Logstash, Kibana)
   - Métricas → Prometheus + Grafana
   - Trazas → Jaeger (futuro)

---

## Soporte y Licenciamiento

### Soporte Comunitario

**GitHub:**
- Issues: https://github.com/industrial-gateway/platform/issues
- Discussions: https://github.com/industrial-gateway/platform/discussions
- Wiki: https://github.com/industrial-gateway/platform/wiki

**Foros:**
- Stack Overflow: Tag `industrial-gateway`
- Reddit: r/IndustrialAutomation

**Documentación:**
- Docs oficiales: https://docs.industrial-gateway.io
- Tutoriales: https://tutorials.industrial-gateway.io
- Blog: https://blog.industrial-gateway.io

### Soporte Comercial

**Email:** support@industrial-gateway.io

**Niveles de Soporte:**

| Nivel | Precio | SLA | Canales |
|-------|--------|-----|---------|
| **Community** | Gratis | Best effort | GitHub Issues |
| **Professional** | $99/mes | 24h response | Email, Chat |
| **Enterprise** | $499/mes | 4h response, 24/7 | Email, Chat, Teléfono |
| **Premium** | Custom | 1h response, 24/7 | Dedicado, On-site |

**Incluido en Soporte Comercial:**
- Asistencia técnica directa
- Configuración remota
- Troubleshooting avanzado
- Optimización de rendimiento
- Desarrollo custom (Enterprise+)
- Capacitación on-site (Premium)

### Licenciamiento

**Edición Community (Gratis):**
- Uso ilimitado en desarrollo
- Un servidor en producción
- Soporte comunitario
- Código fuente incluido

**Edición Professional ($299/servidor/año):**
- Uso comercial ilimitado
- Soporte por email
- Actualizaciones prioritarias
- License key management

**Edición Enterprise ($499/servidor/año):**
- Todo lo de Professional
- Soporte 24/7
- SLA garantizado
- Deployment ilimitado
- Custom branding

**Edición Premium (Custom pricing):**
- Todo lo de Enterprise
- Desarrollo a medida
- Integración especializada
- Capacitación presencial
- Consultoría arquitectura

### Comprar Licencia

**Web:** https://industrial-gateway.io/pricing

**Email:** sales@industrial-gateway.io

**Teléfono:** +1 (555) 123-4567

### Políticas

**Actualizaciones:**
- Security patches: Gratis para todas las ediciones
- Feature updates: Incluidas con licencia activa
- Major versions: Requieren actualización de licencia

**Renovación:**
- Auto-renovación por defecto
- Descuento 20% por renovación anticipada
- Sin penalidad por cancelación

**Devoluciones:**
- 30 días money-back guarantee
- Sin preguntas

---

## Apéndice

### A. Glosario

- **PLC:** Programmable Logic Controller
- **SCADA:** Supervisory Control and Data Acquisition
- **HMI:** Human-Machine Interface
- **OPC UA:** OPC Unified Architecture
- **CIP:** Common Industrial Protocol
- **Tag:** Punto de datos en un PLC
- **Mapping:** Conexión entre tag de entrada y salida
- **Normalization:** Conversión de datos a formato estándar
- **Emulator:** PLC virtual que simula un PLC real
- **Gateway:** Intermediario de comunicación entre redes

### B. Comandos Rápidos

```bash
# Estado del sistema
systemctl status industrial-gateway

# Ver logs
journalctl -u industrial-gateway -f

# CLI status
igp status

# Lanzar TUI
igp tui

# Listar PLCs
igp plc list

# Seguir logs
igp logs -f

# Crear PLC (interactivo)
igp plc create

# Login
igp login
```

### C. Puertos por Defecto

| Puerto | Servicio |
|--------|----------|
| 3000 | API REST + WebSocket |
| 4840 | OPC UA Server |
| 502 | Modbus TCP (requiere root) |
| 5502 | Modbus TCP (sin root) |
| 5173 | Frontend Dev Server |
| 80 | Nginx (Docker) |

### D. Archivos Importantes

```
/opt/industrial-gateway/              # Instalación
/var/lib/industrial-gateway/          # Datos
/etc/industrial-gateway.env           # Configuración
/etc/systemd/system/industrial-gateway.service  # Servicio
/usr/local/bin/igp                    # CLI
~/.industrial-gateway/config.json     # Config usuario
~/.industrial-gateway/token           # Token JWT
```

### E. Variables de Entorno

```bash
# API URL (para CLI)
export IGP_API_URL=http://192.168.1.100:3000/api

# Database URL
DATABASE_URL="file:/var/lib/industrial-gateway/production.db"

# JWT Secret
JWT_SECRET="your-secure-secret-here"

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# OPC UA
OPCUA_PORT=4840

# Modbus
MODBUS_PORT=5502
```

### F. Contactos

**Ventas:** sales@industrial-gateway.io
**Soporte:** support@industrial-gateway.io
**General:** info@industrial-gateway.io
**Web:** https://industrial-gateway.io
**GitHub:** https://github.com/industrial-gateway/platform
**Twitter:** @IndustrialGW
**LinkedIn:** Industrial Gateway Platform

---

**Industrial Gateway Platform v1.0.0**
**Manual Completo en Español**

© 2026 Industrial Automation Solutions
Todos los derechos reservados.

*Transformando la automatización industrial con tecnología moderna.*
