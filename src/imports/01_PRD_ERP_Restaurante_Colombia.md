# 01 — PRD ERP Restaurante Multi-Compañía Colombia

## 1. Objetivo del producto

Construir un ERP web para restaurantes pequeños y medianos en Colombia, con arquitectura multi-compañía, multi-sucursal y control centralizado por un único `Owner Plataforma`. El sistema debe ser más simple que Oracle ERP Cloud o SAP Business One, pero conservar principios empresariales: roles, permisos, auditoría, trazabilidad, segregación de datos, cumplimiento tributario y seguridad.

## 2. Principios de diseño

- El módulo de **Pedidos** es el núcleo operativo y debe tener prioridad en rendimiento, seguridad y experiencia de usuario.
- Todo registro operativo debe pertenecer a una `company_id`.
- Todo registro de sucursal debe pertenecer a una `branch_id`.
- Ningún usuario de una compañía puede acceder a datos de otra compañía.
- El Owner puede administrar clientes/compañías, pero sus acciones deben quedar auditadas.
- La aplicación debe estar preparada para Colombia: DIAN, POS electrónico, impuestos, datos personales, auditoría y reportes.

## 3. Estructura multi-compañía

```text
Owner Plataforma
│
├── Compañía A
│   ├── Sucursal 1
│   ├── Sucursal 2
│   └── Usuarios
│
├── Compañía B
│   ├── Sucursal 1
│   └── Usuarios
│
└── Compañía C
    ├── Sucursal 1
    ├── Sucursal 2
    └── Usuarios
```

## 4. Módulos principales

### 4.1 Administración General

Submódulos:

- Compañías/clientes.
- Sucursales.
- Parámetros generales.
- Monedas.
- Impuestos.
- Horarios.
- Mesas, zonas y salones.
- Numeración documental.
- Planes/licencias.
- Plantillas de roles.
- Configuración de integraciones.

Funcionalidades:

- Crear, editar, suspender y activar compañías.
- Crear múltiples sucursales por compañía.
- Asignar plan contratado.
- Activar o desactivar módulos por compañía.
- Configurar datos fiscales colombianos: NIT, razón social, responsabilidades tributarias, régimen, dirección, municipio, departamento y resolución de numeración.

### 4.2 Pedidos — Módulo crítico

Submódulos:

- Pedidos en mesa.
- Pedidos para llevar.
- Pedidos a domicilio.
- Pedidos por QR.
- Pedidos web.
- Pedidos por WhatsApp/integraciones.
- Comandas de cocina.
- Pantalla KDS.
- Estados del pedido.
- Motor de promociones.
- Descuentos autorizados.
- División de cuentas.
- Propinas.
- Reversos/anulaciones.
- Auditoría del pedido.

Estados mínimos:

```text
CREATED -> CONFIRMED -> SENT_TO_KITCHEN -> IN_PREPARATION -> READY -> DELIVERED -> INVOICED -> PAID
```

Estados alternos:

```text
CANCELLED
VOIDED
REFUNDED
PARTIALLY_PAID
PARTIALLY_READY
FAILED_INTEGRATION
```

Reglas críticas:

- No eliminar pedidos; solo cancelar, anular o reversar.
- No editar productos después de facturar, salvo flujo de nota crédito/reverso.
- Cualquier descuento debe registrar usuario, porcentaje, motivo y autorización si supera el límite.
- Toda anulación debe registrar motivo y usuario autorizador.
- Cada cambio de estado debe quedar en `order_status_history`.
- Debe existir idempotencia para evitar pedidos duplicados.
- La creación de pedidos debe ser rápida y no depender directamente de integraciones externas.

Requerimientos de rendimiento:

- Crear pedido en menos de 500 ms bajo operación normal.
- Cachear menú, precios y disponibilidad.
- Usar colas para envío a cocina, logs, notificaciones e integraciones.
- Manejar concurrencia con versionado del pedido.
- Indexar `company_id`, `branch_id`, `status`, `created_at`, `table_id`, `created_by`.

### 4.3 POS / Caja

Submódulos:

- Apertura de caja.
- Cierre de caja.
- Arqueo.
- Medios de pago.
- Pagos divididos.
- Propinas.
- Facturación electrónica.
- Documento equivalente electrónico POS.
- Notas crédito.
- Notas débito.
- Reversos.
- Reporte de caja.

Reglas:

- No se puede facturar sin caja abierta, salvo permiso especial.
- Todo pago debe asociarse a un pedido, factura o documento equivalente.
- No se deben modificar pagos confirmados; usar reversos.
- Las diferencias de caja deben quedar registradas y justificadas.

### 4.4 Facturación y cumplimiento DIAN

Submódulos:

- Configuración fiscal de compañía.
- Resoluciones de numeración.
- Factura electrónica de venta.
- Documento equivalente electrónico POS.
- Notas crédito/débito.
- Eventos/respuestas de proveedor tecnológico.
- Representación gráfica.
- XML/UBL según proveedor tecnológico.
- Logs de validación DIAN.
- Reintentos por fallos técnicos.
- Contingencia.

Reglas:

- Permitir parametrizar si la venta genera factura electrónica o documento equivalente electrónico POS.
- Generar documento fiscal solo con datos mínimos requeridos.
- Permitir identificación de adquirente cuando aplique.
- Guardar CUFE/CUDE o identificadores equivalentes devueltos por proveedor tecnológico/DIAN.
- Registrar estado: `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `FAILED`, `CONTINGENCY`, `VOIDED`.
- No permitir manipular consecutivos manualmente sin permiso crítico.

### 4.5 Inventario

Submódulos:

- Productos.
- Ingredientes.
- Recetas.
- Bodegas.
- Entradas.
- Salidas.
- Traslados.
- Ajustes.
- Mermas.
- Lotes.
- Vencimientos.
- Costeo por receta.

Reglas:

- Descontar inventario por receta al confirmar/preparar pedido, según parámetro de la compañía.
- Permitir conteos físicos por sucursal.
- Ajustes significativos requieren autorización.
- Cada movimiento debe tener `company_id`, `branch_id`, tipo, cantidad, costo, usuario y motivo.

### 4.6 Compras y Proveedores

Submódulos:

- Proveedores.
- Solicitudes de compra.
- Órdenes de compra.
- Recepción.
- Facturas de proveedor.
- Cuentas por pagar.
- Devoluciones.
- Evaluación de proveedor.

### 4.7 Finanzas y Contabilidad Simplificada

Submódulos:

- Plan de cuentas opcional.
- Cuentas por cobrar.
- Cuentas por pagar.
- Bancos.
- Conciliaciones.
- Impuestos.
- Centros de costo.
- Exportación contable.
- Reportes por compañía y sucursal.

### 4.8 Menú y Productos

Submódulos:

- Categorías.
- Productos.
- Modificadores.
- Adiciones.
- Combos.
- Precios por canal.
- Precios por sucursal.
- Disponibilidad.
- Fotos.
- Impuestos por producto.

### 4.9 Clientes / CRM

Submódulos:

- Clientes.
- Direcciones.
- Historial de pedidos.
- Puntos/fidelización.
- Cupones.
- Reclamos.
- Preferencias.
- Consentimiento de tratamiento de datos.

### 4.10 Recursos Humanos Operativo

Submódulos:

- Empleados.
- Turnos.
- Asistencia.
- Propinas.
- Comisiones.
- Documentos.
- Permisos.

### 4.11 Reportes y BI

Submódulos:

- Ventas.
- Pedidos.
- Caja.
- Inventario.
- Productos más vendidos.
- Rentabilidad.
- Impuestos.
- Anulaciones.
- Descuentos.
- Seguridad.
- Reportes Owner multi-compañía.

### 4.12 Seguridad, auditoría y logs

Submódulos:

- Usuarios.
- Roles.
- Permisos.
- Sesiones.
- MFA.
- Logs de acceso.
- Logs de pedidos.
- Logs de facturación.
- Logs de integraciones.
- Logs de seguridad.
- Administración de API keys.
- Alertas.

### 4.13 Integraciones

Submódulos:

- Proveedor tecnológico DIAN.
- Pasarelas de pago.
- WhatsApp.
- Apps delivery.
- Impresoras POS.
- KDS.
- Contabilidad externa.
- Webhooks.
- API pública controlada.

## 5. Roles

### Nivel plataforma

- Owner Plataforma.
- Soporte Técnico Plataforma.
- Auditor Plataforma.

### Nivel compañía

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

## 6. Permisos granulares sugeridos

```text
orders.create
orders.read.own
orders.read.branch
orders.read.company
orders.update.before_kitchen
orders.update.after_kitchen
orders.cancel
orders.void
orders.discount.basic
orders.discount.advanced
orders.send_to_kitchen
orders.change_status
payments.create
payments.reverse
cash.open
cash.close
cash.audit
invoices.create
invoices.send_dian
invoices.retry_dian
invoices.credit_note
pos_document.create
pos_document.send_dian
inventory.adjust
inventory.transfer
products.create
products.update_price
users.create
users.assign_role
roles.update
security.logs.view
companies.create
companies.suspend
owner.maintenance
```

## 7. Entidades mínimas de datos

- companies
- branches
- users
- roles
- permissions
- role_permissions
- user_roles
- products
- categories
- menus
- recipes
- ingredients
- tables
- orders
- order_items
- order_status_history
- payments
- invoices
- pos_documents
- dian_events
- cash_registers
- inventory_movements
- suppliers
- purchases
- customers
- audit_logs
- integration_logs
- api_keys
- sessions

## 8. Criterios de aceptación globales

- Un usuario de una compañía no puede ver pedidos, clientes, productos, facturas o logs de otra compañía.
- El Owner puede entrar a modo soporte por compañía, pero toda acción queda auditada.
- El módulo de pedidos funciona aunque el proveedor DIAN esté temporalmente caído.
- El sistema permite generar factura electrónica o documento equivalente electrónico POS según corresponda.
- No existen eliminaciones físicas de registros críticos; se usa estado lógico y auditoría.
- Todas las rutas API validan autenticación, autorización, tenant y permisos.
