# 02 — Cumplimiento Colombia: Facturación, POS, Impuestos y Datos

## 1. Alcance

Este documento define reglas funcionales y técnicas para que los módulos de facturación, POS, pagos, clientes, reportes fiscales e integraciones del ERP estén preparados para operar en Colombia.

> Nota: Esta es una guía de diseño. La implementación final debe validarse con contador, abogado tributario y/o proveedor tecnológico autorizado.

## 2. Normativa base a considerar

- La Resolución DIAN 000165 de 2023 desarrolla el sistema de facturación, proveedores tecnológicos, adopta la versión 1.9 del anexo técnico de factura electrónica de venta y expide el anexo técnico 1.0 del documento equivalente electrónico.
- La Resolución DIAN 000008 de 2024 modificó el calendario de implementación del documento equivalente electrónico y ajustó parcialmente la Resolución 000165 de 2023.
- Para el documento equivalente electrónico tiquete de máquina registradora con sistema POS, la DIAN indica que debe identificarse al adquirente con nombre/razón social y número de identificación, indicar cantidad, unidad de medida, descripción específica y códigos que permitan identificar bienes o servicios.
- La DIAN indica que quienes opten por el documento equivalente electrónico POS deben usar desarrollos tecnológicos que permitan programar, controlar y ejecutar funciones inherentes al punto de venta e identificar bienes/servicios, departamento y tarifa de IVA o impuesto nacional al consumo asociada.
- El Estatuto Tributario, artículo 512-1, incluye como hecho generador del Impuesto Nacional al Consumo el expendio de comidas y bebidas preparadas en restaurantes, cafeterías, autoservicios, heladerías, fruterías, pastelerías y panaderías, incluyendo consumo en sitio, para llevar o domicilio, según reglas aplicables.
- La Ley 1581 de 2012 regula la protección de datos personales y reconoce derechos de conocer, actualizar y rectificar información en bases de datos o archivos, aplicable a datos tratados por entidades públicas o privadas en Colombia.

## 3. Módulo de Facturación Electrónica

### 3.1 Objetivo

Permitir generar, transmitir, consultar, reintentar y auditar documentos fiscales electrónicos asociados a ventas del restaurante.

### 3.2 Tipos documentales mínimos

- Factura electrónica de venta.
- Documento equivalente electrónico POS.
- Nota crédito.
- Nota débito.
- Documento de contingencia, si aplica según reglas del proveedor y DIAN.
- Representación gráfica.

### 3.3 Estados de documento fiscal

```text
DRAFT
READY_TO_SEND
SENT_TO_PROVIDER
VALIDATED_BY_DIAN
REJECTED_BY_DIAN
FAILED_PROVIDER
CONTINGENCY
DELIVERED_TO_CUSTOMER
VOIDED
CREDITED
```

### 3.4 Campos mínimos por documento

Cada documento fiscal debe registrar, como mínimo:

- `company_id`.
- `branch_id`.
- `order_id`.
- Tipo de documento.
- Consecutivo interno.
- Prefijo, si aplica.
- Resolución de numeración, si aplica.
- Fecha y hora de generación.
- Fecha y hora de transmisión.
- Identificación del emisor.
- Identificación del adquirente cuando aplique.
- Subtotal.
- Impuestos discriminados.
- INC cuando aplique.
- Total.
- Medio de pago.
- Moneda COP.
- CUFE/CUDE o identificador retornado.
- Estado DIAN/proveedor.
- XML o referencia segura al XML.
- Representación gráfica o referencia segura.
- Log de validación.

## 4. Documento equivalente electrónico POS

### 4.1 Cuándo usarlo

Usarlo para ventas POS de restaurante cuando el cliente no solicita factura electrónica de venta y la compañía está habilitada para emitir documento equivalente electrónico POS.

### 4.2 Reglas funcionales

- El cajero no debe escoger manualmente reglas tributarias complejas; el sistema debe decidir si corresponde POS electrónico o factura electrónica según canal, datos del cliente y configuración.
- Debe permitir identificar al adquirente cuando aplique.
- Debe discriminar productos/servicios, cantidades, unidades, impuestos y total.
- Debe registrar medio de pago.
- Debe generar trazabilidad de envío, respuesta, rechazo y reintento.
- Debe impedir la reutilización de consecutivos.
- Debe soportar contingencia cuando el proveedor tecnológico o la DIAN no estén disponibles, conforme a la parametrización legal validada.

### 4.3 Reglas de seguridad

- Solo roles autorizados pueden emitir, reintentar, anular o generar notas asociadas.
- No se permite editar un documento POS electrónico validado; cualquier corrección se hace por nota o flujo permitido.
- Los consecutivos no deben ser editables desde frontend.
- Cambios de resolución deben requerir MFA y auditoría.

## 5. Impuestos para restaurantes

### 5.1 Impuesto Nacional al Consumo — INC

El ERP debe permitir configurar el INC para productos/servicios de restaurante cuando aplique. El artículo 512-1 del Estatuto Tributario incluye el servicio de expendio de comidas y bebidas preparadas en restaurantes y similares, para consumo en sitio, llevar o domicilio.

### 5.2 IVA

El sistema debe permitir configurar IVA por producto, categoría, compañía y sucursal. También debe permitir productos excluidos, exentos o gravados, de acuerdo con parametrización tributaria del contador.

### 5.3 Propinas

El sistema debe separar el valor de la propina del valor de venta y de los impuestos, según parametrización contable y legal aplicable. La propina debe poder ser sugerida, aceptada, rechazada o modificada por el cliente cuando la operación lo permita.

### 5.4 Franquicias

El ERP debe permitir marcar si la compañía opera bajo franquicia, concesión, regalía u otro modelo especial, porque esto puede afectar el tratamiento tributario. Esta parametrización debe ser definida por contador/abogado tributario.

## 6. Protección de datos personales

### 6.1 Datos personales tratados

- Nombre del cliente.
- Identificación.
- Teléfono.
- Correo.
- Dirección.
- Historial de pedidos.
- Preferencias.
- Datos de empleados.
- Datos de proveedores.

### 6.2 Reglas mínimas

- Solicitar autorización de tratamiento de datos cuando aplique.
- Mantener finalidad clara: facturación, entrega, soporte, fidelización, comunicaciones autorizadas.
- Permitir consulta, actualización, rectificación y supresión cuando legalmente proceda.
- No recolectar datos sensibles innecesarios.
- Cifrar datos sensibles en reposo.
- Limitar acceso por rol.
- Registrar auditoría de consultas masivas/exportaciones.
- Permitir anonimización para analítica cuando sea posible.

## 7. Reportes fiscales y contables

Reportes mínimos:

- Ventas por día, mes y rango.
- Ventas por producto.
- Ventas por compañía.
- Ventas por sucursal.
- Ventas por medio de pago.
- Impuestos discriminados.
- INC generado.
- IVA generado.
- Documentos enviados a DIAN.
- Documentos rechazados.
- Documentos en contingencia.
- Notas crédito/débito.
- Anulaciones.
- Exportación para contador.

## 8. Integración con proveedor tecnológico

El diseño debe asumir integración con proveedor tecnológico autorizado o servicio DIAN, no implementación manual directa sin validación.

### Eventos a registrar

- Documento creado.
- XML generado.
- Enviado a proveedor.
- Aceptado por proveedor.
- Validado por DIAN.
- Rechazado por DIAN.
- Reintento ejecutado.
- Contingencia activada.
- Documento entregado al cliente.

## 9. Checklist de cumplimiento antes de producción

- Validar tipo de documento aplicable con contador.
- Validar tratamiento de IVA/INC por producto.
- Validar resolución de numeración.
- Validar proveedor tecnológico.
- Validar generación de XML/representación gráfica.
- Validar contingencia.
- Validar retención y almacenamiento documental.
- Validar política de tratamiento de datos personales.
- Validar términos y condiciones para pedidos QR/web.
- Validar logs y auditoría.
