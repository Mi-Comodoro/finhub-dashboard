# Flujo Actual de Autenticacion con Google en FinHub

## Resumen
El login con Google en el cliente no consume directamente el backend externo.
El flujo real es:

`Firebase Popup -> /api/auth/google -> Backend externo /auth/google -> cookies -> /api/users/me -> stores`

Firebase solo se usa para obtener la identidad inicial del usuario mediante `idToken`.
Despues de eso, la sesion de la aplicacion depende del token propio del backend y de la respuesta canonica de `/users/me`.

## Actores
- Cliente Nuxt: inicia popup Google, llama server routes internas y llena stores.
- Firebase Auth: autentica al usuario con Google y entrega `idToken`.
- Server Routes Nuxt: puente entre cliente y backend externo.
- Backend externo: valida `idToken`, entrega token propio y resuelve perfil del usuario.
- Pinia stores: guardan sesion, usuario, onboarding y configuracion financiera.

## Flujo Paso a Paso
### 1. Inicializacion de Firebase
El plugin [`src/plugins/firebase.client.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/plugins/firebase.client.ts) crea la app de Firebase en cliente.

Expone:
- `initFirebase`
- `signInWithPopup`
- `onAuthStateChanged`
- `firebaseSignOut`

La configuracion de Firebase se obtiene desde `/api/firebase`.

### 2. Login con Google desde el cliente
El flujo arranca en [`src/composables/useAuth.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/composables/useAuth.ts), dentro de `loginWithGoogle()`.

Pasos:
1. Inicializa Firebase con `initFirebase()`.
2. Ejecuta `signInWithPopup(auth, googleProvider)`.
3. Firebase devuelve `result.user`.
4. Se obtiene `idToken` usando `result.user.getIdToken()`.

Hasta aqui, el cliente todavia no tiene una sesion propia de FinHub; solo tiene identidad validada por Google/Firebase.

### 3. Llamada a la server route interna
Desde `loginWithGoogle()`, el cliente llama:

`POST /api/auth/google`

Body enviado:
```json
{
  "data": {
    "idToken": "...",
    "name": "Nombre del usuario"
  }
}
```

### 4. Server route /api/auth/google
La route [`src/server/api/auth/google.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/server/api/auth/google.ts) hace lo siguiente:

1. Lee el body.
2. Limpia cookies previas:
   - `access-token`
   - `account-type`
3. Llama al backend externo:

`POST ${config.public.apiBase}/auth/google`

4. Si falla, usa `loginError(response.status)`.
5. Si responde bien, toma de `response.data`:
   - `token`
   - `accountType`
6. Escribe cookies server-side:
   - `access-token`
   - `account-type`
7. Devuelve al cliente:
```ts
{ success: response.success, result: response.data }
```

## Interaccion con el backend externo
### Endpoint externo de autenticacion
La server route llama al backend externo en:

`POST /auth/google`

La responsabilidad del backend externo es:
- validar el `idToken` emitido por Firebase
- identificar o crear al usuario
- generar el token propio del backend
- devolver informacion minima de sesion, por ejemplo:
  - `token`
  - `accountType`

Este token propio reemplaza el uso de Firebase como mecanismo de autorizacion para el resto de operaciones de negocio.

## Construccion de la sesion de FinHub
### 5. El cliente recibe token y accountType
De vuelta en `loginWithGoogle()`:
- se toma `res.token`
- se toma `res.accountType`
- se actualiza `authStore.setAccountType(res.accountType)`

Adicionalmente, el composable intenta guardar esas cookies con `useCookie(...)`, aunque la fuente real de verdad para server routes termina siendo la cookie escrita por la route `/api/auth/google`.

### 6. Poblacion de stores con /api/users/me
Despues del login, `loginWithGoogle()` ejecuta:

`populateSessionFromServer(res.token)`

Esta funcion vive tambien en [`src/composables/useAuth.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/composables/useAuth.ts).

Su objetivo es llenar el estado canonico del frontend usando `GET /api/users/me`.

### 7. Server route /api/users/me
La route [`src/server/api/users/me.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/server/api/users/me.ts):

1. Lee `access-token` desde cookie:
   - `getCookie(event, ACCESS_TOKEN)`
2. Llama al backend externo:

`GET ${config.public.apiBase}/users/me`

3. Envia:
```ts
headers: {
  authorization: `Bearer ${token}`
}
```
4. Si falla, ejecuta `validateError(event, response.status)`.
5. Si responde bien, normaliza la respuesta y devuelve:
```ts
{
  success,
  result: {
    user,
    finances,
    onboarding,
    accountType
  }
}
```

### 8. Stores actualizados en cliente
Con la respuesta de `/api/users/me`, `populateSessionFromServer()` actualiza:
- `authStore.session`
- `authStore.onboarding`
- `authStore.accountType`
- `userStore`
- `financesStore`

Adicionalmente crea una version local tipo Firebase del usuario para `user.value`.

## Restauracion de sesion al recargar
Hay dos mecanismos actuales:

### Plugin session.client.ts
[`src/plugins/session.client.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/plugins/session.client.ts)

Intenta restaurar sesion al cargar la app:
1. lee una cookie
2. si existe y `authStore` no esta autenticado
3. llama `populateSessionFromServer(...)`

### useSession + middlewares
[`src/composables/useSession.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/composables/useSession.ts)

Usa `/api/users/me` para validar sesion y poblar stores cuando se entra a rutas protegidas o se fuerza revalidacion.

Los middlewares relevantes son:
- [`src/middleware/auth.global.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/middleware/auth.global.ts)
- [`src/middleware/dashboard.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/middleware/dashboard.ts)

## Logout relacionado
El cierre de sesion actual en [`src/composables/useAuth.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/composables/useAuth.ts):
1. hace `firebaseSignOut(auth)`
2. llama `POST /api/auth/logout`
3. limpia cookies locales
4. limpia `authStore`, `userStore` y `financesStore`

La server route [`src/server/api/auth/logout.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/server/api/auth/logout.ts) reenvia la peticion al backend externo y luego borra cookies server-side.

## Fuente de verdad actual
La fuente de verdad de sesion de la app no es el usuario de Firebase.

La fuente real es:
1. token emitido por el backend externo
2. cookie `access-token`
3. respuesta canonica de `/api/users/me`

Firebase participa solo en el inicio del login social.

## Observaciones tecnicas importantes
### 1. Inconsistencia en nombre de cookie
En [`src/common/constants/index.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/common/constants/index.ts), la cookie real es:

`access-token`

Pero en [`src/plugins/session.client.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/plugins/session.client.ts) se intenta leer:

`ACCESS_TOKEN`

Eso puede romper la restauracion automatica de sesion en cliente porque el plugin esta mirando otra clave.

### 2. populateSessionFromServer manda Authorization, pero /api/users/me usa cookie
`populateSessionFromServer(bearerToken)` manda:
```ts
headers: { Authorization: `Bearer ${bearerToken}` }
```

Sin embargo, la route [`src/server/api/users/me.ts`](/c:/Users/Ingmi/personal/finanzas/finhub-dashboard/src/server/api/users/me.ts) no toma ese header.
Lee exclusivamente el token desde cookie con `getCookie(event, ACCESS_TOKEN)`.

Eso significa que hoy el exito de `populateSessionFromServer()` depende en realidad de que la cookie ya haya sido correctamente escrita por `/api/auth/google`.

### 3. Cookie httpOnly + useCookie en cliente
`COOKIE_OPTIONS` marca `httpOnly: true`.
Eso significa que, conceptualmente, el cliente no deberia depender de leer/escribir esa cookie directamente desde JavaScript como fuente principal.

La estrategia mas consistente ya esta parcialmente en el repo:
- server route escribe cookie
- cliente pide `/api/users/me`
- stores se llenan con respuesta canonica

## Secuencia resumida
```text
Usuario
  -> Cliente Nuxt: click "Login con Google"
Cliente Nuxt
  -> Firebase: signInWithPopup()
Firebase
  -> Cliente Nuxt: firebaseUser + idToken
Cliente Nuxt
  -> /api/auth/google: POST { idToken, name }
Server Route Nuxt
  -> Backend externo /auth/google
Backend externo
  -> Server Route Nuxt: token propio + accountType
Server Route Nuxt
  -> escribe cookies access-token/account-type
  -> Cliente Nuxt: success + result
Cliente Nuxt
  -> /api/users/me
Server Route Nuxt
  -> Backend externo /users/me con Bearer cookieToken
Backend externo
  -> perfil, onboarding, finances
Server Route Nuxt
  -> Cliente Nuxt: result normalizado
Cliente Nuxt
  -> llena authStore, userStore, financesStore
```

## Conclusion
Hoy el login con Google en FinHub funciona como un flujo hibrido:
- Google/Firebase valida identidad inicial
- el backend externo emite la sesion real de negocio
- Nuxt guarda esa sesion en cookies
- `/api/users/me` construye el estado canonico del frontend

Es un flujo correcto en su idea general, pero tiene al menos dos puntos fragiles:
- la inconsistencia entre `ACCESS_TOKEN` y `access-token`
- el hecho de que `populateSessionFromServer()` envia un header que `/api/users/me` actualmente no utiliza
