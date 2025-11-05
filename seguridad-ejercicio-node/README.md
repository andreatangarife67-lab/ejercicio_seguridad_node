
# Ejercicio — Lectura segura de archivo + validación + backup + control de acceso (Node.js)

Este proyecto es independiente: **no toca tu código actual**. Incluye un script que:
1) Lee un archivo de texto con líneas `nombre;dato`
2) Valida el formato de cada línea
3) Crea una **copia de seguridad** del archivo original
4) Solicita una **contraseña** antes de mostrar datos
5) Muestra **solo nombres** si la contraseña es incorrecta

## Requisitos
- Node.js 18 o superior (no requiere paquetes externos)

## Archivos
- `usuarios.txt` — Datos de ejemplo (puedes editarlo)
- `ver_datos_seguro.js` — Script principal
- `.gitignore` — Ignora backups y `node_modules`

## Uso

### 1) (Opcional) Establece la contraseña en el entorno
- **Windows PowerShell**
```powershell
$env:ADMIN_VIEW_PASSWORD="MiClaveSegura123!"
```

- **macOS / Linux (bash/zsh)**
```bash
export ADMIN_VIEW_PASSWORD="MiClaveSegura123!"
```

> Si no la defines, usará el valor por defecto: `cambia_esta_contraseña`

### 2) Ejecuta el script
```bash
node ver_datos_seguro.js usuarios.txt
```

### 3) Prueba
- Si ingresas la contraseña correcta: verás **nombre | dato**
- Si ingresas una incorrecta: verás **solo los nombres**

## Personalización
- Cambia el nombre del archivo de entrada (primer argumento)
- Edita `usuarios.txt` para tus propias líneas `nombre;dato`

## Seguridad
- No guardes la contraseña en el código: usa la variable `ADMIN_VIEW_PASSWORD`
- El script crea backups con sello de tiempo en el mismo directorio
