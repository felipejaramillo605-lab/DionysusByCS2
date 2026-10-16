# Dionysus

Prototipo de ERP para restaurantes en Colombia.

> **Estado:** prototipo en desarrollo, creado con Figma Make. No es un producto en producción.

## Áreas presentes en el código

Los componentes de `src/components/` incluyen: panel (dashboard), punto de venta (POS), pedidos, inventario, reportes, facturación, administración, cuenta, seguridad y autenticación. La lógica de dominio vive en `src/domain/` (auditoría, pedidos) y la infraestructura en `src/infrastructure/`.

Esto describe lo que existe en el código; no implica que cada área esté completa.

## Stack

- React 19, Vite 8 y Tailwind CSS 4
- Recharts y lucide-react
- TypeScript
- Pruebas de humo con Playwright
- pnpm

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev          # servidor local en 127.0.0.1
```

Otros scripts: `pnpm build`, `pnpm typecheck`, `pnpm validate` (typecheck + build), `pnpm test:smoke`, `pnpm check:architecture`.

## Seguridad

Consulta [SECURITY.md](SECURITY.md) para reportar vulnerabilidades de forma privada.
