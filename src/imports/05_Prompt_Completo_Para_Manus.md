# 05 — Prompt completo para Manus.im

Actúa como arquitecto senior de producto, backend, frontend, seguridad y cumplimiento normativo colombiano. Necesito construir una aplicación ERP web para restaurantes pequeños y medianos en Colombia.

## Contexto del producto

La aplicación debe ser un ERP multi-compañía para restaurantes, inspirado en buenas prácticas de Oracle ERP/SAP Business One pero simplificado para pequeñas empresas. Debe mantener arquitectura multi-tenant, roles granulares, seguridad robusta, auditoría, RLS, CORS restrictivo y cumplimiento colombiano en facturación/POS.

## Objetivo principal

Construir una aplicación clara, mantenible y segura desde el inicio. El módulo más importante debe ser **Pedidos**, porque conecta mesa, QR, domicilio, cocina, caja, pagos, inventario, facturación, clientes y reportes.

## Reglas esenciales

1. Debe existir un único `Owner Plataforma` que administra múltiples compañías/clientes.
2. Cada compañía puede tener múltiples sucursales.
3. Ningún usuario de una compañía puede ver datos de otra compañía.
4. Todas las tablas operativas deben incluir `company_id`.
5. Todas las tablas por sede deben incluir `branch_id`.
6. Debe aplicarse RLS a nivel de base de datos.
7. Debe aplicarse RBAC por roles y permisos.
8. CORS debe ser restrictivo con allowlist exacta.
9. Los módulos de facturación/POS deben estar preparados para Colombia: factura electrónica, documento equivalente electrónico POS, notas crédito/débito, resolución de numeración, integración con proveedor tecnológico, logs DIAN, contingencia y reportes de impuestos.
10. El sistema debe permitir parametrizar IVA e Impuesto Nacional al Consumo para restaurantes, según configuración contable/tributaria.
11. No se deben eliminar pedidos, facturas, pagos ni logs; usar estados y reversos.
12. Todo cambio crítico debe quedar auditado.

## Módulos requeridos

- Administración General.
- Pedidos.
- POS/Caja.
- Facturación Colombia.
- Inventario.
- Compras y Proveedores.
- Finanzas/Contabilidad simplificada.
- Menú y Productos.
- Clientes/CRM.
- Recursos Humanos operativo.
- Reportes y BI.
- Seguridad, auditoría y logs.
- Integraciones.

## Prioridad absoluta: módulo de Pedidos

Debe incluir:

- Pedidos en mesa.
- Pedidos para llevar.
- Pedidos a domicilio.
- Pedidos por QR.
- Pedidos web.
- Comandas de cocina.
- KDS.
- Estados del pedido.
- División de cuenta.
- Propinas.
- Descuentos autorizados.
- Anulaciones con motivo.
- Auditoría completa.
- Integración con caja, inventario y facturación.

Estados:

```text
CREATED -> CONFIRMED -> SENT_TO_KITCHEN -> IN_PREPARATION -> READY -> DELIVERED -> INVOICED -> PAID
```

Estados alternos:

```text
CANCELLED, VOIDED, REFUNDED, PARTIALLY_PAID, PARTIALLY_READY, FAILED_INTEGRATION
```

## Roles requeridos

Nivel plataforma:

- Owner Plataforma.
- Soporte Técnico Plataforma.
- Auditor Plataforma.

Nivel compañía:

- Administrador de Compañía.
- Gerente de Sucursal.
- Cajero.
- Mesero.
- Cocina/Bar.
- Inventario/Bodega.
- Compras.
- Contabilidad/Finanzas.
- Domiciliario.
- Cliente final.

## Permisos mínimos

Crear permisos granulares como:

```text
orders.create
orders.read.own
orders.read.branch
orders.update.before_kitchen
orders.update.after_kitchen
orders.cancel
orders.void
orders.discount.basic
orders.discount.advanced
payments.create
payments.reverse
cash.open
cash.close
invoices.create
invoices.send_dian
pos_document.create
pos_document.send_dian
inventory.adjust
products.update_price
users.create
users.assign_role
roles.update
security.logs.view
companies.create
companies.suspend
owner.maintenance
```

## Seguridad requerida

Implementar:

- RLS por `company_id` y `branch_id`.
- RBAC granular.
- MFA para roles críticos.
- JWT corto y refresh token rotativo.
- Rate limiting.
- CORS restrictivo.
- Validación backend de permisos.
- Auditoría de acciones críticas.
- Protección contra BOLA, Broken Authentication, Broken Function Authorization, Mass Assignment, SSRF, CORS abierto y exposición de datos.

## Cumplimiento Colombia

El módulo de facturación debe considerar:

- Factura electrónica de venta.
- Documento equivalente electrónico POS.
- Notas crédito.
- Notas débito.
- Resoluciones de numeración.
- Proveedor tecnológico DIAN.
- Estados de validación DIAN.
- Reintentos.
- Contingencia.
- Representación gráfica.
- XML o referencia segura al XML.
- IVA parametrizable.
- INC parametrizable.
- Reporte de documentos fiscales.
- Protección de datos personales bajo Ley 1581 de 2012.

## Entregables que debes generar

Primero genera la arquitectura completa antes de programar:

1. Estructura de carpetas recomendada.
2. Modelo de datos inicial.
3. Lista de endpoints API.
4. Matriz de roles y permisos.
5. Diseño de RLS.
6. Diseño de CORS.
7. Flujos del módulo de pedidos.
8. Flujos de facturación/POS Colombia.
9. Componentes frontend.
10. Backlog por épicas.
11. Criterios de aceptación.
12. Riesgos y controles.

## Reglas de implementación

- No avances a codificación sin definir primero entidades, permisos y flujos.
- No uses datos mock como si fueran reales.
- No omitas `company_id` en ninguna tabla transaccional.
- No permitas editar precios desde frontend como fuente de verdad.
- No permitas eliminar documentos fiscales.
- No permitas wildcard CORS en producción.
- No permitas roles con bypass RLS.
- No generes endpoints administrativos accesibles para usuarios operativos.

## Resultado esperado

Genera una aplicación ordenada, segura y lista para evolucionar. Prioriza un MVP sólido con:

- Login.
- Multi-compañía.
- Usuarios/roles/permisos.
- Pedidos en mesa.
- Cocina/KDS básico.
- POS/caja.
- Facturación/POS Colombia preparado para integración.
- Inventario básico por receta.
- Auditoría.
- Reportes iniciales.
