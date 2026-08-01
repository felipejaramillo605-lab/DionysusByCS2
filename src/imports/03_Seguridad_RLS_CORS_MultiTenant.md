# 03 — Seguridad, RLS, CORS y Multi-Tenant

## 1. Objetivo

Definir una arquitectura segura para un ERP restaurante multi-compañía donde el Owner administra múltiples clientes, pero cada cliente mantiene aislamiento total de datos.

## 2. Capas de seguridad

```text
Frontend validation
API authentication
API authorization
Tenant validation
RBAC permissions
RLS database policies
Audit logs
Monitoring and alerts
```

## 3. RBAC

El sistema debe usar control de acceso basado en roles.

### Roles base

- Owner Plataforma.
- Soporte Plataforma.
- Auditor Plataforma.
- Admin Compañía.
- Gerente Sucursal.
- Cajero.
- Mesero.
- Cocina/Bar.
- Inventario.
- Compras.
- Finanzas.
- Domiciliario.
- Cliente.

### Reglas

- No asignar permisos directamente a usuarios salvo excepciones auditadas.
- Todo permiso crítico requiere auditoría.
- MFA obligatorio para Owner, Admin Compañía y Finanzas.
- Separar permisos de lectura, creación, actualización, anulación y exportación.

## 4. RLS — Row Level Security

### 4.1 Regla base

Toda tabla transaccional debe tener columna `company_id` y filtrar por la compañía del usuario autenticado.

```sql
-- Ejemplo conceptual PostgreSQL
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_company_isolation
ON orders
FOR ALL
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);
```

### 4.2 RLS por sucursal

```sql
CREATE POLICY orders_branch_isolation
ON orders
FOR SELECT
USING (
  company_id = current_setting('app.current_company_id')::uuid
  AND branch_id = ANY(string_to_array(current_setting('app.allowed_branch_ids'), ',')::uuid[])
);
```

### 4.3 RLS para mesero

```sql
CREATE POLICY waiter_own_orders
ON orders
FOR SELECT
USING (
  company_id = current_setting('app.current_company_id')::uuid
  AND branch_id = current_setting('app.current_branch_id')::uuid
  AND created_by = current_setting('app.current_user_id')::uuid
);
```

### 4.4 Tablas obligatorias con RLS

- companies
- branches
- users
- products
- customers
- orders
- order_items
- payments
- invoices
- pos_documents
- inventory_movements
- cash_registers
- audit_logs
- integrations
- api_keys

### 4.5 Reglas RLS críticas

- El rol de aplicación no debe tener `BYPASSRLS`.
- No confiar solo en el frontend.
- El backend debe establecer variables de sesión seguras antes de consultar.
- Probar aislamiento con tests automáticos.
- Los logs del Owner deben guardar la compañía consultada.

## 5. CORS

### 5.1 Regla

No usar wildcard para producción.

```text
Access-Control-Allow-Origin: *  // Prohibido en producción
```

### 5.2 Allowlist recomendada

```text
https://app.erp-restaurante.com
https://admin.erp-restaurante.com
https://pos.erp-restaurante.com
https://kds.erp-restaurante.com
https://cliente1.erp-restaurante.com
```

### 5.3 Reglas

- Validar origen exacto.
- No reflejar ciegamente el header `Origin`.
- No permitir credenciales con wildcard.
- Configurar ambientes separados: dev, staging, prod.
- CORS no reemplaza autenticación, autorización ni CSRF.

## 6. Vulnerabilidades principales y controles

### 6.1 BOLA — Broken Object Level Authorization

Riesgo: usuario cambia un ID y accede a pedido de otra compañía.

Controles:

- RLS.
- Validación de `company_id` en backend.
- UUIDs.
- Tests de autorización por objeto.
- Logs de intentos denegados.

### 6.2 Broken Authentication

Controles:

- MFA.
- JWT corto.
- Refresh token rotativo.
- Hash seguro de contraseñas.
- Bloqueo por intentos fallidos.
- Revocación de sesiones.

### 6.3 Broken Function Level Authorization

Controles:

- Permisos por endpoint.
- Separación de rutas admin y operativas.
- MFA para acciones críticas.
- Auditoría.

### 6.4 Mass Assignment

Controles:

- DTOs por acción.
- Ignorar campos sensibles del frontend.
- No permitir enviar `company_id`, `total`, `tax`, `price` desde frontend como fuente de verdad.
- Calcular precios e impuestos en backend.

### 6.5 CORS abierto

Controles:

- Allowlist exacta.
- Ambientes separados.
- Configuración por tenant solo validada por backend.

### 6.6 Exposición de logs

Controles:

- Enmascarar tokens, claves y datos sensibles.
- Separar logs técnicos y logs funcionales.
- Retención definida.
- Acceso limitado.

### 6.7 Consumo excesivo de recursos

Controles:

- Rate limits por IP, usuario y tenant.
- Paginación obligatoria.
- Límites de exportaciones.
- Colas para reportes pesados.

## 7. Auditoría

### Logs obligatorios

- Login exitoso/fallido.
- Creación de usuario.
- Cambio de rol.
- Cambio de permiso.
- Creación/edición/cancelación de pedido.
- Descuento aplicado.
- Anulación.
- Emisión de documento fiscal.
- Reintento DIAN.
- Cambio de precio.
- Cambio de impuestos.
- Exportación de reportes.
- Acceso Owner a compañía.

### Campos mínimos

```text
id
company_id
branch_id
user_id
action
resource_type
resource_id
old_value
new_value
ip_address
user_agent
created_at
risk_level
```

## 8. Seguridad del módulo de pedidos

- El frontend nunca define precio final.
- El backend recalcula subtotal, impuestos, descuentos y total.
- Descuentos altos requieren autorización.
- Estados deben seguir máquina de estados.
- No se puede facturar un pedido cancelado.
- No se puede editar un pedido pagado.
- No se puede eliminar un pedido.
- Usar idempotency key para pedidos QR/web/delivery.
- Usar colas para cocina e integraciones.

## 9. Tests mínimos de seguridad

- Usuario compañía A no ve pedidos compañía B.
- Cajero no puede cambiar precios.
- Mesero no puede anular factura.
- Cocina no ve datos financieros.
- Cliente no ve pedidos de otros clientes.
- Owner accede a compañía y se genera log.
- API rechaza `company_id` manipulado.
- CORS rechaza origen no permitido.
- RLS bloquea consulta directa sin policy.
