# Sistema de Diseño - Tipografía

## 🎨 Componentes de Texto Atómicos

Nuestro sistema de diseño incluye componentes de tipografía reutilizables que mantienen consistencia visual en toda la aplicación.

## 📝 Componentes Disponibles

### 1. Heading

Component para títulos y encabezados con diferentes niveles semánticos.

```vue
<template>
  <!-- Título principal -->
  <Heading level="h1" size="3xl" weight="bold">Panel de Control</Heading>

  <!-- Subtítulo -->
  <Heading level="h2" size="xl" weight="semibold" color="secondary">Resumen Financiero</Heading>

  <!-- Título de sección -->
  <Heading level="h3" size="lg" weight="semibold" uppercase>CONFIGURACIÓN</Heading>
</template>
```

**Props:**

- `level`: h1, h2, h3, h4, h5, h6 (semántico)
- `size`: xs, sm, base, lg, xl, 2xl, 3xl, 4xl (visual)
- `weight`: light, normal, medium, semibold, bold, extrabold
- `color`: primary, secondary, muted, accent, success, warning, error, white, black
- `uppercase`: boolean
- `tracking`: tight, normal, wide, wider, widest

### 2. Text

Component para texto de cuerpo y párrafos.

```vue
<template>
  <!-- Texto principal -->
  <Text size="base" weight="normal">Este es el texto principal del contenido.</Text>

  <!-- Texto pequeño -->
  <Text size="sm" color="muted">Información adicional o secundaria.</Text>

  <!-- Texto con énfasis -->
  <Text weight="semibold" color="accent">Texto destacado o importante.</Text>

  <!-- Texto truncado -->
  <Text truncate class="max-w-xs">Este texto será truncado con ellipsis si es muy largo.</Text>
</template>
```

**Props:**

- `size`: xs, sm, base, lg, xl
- `weight`: light, normal, medium, semibold, bold
- `color`: primary, secondary, muted, accent, success, warning, error, white, black, inherit
- `align`: left, center, right, justify
- `italic`, `uppercase`, `truncate`, `underline`: boolean
- `leading`: tight, snug, normal, relaxed, loose
- `as`: p, span, div, strong, em

### 3. Label

Component para etiquetas de formularios y secciones.

```vue
<template>
  <!-- Label de formulario -->
  <Label variant="form" html-for="email" required>Correo Electrónico</Label>

  <!-- Label de sección -->
  <Label variant="section" size="xs" color="muted">MENÚ PRINCIPAL</Label>

  <!-- Badge label -->
  <Label variant="badge" size="xs">Nuevo</Label>
</template>
```

**Props:**

- `size`: xs, sm, base
- `color`: primary, secondary, muted, accent, white
- `variant`: default, section, form, badge
- `uppercase`, `required`: boolean
- `htmlFor`: string (for form labels)

### 4. Link

Component para enlaces internos y externos.

```vue
<template>
  <!-- Link interno -->
  <Link to="/dashboard" size="base" weight="medium">Ir al Panel</Link>

  <!-- Link externo -->
  <Link href="https://finhub.co" external variant="primary">Visitar FinHub</Link>

  <!-- Link secundario -->
  <Link to="/help" variant="secondary" size="sm">¿Necesitas ayuda?</Link>
</template>
```

**Props:**

- `to`: string (rutas internas con NuxtLink)
- `href`: string (enlaces externos)
- `size`: xs, sm, base, lg
- `variant`: default, primary, secondary, muted, danger
- `weight`: normal, medium, semibold, bold
- `underline`, `disabled`, `external`: boolean

## 🎯 Casos de Uso Comunes

### Jerarquía de Títulos

```vue
<template>
  <article>
    <Heading level="h1" size="3xl" weight="bold">Título Principal del Artículo</Heading>

    <Heading level="h2" size="xl" weight="semibold" class="mt-8">Sección Principal</Heading>

    <Heading level="h3" size="lg" weight="semibold" class="mt-6">Subsección</Heading>

    <Text size="base" class="mt-4">Contenido del párrafo...</Text>
  </article>
</template>
```

### Navegación

```vue
<template>
  <nav>
    <Label variant="section" size="xs" color="muted" class="mb-4">MENÚ PRINCIPAL</Label>

    <Link to="/dashboard" class="mb-2 block">Dashboard</Link>

    <Link to="/transactions" class="mb-2 block">Transacciones</Link>
  </nav>
</template>
```

### Formularios

```vue
<template>
  <form>
    <div class="mb-4">
      <Label variant="form" html-for="name" required>Nombre Completo</Label>
      <input id="name" type="text" />
    </div>

    <Text size="sm" color="muted">
      La información será utilizada para personalizar tu experiencia.
    </Text>
  </form>
</template>
```

## 🚀 Ventajas del Sistema

1. **Consistencia**: Estilos unificados en toda la aplicación
2. **Mantenibilidad**: Cambios centralizados afectan todos los usos
3. **Reutilización**: Componentes exportables a otros proyectos
4. **Flexibilidad**: Props para personalizar sin CSS custom
5. **Accesibilidad**: Elementos semánticos correctos
6. **Performance**: Tailwind classes optimizadas

## 📦 Exportación

Todos los componentes están exportados desde `@/components/atoms` y pueden ser reutilizados en otros proyectos FinHub:

```typescript
import { Heading, Text, Label, Link } from '@/components/atoms'
```
