# Resolución de Problemas

> Descubre soluciones a problemas comunes con la instalación y uso de Claude Code.

## Problemas comunes de instalación

### Problemas de permisos en Linux

Al instalar Claude Code con npm, puedes encontrar errores de permisos si tu prefijo global de npm no es escribible por el usuario (ej. `/usr`, o `/usr/local`).

#### Solución recomendada: Crear un prefijo npm escribible por el usuario

El enfoque más seguro es configurar npm para usar un directorio dentro de tu carpeta home:

```bash
# Primero, guarda una lista de tus paquetes globales existentes para migración posterior
npm list -g --depth=0 > ~/npm-global-packages.txt

# Crea un directorio para tus paquetes globales
mkdir -p ~/.npm-global

# Configura npm para usar la nueva ruta de directorio
npm config set prefix ~/.npm-global

# Nota: Reemplaza ~/.bashrc con ~/.zshrc, ~/.profile, u otro archivo apropiado para tu shell
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Aplica la nueva configuración de PATH
source ~/.bashrc

# Ahora reinstala Claude Code en la nueva ubicación
npm install -g @anthropic-ai/claude-code

# Opcional: Reinstala tus paquetes globales previos en la nueva ubicación
# Mira ~/npm-global-packages.txt e instala paquetes que quieras mantener
```

Esta solución es recomendada porque:

- Evita modificar permisos de directorios del sistema
- Crea una ubicación limpia y dedicada para tus paquetes npm globales
- Sigue las mejores prácticas de seguridad

#### Recuperación del Sistema: Si has ejecutado comandos que cambian propiedad y permisos de archivos del sistema o similares

Si ya has ejecutado un comando que cambió permisos de directorios del sistema (como `sudo chown -R $USER:$(id -gn) /usr && sudo chmod -R u+w /usr`) y tu sistema ahora está roto (por ejemplo, si ves `sudo: /usr/bin/sudo must be owned by uid 0 and have the setuid bit set`), necesitarás realizar pasos de recuperación.

##### Método de Recuperación Ubuntu/Debian:

1. Mientras reinicias, mantén presionado **SHIFT** para acceder al menú GRUB

2. Selecciona "Advanced options for Ubuntu/Debian"

3. Elige la opción de modo de recuperación

4. Selecciona "Drop to root shell prompt"

5. Remonta el sistema de archivos como escribible:

   ```bash
   mount -o remount,rw /
   ```

6. Corrige permisos:

   ```bash
   # Restaura propiedad root
   chown -R root:root /usr
   chmod -R 755 /usr

   # Asegura que /usr/local sea propiedad de tu usuario para paquetes npm
   chown -R YOUR_USERNAME:YOUR_USERNAME /usr/local

   # Establece bit setuid para binarios críticos
   chmod u+s /usr/bin/sudo
   chmod 4755 /usr/bin/sudo
   chmod u+s /usr/bin/su
   chmod u+s /usr/bin/passwd
   chmod u+s /usr/bin/newgrp
   chmod u+s /usr/bin/gpasswd
   chmod u+s /usr/bin/chsh
   chmod u+s /usr/bin/chfn

   # Corrige configuración sudo
   chown root:root /usr/libexec/sudo/sudoers.so
   chmod 4755 /usr/libexec/sudo/sudoers.so
   chown root:root /etc/sudo.conf
   chmod 644 /etc/sudo.conf
   ```

7. Reinstala paquetes afectados (opcional pero recomendado):

   ```bash
   # Guarda lista de paquetes instalados
   dpkg --get-selections > /tmp/installed_packages.txt

   # Reinstálalos
   awk '{print $1}' /tmp/installed_packages.txt | xargs -r apt-get install --reinstall -y
   ```

8. Reinicia:
   ```bash
   reboot
   ```

##### Método Alternativo de Recuperación con USB Live:

Si el modo de recuperación no funciona, puedes usar un USB live:

1. Inicia desde un USB live (Ubuntu, Debian, o cualquier distribución Linux)

2. Encuentra tu partición del sistema:

   ```bash
   lsblk
   ```

3. Monta tu partición del sistema:

   ```bash
   sudo mount /dev/sdXY /mnt  # reemplaza sdXY con tu partición actual del sistema
   ```

4. Si tienes una partición boot separada, móntala también:

   ```bash
   sudo mount /dev/sdXZ /mnt/boot  # si es necesario
   ```

5. Haz chroot a tu sistema:

   ```bash
   # Para Ubuntu/Debian:
   sudo chroot /mnt

   # Para sistemas basados en Arch:
   sudo arch-chroot /mnt
   ```

6. Sigue los pasos 6-8 del método de recuperación Ubuntu/Debian anterior

Después de restaurar tu sistema, sigue la solución recomendada anterior para configurar un prefijo npm escribible por el usuario.

## Problemas del actualizador automático

Si Claude Code no puede actualizarse automáticamente, puede deberse a problemas de permisos con tu directorio de prefijo global de npm. Sigue la [solución recomendada](#solución-recomendada-crear-un-prefijo-npm-escribible-por-el-usuario) anterior para corregir esto.

Si prefieres deshabilitar el actualizador automático en su lugar, puedes establecer la [variable de entorno](settings#variables-de-entorno) `DISABLE_AUTOUPDATER` en `1`

## Permisos y autenticación

### Solicitudes repetidas de permisos

Si te encuentras aprobando repetidamente los mismos comandos, puedes permitir que herramientas específicas se ejecuten sin aprobación usando el comando `/permissions`. Consulta [documentación de Permisos](/en/docs/claude-code/iam#configuring-permissions).

### Problemas de autenticación

Si estás experimentando problemas de autenticación:

1. Ejecuta `/logout` para cerrar sesión completamente
2. Cierra Claude Code
3. Reinicia con `claude` y completa el proceso de autenticación nuevamente

Si los problemas persisten, intenta:

```bash
rm -rf ~/.config/claude-code/auth.json
claude
```

Esto elimina tu información de autenticación almacenada y fuerza un login limpio.

## Rendimiento y estabilidad

### Alto uso de CPU o memoria

Claude Code está diseñado para funcionar con la mayoría de entornos de desarrollo, pero puede consumir recursos significativos al procesar bases de código grandes. Si estás experimentando problemas de rendimiento:

1. Usa `/compact` regularmente para reducir el tamaño del contexto
2. Cierra y reinicia Claude Code entre tareas principales
3. Considera añadir directorios de build grandes a tu archivo `.gitignore`

### El comando se cuelga o congela

Si Claude Code parece no responder:

1. Presiona Ctrl+C para intentar cancelar la operación actual
2. Si no responde, puede que necesites cerrar la terminal y reiniciar

### La tecla ESC no funciona en terminales JetBrains (IntelliJ, PyCharm, etc.)

Si estás usando Claude Code en terminales JetBrains y la tecla ESC no interrumpe el agente como se espera, esto probablemente se debe a un conflicto de atajos de teclado con los atajos predeterminados de JetBrains.

Para solucionar este problema:

1. Ve a Settings → Tools → Terminal
2. Haz clic en el hiperenlace "Configure terminal keybindings" junto a "Override IDE Shortcuts"
3. Dentro de los atajos de teclado del terminal, desplázate hacia abajo hasta "Switch focus to Editor" y elimina ese atajo

Esto permitirá que la tecla ESC funcione correctamente para cancelar operaciones de Claude Code en lugar de ser capturada por la acción "Switch focus to Editor" de PyCharm.

## Obtener más ayuda

Si estás experimentando problemas no cubiertos aquí:

1. Usa el comando `/bug` dentro de Claude Code para reportar problemas directamente a Anthropic
2. Consulta el [repositorio de GitHub](https://github.com/anthropics/claude-code) para problemas conocidos
3. Ejecuta `/doctor` para verificar la salud de tu instalación de Claude Code