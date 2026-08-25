# Gestión segura de cuentas

Las cuentas de administrador y rector viven en la colección `users` de MongoDB. Las contraseñas nunca se guardan en texto plano: se almacenan como hashes bcrypt.

No existen usuarios ni contraseñas predeterminados en el código ni en las variables de entorno. Para una instalación nueva, con `MONGO_URL`, `DB_NAME` y `JWT_SECRET` configurados, cree el primer administrador una sola vez:

```bash
cd backend
python scripts/bootstrap_admin.py --email admin@colegio.edu --name "Nombre del administrador"
```

El programa solicita la contraseña de forma interactiva y exige al menos 12 caracteres. Después, el administrador puede crear las cuentas de rector desde el panel.

En producción mantenga `SECURE_COOKIES=true`, use HTTPS, un `JWT_SECRET` aleatorio de al menos 32 bytes y especifique únicamente los dominios reales en `CORS_ORIGINS`.
