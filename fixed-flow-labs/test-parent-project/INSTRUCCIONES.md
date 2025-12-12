# Instrucciones para Probar el Web Component

## Requisitos Previos

- Tener instalado **Python** (viene preinstalado en macOS)
- Conexion a internet

---

## Paso 1: Verificar que Python esta instalado

### En macOS (Terminal)

1. Abre la aplicacion **Terminal** (Aplicaciones > Utilidades > Terminal)
2. Escribe el siguiente comando y presiona Enter:

```bash
python3 --version
```

Si muestra algo como `Python 3.x.x`, Python esta instalado.

### En Windows (CMD o PowerShell)

1. Presiona `Windows + R`, escribe `cmd` y presiona Enter
2. Escribe el siguiente comando y presiona Enter:

```bash
python --version
```

Si muestra algo como `Python 3.x.x`, Python esta instalado.

**Si Python NO esta instalado en Windows:**
1. Ve a: https://www.python.org/downloads/
2. Descarga e instala Python
3. Durante la instalacion, marca la opcion **"Add Python to PATH"**

---

## Paso 2: Navegar a la Carpeta del Proyecto

### En macOS (Terminal)

```bash
cd /ruta/a/la/carpeta/test-parent-project
```

### En Windows (CMD)

```bash
cd C:\ruta\a\la\carpeta\test-parent-project
```

**Tip:** Puedes arrastrar la carpeta al Terminal/CMD para obtener la ruta automaticamente.

---

## Paso 3: Iniciar el Servidor Local

### En macOS (Terminal)

```bash
python3 -m http.server 8080
```

### En Windows (CMD o PowerShell)

```bash
python -m http.server 8080
```

Veras un mensaje similar a:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

**NO cierres esta ventana mientras pruebes el componente.**

---

## Paso 4: Abrir en el Navegador

1. Abre tu navegador web (Chrome, Firefox, Safari, Edge)
2. Escribe en la barra de direcciones:

```
http://localhost:8080/index-cdn.html
```

3. Presiona Enter

---

## Paso 5: Probar el Componente

Una vez abierto en el navegador:

1. Veras la pagina con el header de "Mi Claro Empresas"
2. El componente mostrara un mapa de Google Maps
3. Escribe una direccion en Puerto Rico (ejemplo: "San Juan, PR")
4. Selecciona la direccion sugerida o haz clic en el mapa
5. Haz clic en **"Validar Cobertura"**
6. Continua con el flujo: Planes > Contrato > Formulario > Confirmacion

---

## Paso 6: Detener el Servidor

Cuando termines de probar:

- En macOS: Presiona `Control + C` en el Terminal
- En Windows: Presiona `Ctrl + C` en el CMD

---

## Solucion de Problemas

### El mapa no carga
- Verifica que tienes conexion a internet
- Espera unos segundos, el mapa puede tardar en cargar

### Error "CORS" en la consola
- Asegurate de abrir la pagina con `http://localhost:8080/...`
- NO abras el archivo haciendo doble clic directamente

### La pagina se ve en blanco
- Abre la consola del navegador (F12 > Console) para ver errores
- Verifica que el servidor Python esta corriendo

### El puerto 8080 esta en uso
- Usa otro puerto, ejemplo: `python3 -m http.server 3000`
- Luego abre: `http://localhost:3000/index-cdn.html`

---

## Nota Importante

Este archivo `index-cdn.html` es solo para **pruebas de demostracion**.

Para la implementacion final, el Web Component debe ser instalado e integrado en el **proyecto padre correspondiente** (Angular, React, Vue, o HTML puro) siguiendo las instrucciones del README.md del repositorio:

```
https://github.com/smlzjosue/fixed-service-flow-web-component
```

---

## Contacto

Si tienes problemas, contacta al equipo de desarrollo.
