# respaldaya-widget

Widget embebible de testimonios para Respaldaya. Es un bundle standalone en vanilla JS pensado para ejecutarse en una web externa y consumir el endpoint real `GET /api/widget/[slug]` de `respaldaya-app`.

## Estado del contrato real

El contrato canónico que hoy toma como fuente de verdad al app principal es:

- `GET /api/widget/[slug]`
- success: `{ ok: true, data: { space, config, testimonials } }`
- error: `{ ok: false, error: { code, message } }`

El widget soporta además aliases razonables para tolerar pequeñas diferencias de payload:

- `config` o `widget`
- `colorPrimary` o `primary_color`
- `customerName` o `name`
- `content` o `body`
- `rating` o `stars`
- `customerAvatar`, `customer_avatar` o `photo`

## Uso por CDN

```html
<script
  src="https://cdn.jsdelivr.net/gh/respaldaya/respaldaya-widget@latest/dist/widget.js"
  defer
></script>

<div
  data-testimonial-space="mi-space"
  data-api-base="https://app.respaldaya.com"
></div>
```

## Atributos `data-*`

| Atributo | Requerido | Default efectivo | Notas |
|---|---:|---|---|
| `data-testimonial-space` | si | - | Slug del space. Si falta, el widget muestra estado `error` sin romper la pagina. |
| `data-layout` | no | `config.layout` o `wall` | Valores validos: `wall`, `carousel`, `list`. |
| `data-theme` | no | `config.theme` o `light` | Valores validos: `light`, `dark`, `auto`. |
| `data-min-stars` | no | `1` | Se clampa entre `1` y `5`. |
| `data-max` | no | `config.maxItems` o `9` | Se clampa entre `1` y `50`. |
| `data-api-base` | no | `https://app.respaldaya.com` | Base del app principal. En pruebas locales conviene apuntarlo explicitamente. |

Los `data-*` funcionan como override del host. Si no se definen, el widget usa el `config` real del backend cuando aplica.

## Comportamiento

- tolera multiples widgets en la misma pagina
- detecta contenedores agregados dinamicamente
- no pisa clases CSS existentes del host
- maneja estados `loading`, `empty`, `error` y `success`
- usa `sendBeacon` hacia `/api/events` con payload compatible con `respaldaya-app`
- si analytics falla, nunca rompe render

## Desarrollo local

```bash
npm install
npm run build
```

El build genera `dist/widget.js`.

## Demo local

El repo incluye [`demo/index.html`](/c:/Users/lauri/repaldaya.com/respaldaya-wiget/demo/index.html) para una prueba manual rapida.

1. Levanta `respaldaya-app` localmente.
2. Confirma que exista un `space.slug` valido con testimonios `approved`.
3. Edita `data-testimonial-space` y `data-api-base` en [`demo/index.html`](/c:/Users/lauri/repaldaya.com/respaldaya-wiget/demo/index.html) si hace falta.
4. Ejecuta el build del widget.
5. Abre [`demo/index.html`](/c:/Users/lauri/repaldaya.com/respaldaya-wiget/demo/index.html) en el navegador, o sirvelo con cualquier server estatico simple.

## Validacion manual en una pagina externa simple

1. Crea un archivo HTML fuera del repo, por ejemplo `widget-test.html`.
2. Incluye el script del widget desde `dist/widget.js` o desde CDN.
3. Agrega uno o mas contenedores:

```html
<div
  data-testimonial-space="mi-space"
  data-api-base="http://localhost:3000"
  data-layout="carousel"
  data-theme="light"
  data-min-stars="4"
  data-max="6"
></div>
```

4. Abre esa pagina y valida estos casos reales:
- slug valido con testimonials approved
- slug valido sin testimonials approved
- slug inexistente
- backend caido o `data-api-base` incorrecto
- dos widgets en la misma pagina con distintas configs

## Publicacion

El archivo distribuible es [`dist/widget.js`](/c:/Users/lauri/repaldaya.com/respaldaya-wiget/dist/widget.js).
