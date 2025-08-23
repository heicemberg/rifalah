# 🚀 GUÍA COMPLETA DE INSTALACIÓN - RIFA SILVERADO Z71 2024

Esta guía te llevará paso a paso para configurar completamente el sistema de rifa con base de datos PostgreSQL en la nube usando Supabase.

## 📋 REQUISITOS PREVIOS

- ✅ Node.js 18+ instalado
- ✅ npm o yarn
- ✅ Cuenta de email válida
- ✅ Conexión a internet

## 🗄️ PASO 1: CONFIGURAR SUPABASE (BASE DE DATOS EN LA NUBE)

### 1.1 Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub, Google o email
4. Confirma tu email si es necesario

### 1.2 Crear nuevo proyecto
1. En el dashboard, haz clic en **"New Project"**
2. Selecciona tu organización (o crea una nueva)
3. Configura el proyecto:
   - **Name**: `rifa-silverado-2024`
   - **Database Password**: Genera una contraseña segura (GUÁRDALA)
   - **Region**: Elige la más cercana a México (por ejemplo: `East US`)
4. Haz clic en **"Create new project"**
5. ⏳ Espera 2-3 minutos mientras se crea la base de datos

### 1.3 Obtener credenciales
1. Una vez creado el proyecto, ve a **Settings** > **API**
2. Copia estos valores importantes:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsI...` (es muy largo)

## 🔧 PASO 2: CONFIGURAR EL PROYECTO LOCALMENTE

### 2.1 Configurar variables de entorno
1. En la carpeta del proyecto, abre el archivo `.env.local`
2. Reemplaza los valores con tus credenciales de Supabase:

```bash
# Reemplaza con tus valores reales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-muy-larga-aqui
```

### 2.2 Instalar dependencias (si no están instaladas)
```bash
npm install
```

## 🗄️ PASO 3: CREAR LAS TABLAS EN LA BASE DE DATOS

### 3.1 Ejecutar el script SQL
1. Ve a tu proyecto en Supabase
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**
4. Copia y pega **TODO** el contenido del archivo `SETUP_DATABASE.md` (el SQL completo)
5. Haz clic en **"Run"** 
6. ✅ Deberías ver: "Success. No rows returned"

### 3.2 Verificar que todo funcionó
1. Ve a **Table Editor** en el menú lateral
2. Deberías ver la tabla **`clientes_compras`** creada
3. Ve a **Storage** > deberías ver el bucket **`comprobantes`**

## 🚀 PASO 4: PROBAR LA APLICACIÓN

### 4.1 Iniciar el servidor
```bash
npm run dev
```

### 4.2 Abrir la aplicación
1. Ve a [http://localhost:3000](http://localhost:3000)
2. La aplicación debería cargar normalmente

### 4.3 Probar una compra
1. Haz clic en **"Comprar Boletos"**
2. Llena el formulario de compra
3. Sube un comprobante de prueba (cualquier imagen)
4. Completa la compra

### 4.4 Verificar en el panel de admin
1. Ve a [http://localhost:3000/admin](http://localhost:3000/admin)
2. Deberías ver la compra que acabas de hacer
3. Los datos ahora se guardan en Supabase ☁️

## ✅ VERIFICACIÓN FINAL

### En Supabase:
1. **Table Editor** > `clientes_compras`: Deberías ver los datos de la compra
2. **Storage** > `comprobantes`: Deberías ver la imagen subida

### En la aplicación:
1. ✅ Las compras se guardan en la base de datos en la nube
2. ✅ Los comprobantes se suben a Supabase Storage
3. ✅ El panel de admin muestra datos reales
4. ✅ Las notificaciones funcionan correctamente

## 🔧 TROUBLESHOOTING COMÚN

### ❌ Error: "Invalid API key"
**Solución:**
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de usar la **anon public key**, no la service role key
3. Reinicia el servidor: `npm run dev`

### ❌ Error: "relation 'clientes_compras' does not exist"
**Solución:**
1. Ve a Supabase > SQL Editor
2. Ejecuta de nuevo el script SQL completo
3. Verifica que no hubo errores en la ejecución

### ❌ Error: "Failed to fetch"
**Solución:**
1. Verifica tu conexión a internet
2. Verifica que la URL de Supabase es correcta
3. Ve a Supabase y confirma que el proyecto está activo

### ❌ Error: "Row Level Security"
**Solución temporal:**
1. Ve a Supabase > SQL Editor
2. Ejecuta: `ALTER TABLE clientes_compras DISABLE ROW LEVEL SECURITY;`
3. Esto desactiva temporalmente la seguridad

## 📊 ESTRUCTURA DE DATOS

Cada compra guarda:
- **Datos del cliente**: nombre, email, teléfono, ubicación
- **Información de compra**: cantidad de boletos, precio, descuentos
- **Método de pago**: Binance, BanCoppel, OXXO, etc.
- **Comprobantes**: URLs de las imágenes subidas
- **Metadata**: navegador, dispositivo, timestamp
- **Estado**: pendiente/confirmada/cancelada

## 🎯 BENEFICIOS DE USAR SUPABASE

✅ **Base de datos en la nube**: Los datos nunca se pierden
✅ **Almacenamiento de archivos**: Comprobantes seguros en la nube
✅ **Escalabilidad**: Maneja miles de usuarios simultáneos
✅ **Backup automático**: Supabase hace copias de seguridad
✅ **Panel de administración**: Interface web para gestionar datos
✅ **API REST automática**: Fácil integración con otras apps
✅ **Tiempo real**: Actualizaciones en vivo (opcional)

## 🆘 SOPORTE

Si tienes problemas:
1. Revisa que seguiste todos los pasos
2. Verifica las credenciales en `.env.local`
3. Comprueba que el SQL se ejecutó correctamente
4. Revisa la consola del navegador (F12) para errores

## 🎉 ¡LISTO!

Tu sistema de rifa ahora está completamente configurado con:
- ✅ Base de datos PostgreSQL en la nube
- ✅ Almacenamiento seguro de comprobantes
- ✅ Panel de administración funcional
- ✅ Sistema de backup dual (Supabase + localStorage)
- ✅ Notificaciones en tiempo real

¡Los usuarios ya pueden participar en la rifa y todos los datos se guardarán de forma segura en la nube! 🚗💰