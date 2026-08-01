# ERP Restaurante Multi-Compañía Colombia — Paquete para Manus.im

Este paquete contiene la especificación funcional, técnica, de seguridad y cumplimiento colombiano para construir una aplicación ERP de restaurantes multi-compañía, con foco principal en el módulo de pedidos.

## Archivos incluidos

1. `01_PRD_ERP_Restaurante_Colombia.md`  
   Documento principal del producto: módulos, submódulos, roles, permisos, flujos y requerimientos.

2. `02_Compliance_Colombia_Facturacion_POS.md`  
   Reglas de cumplimiento para Colombia: facturación electrónica, documento equivalente electrónico POS, impuestos de restaurante, protección de datos y auditoría.

3. `03_Seguridad_RLS_CORS_MultiTenant.md`  
   Arquitectura de seguridad: RLS, RBAC, CORS, vulnerabilidades OWASP API, logs, auditoría y controles multi-tenant.

4. `04_Backlog_Tecnico_Manus.json`  
   Backlog estructurado en formato JSON para que Manus o un agente de desarrollo pueda convertirlo en tareas.

5. `05_Prompt_Completo_Para_Manus.md`  
   Prompt listo para copiar y pegar en Manus.im desde el inicio del proyecto.

## Supuesto central

La aplicación debe permitir que un único `Owner Plataforma` administre múltiples compañías/restaurantes, sus usuarios, seguridad, logs, planes, mantenimiento e integraciones, sin mezclar información entre compañías.

## Nota legal

Este documento sirve como base funcional y técnica. Antes de salir a producción, la implementación de facturación electrónica, documento equivalente electrónico POS, tratamiento de datos personales y reportes fiscales debe ser validada con contador, abogado tributario o proveedor tecnológico autorizado en Colombia.
