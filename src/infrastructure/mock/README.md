# Mock infrastructure adapters

Temporary adapters belong here while the current prototype is migrated behind repository contracts.

Rules:

- Mock adapters may import from `src/domain`.
- Domain code must never import React, components, context, Vite, Supabase, or infrastructure.
- UI components must not depend directly on Supabase clients.
- Supabase adapters will later live in `src/infrastructure/supabase` and implement the same repository interfaces.
