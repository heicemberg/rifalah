# 🚀 Guía de Despliegue - Rifa Silverado Z71 2024

Tu proyecto ya está listo para ser desplegado en cualquier servidor web estático. Los archivos se encuentran en la carpeta `out/`.

## ✅ ¿Qué se ha configurado?

1. **Next.js Static Export**: Configurado para generar archivos estáticos
2. **Optimización de imágenes**: Deshabilitada para compatibilidad estática
3. **Trailing slashes**: Habilitados para mejor compatibilidad
4. **Directorio de salida**: `out/` (contiene todos los archivos necesarios)

## 📁 Archivos importantes en `out/`

```
out/
├── index.html          # Página principal
├── admin/index.html    # Panel de administración
├── comprar/index.html  # Página de compra
├── _next/              # Assets optimizados de Next.js
├── logos/              # Logotipos de métodos de pago
├── premios/            # Imagen del premio
└── favicon.ico         # Icono del sitio
```

## 🌐 Opciones de Despliegue

### 1. **Vercel (Recomendado)**
```bash
npm install -g vercel
vercel --prod
```
- Sube automáticamente la carpeta `out/`
- Dominio gratuito incluido
- CDN global automático

### 2. **Netlify**
- Arrastra la carpeta `out/` a [netlify.com](https://netlify.com)
- O conecta tu repositorio Git
- Dominio gratuito incluido

### 3. **GitHub Pages**
1. Sube el contenido de `out/` a rama `gh-pages`
2. Activa GitHub Pages en configuración del repo
3. Tu sitio estará en `https://tuusuario.github.io/repo`

### 4. **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Selecciona 'out' como directorio público
firebase deploy
```

### 5. **Servidor Web Tradicional**
- Sube todo el contenido de `out/` a tu servidor web
- Configura el servidor para servir `index.html` como archivo por defecto
- Asegúrate que soporte archivos estáticos

## ⚙️ Comandos disponibles

```bash
# Desarrollo local
npm run dev

# Construir para producción
npm run build

# Construir y exportar (ya configurado en build)
npm run export

# Linting
npm run lint
```

## 🔧 Configuración del servidor

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^\.]+)$ $1.html [NC,L]
```

### Nginx
```nginx
location / {
    try_files $uri $uri.html $uri/ /index.html;
}
```

## 📝 Notas importantes

1. **Todas las rutas son estáticas**: No hay server-side rendering
2. **Imágenes optimizadas**: Están incluidas en el build
3. **SEO completo**: Meta tags y structured data incluidos
4. **Responsive**: Funciona en todos los dispositivos
5. **PWA ready**: Incluye manifest y service workers

## 🚨 Antes de desplegar

- [ ] Revisa que todas las URLs en el código sean correctas
- [ ] Verifica que las imágenes se muestren correctamente
- [ ] Prueba la funcionalidad en mobile y desktop
- [ ] Confirma que los métodos de pago estén actualizados

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa la documentación de tu plataforma de despliegue
2. Verifica que los archivos estén en `out/`
3. Asegúrate que el servidor sirva archivos estáticos correctamente

¡Tu rifa ya está lista para recibir participantes! 🎉