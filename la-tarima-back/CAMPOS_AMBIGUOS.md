# Guía de Campos Ambiguos y Patrones de Uso

## 1. Reservations: clientRef vs guest

### clientRef (Cliente Registrado)
- **Cuándo usar:** Cuando el cliente YA EXISTE en la base de datos
- **Campos requeridos:** `docID` (documento de identidad)
- **Ejemplo:**
```json
{
  "clientRef": {
    "fullname": "Juan García",
    "docID": "1234567890"
  },
  "guest": null
}
```

### guest (Cliente No Registrado)
- **Cuándo usar:** Cuando el cliente es un visitante sin registro previo
- **Campos:** `fullname` (obligatorio), `phone` (opcional), `notes` (opcional)
- **Ejemplo:**
```json
{
  "clientRef": null,
  "guest": {
    "fullname": "María López",
    "phone": "+57-312-1234567",
    "notes": "Prefiere mesa junto a la ventana"
  }
}
```

### ⚠️ IMPORTANTE
- **Una reserva NO puede tener ambos** clientRef y guest al mismo tiempo
- **Una reserva DEBE tener uno** de los dos
- El validador pre-save rechazará reservas que violen estas reglas

---

## 2. Orders: clientHint

### Definición
Campo de texto libre para identificar o referencia rápida al cliente en el contexto de un pedido.

### Ejemplos de uso:
```javascript
// Opción 1: Repetir nombre del cliente para referencia rápida
{
  "order_id": "ORD_0001",
  "clientHint": "Juan García",
  ...
}

// Opción 2: Usando referencia de mesa
{
  "clientHint": "Mesa 5 - Piso 1",
  ...
}

// Opción 3: Preferencias del cliente
{
  "clientHint": "Sin picante, alérgico a camarón",
  ...
}
```

### ℹ️ NOTA
- Campo **OPCIONAL**
- Usado principalmente por meseros para referencia rápida
- No tiene validación específica (solo trim)
- Se recomienda mantener < 100 caracteres

---

## 3. Payments: scope

### Definición
Define el alcance o nivel de aplicación del pago.

### scope: 'reservation'
- Pago a nivel de **reserva completa**
- Cubre TODOS los órdenes de la reserva
- **Cuándo usar:** Cliente paga la cuenta completa de una vez
- **Ejemplo:** Cena para 4 personas, un cliente paga todo

```javascript
{
  "payment_id": "PAY_0001",
  "reservation_id": "RES_0001",
  "order_id": null,  // ← NO aplica
  "scope": "reservation",
  "amount": 250000,  // Total de la reserva
  ...
}
```

### scope: 'order'
- Pago a nivel de **orden individual**
- Cubre SOLO ese orden específico
- **Requiere:** `order_id` obligatoriamente
- **Cuándo usar:** Dividir la cuenta por órdenes

```javascript
{
  "payment_id": "PAY_0002",
  "reservation_id": "RES_0001",
  "order_id": "ORD_0005",  // ← REQUERIDO
  "scope": "order",
  "amount": 85000,  // Solo este orden
  ...
}
```

### 🔴 VALIDACIÓN
- Si `scope: 'order'` pero `order_id` es nulo → **Error**
- El validador pre-save rechazará esta combinación

---

## 4. Payments: split (Pago Dividido)

### Definición
Permite registrar pagos fraccionados de una misma cuenta.

### Campos:
- `part`: Número de la parte (1, 2, 3, ...)
- `totalParts`: Total de partes en que se divide

### Ejemplo: Cuenta dividida entre 3 personas
```javascript
// Persona 1
{
  "payment_id": "PAY_0001",
  "amount": 83333,
  "split": {
    "part": 1,
    "totalParts": 3
  }
}

// Persona 2
{
  "payment_id": "PAY_0002",
  "amount": 83333,
  "split": {
    "part": 2,
    "totalParts": 3
  }
}

// Persona 3
{
  "payment_id": "PAY_0003",
  "amount": 83334,
  "split": {
    "part": 3,
    "totalParts": 3
  }
}
```

### 🔴 VALIDACIONES
- `part` DEBE ser ≤ `totalParts`
- Si `part: 5` y `totalParts: 3` → **Error**
- El validador pre-save rechazará

### ℹ️ CÁLCULO
- Suma de todos los `amount` en splits = Total de la orden/reserva
- El backend NO valida la suma automáticamente

---

## 5. Table: currentStatus

### Estados Posibles:
| Estado | Descripción |
|--------|------------|
| `libre` | Mesa disponible para reserva |
| `reservada` | Mesa tiene reserva confirmada |
| `en_atencion` | Clientes siendo atendidos |
| `limpieza` | En proceso de limpieza |

### Transiciones Automáticas (sincronizadas con Reservation):
```
Reservation Status → Table Status
'confirmada'       → 'reservada'
'en_curso'         → 'en_atencion'
'completada'       → 'limpieza'
'cancelada'        → 'libre'
```

### Ejemplo:
```javascript
// Cuando se confirma una reserva
await Table.updateOne(
  { table_id: 'T_001' },
  { currentStatus: 'reservada' }
)

// Cuando se inicia la reserva
await Table.updateOne(
  { table_id: 'T_001' },
  { currentStatus: 'en_atencion' }
)
```

---

## 6. Reservations: appliedCoupons

### Definición
Array de descuentos/cupones aplicados a la reserva.

### Campos:
- `discount_id`: ID único del descuento
- `code`: Código del cupón (ej: "SUMMER2024")
- `type`: 'percentage' o 'fixed'
- `value`: Valor del descuento (porcentaje o monto fijo)
- `stackable`: Si puede combinarse con otros cupones
- `consumed`: Si fue utilizado en un pago

### Estados del Cupón:
```javascript
// No utilizado
{
  ...
  "consumed": false
}

// Utilizado en un pago aprobado
{
  ...
  "consumed": true,
  "consumedAt": "2024-05-08T10:30:00Z"
}
```

### Lógica de Aplicación:
```
1. Cliente solicita aplicar cupón
2. Sistema verifica: ¿es válido? ¿no consumido?
3. Si válido → se agrega a appliedCoupons
4. En primer pago aprobado:
   - Se marca como consumed: true
   - Se registra en el descuento cuántas veces fue usado
   - Se previene uso duplicado
```

### Flujo de Ejemplo:
```javascript
// 1. Crear reserva
POST /api/reservations
{
  "reservation_id": "RES_0001",
  ...
  "appliedCoupons": []  // Vacío inicialmente
}

// 2. Aplicar cupón
POST /api/reservations-account/RES_0001/apply-coupon
{
  "discount_id": "DESC_001",
  "code": "VERANO50"
}

// 3. Resultado: cupón en appliedCoupons (no consumido)
{
  "appliedCoupons": [
    {
      "discount_id": "DESC_001",
      "code": "VERANO50",
      "consumed": false
    }
  ]
}

// 4. Al pagar y aprobar
POST /api/payments
{
  "reservation_id": "RES_0001",
  "status": "aprobado"
}

// 5. Resultado: cupón se marca como consumido
{
  "appliedCoupons": [
    {
      "discount_id": "DESC_001",
      "code": "VERANO50",
      "consumed": true,
      "consumedAt": "2024-05-08T10:45:00Z"
    }
  ]
}
```

---

## Resumen de Cambios en Validación

| Modelo | Campo | Cambio |
|--------|-------|--------|
| Reservation | clientRef / guest | Ahora mutuamente exclusivos (validador pre-save) |
| Payment | scope + order_id | Si scope='order' → order_id requerido |
| Payment | split.part/totalParts | Validación: part ≤ totalParts |
| Table | currentStatus | Nuevo campo con estados validados |
| Client/Staff | email | Regex mejorado de validación |

---

**Última actualización:** 8 de mayo de 2026
