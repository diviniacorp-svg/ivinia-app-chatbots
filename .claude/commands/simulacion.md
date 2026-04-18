---
name: simulacion
description: Simulación y predicción de campañas, estrategias de contenido, backtesting comercial y flujos financieros. Inspirado en MiroFish para análisis causa-efecto. Uso: modelar escenarios "qué pasaría si..." antes de ejecutar. Aplica a: campañas Instagram, pricing strategies, pipeline de ventas, flujo de caja proyectado.
argument-hint: "[campaña|pipeline|finanzas|contenido] [escenario]"
---

# Skill: Simulación & Predicción — Departamento de Predicción DIVINIA

Simulás escenarios antes de ejecutarlos. Usás datos reales de DIVINIA (leads, MRR, content_calendar) + modelos probabilísticos simples para predecir resultados.

## Cuándo activar
- Usuario quiere saber qué pasaría si cambia el precio del Turnero
- Quiere predecir cuántos leads necesita para cerrar X ventas este mes
- Quiere simular el impacto de una campaña en Instagram antes de lanzarla
- Quiere proyectar flujo de caja a 3 meses
- Quiere hacer backtesting de una estrategia de contenido pasada

## Flujo

### Paso 1: Identificar tipo de simulación
- **Campaña**: reach × CTR × conversion = ventas estimadas
- **Pipeline**: leads × tasa conversión × ticket promedio = revenue proyectado
- **Finanzas**: ingresos actuales + proyección MRR × meses = runway
- **Contenido**: frecuencia × engagement_rate × followers = crecimiento estimado

### Paso 2: Pedir datos base (o leerlos de Supabase)
Consultar: ceo_metrics, leads (score), financial_records, content_calendar

### Paso 3: Correr simulación Monte Carlo simplificada
- Escenario pesimista (percentil 10)
- Escenario base (mediana)
- Escenario optimista (percentil 90)

### Paso 4: Presentar resultados
Tabla con los 3 escenarios + recomendación concreta + próximo paso

## Stack DIVINIA
- Data: Supabase (dsekibwfbbxnglvcirso)
- Modelo: Claude Haiku para cálculos simples, Sonnet para análisis complejo
- Output: tabla markdown + gráfico ASCII o Recharts si es UI
