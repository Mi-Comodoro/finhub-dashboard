# BudgetDonutChart Component

Donut chart component for visualizing budget distribution across categories (needs, wants, savings) with optional advanced analytics.

## Versions

### v1 - BudgetDonutChart (Original)
Basic donut chart with category breakdown and percentages.

### v2 - BudgetDonutChartEnhanced (New)
Advanced version with trend analysis, health indicators, and period comparisons.

---

## Installation & Usage

### Basic Usage (v1)

```vue
<script setup lang="ts">
import { BudgetDonutChart } from '@/components/molecules/budget-donut-chart'

const items = [
  {
    id: 'needs',
    name: 'Gastos Fijos',
    type: 'needs',
    budgeted: 50000,
    percentage: 50
  },
  {
    id: 'wants',
    name: 'Gastos Variables',
    type: 'wants',
    budgeted: 30000,
    percentage: 30
  },
  {
    id: 'savings',
    name: 'Ahorro',
    type: 'savings',
    budgeted: 20000,
    percentage: 20
  }
]
</script>

<template>
  <BudgetDonutChart
    :items="items"
    :total="100000"
    currency="COP"
    :show-legend="true"
  />
</template>
```

### Enhanced Usage (v2)

```vue
<script setup lang="ts">
import { BudgetDonutChartEnhanced } from '@/components/molecules/budget-donut-chart'
import type { BudgetDonutItemEnhanced } from '@/components/molecules/budget-donut-chart'

const items: BudgetDonutItemEnhanced[] = [
  {
    id: 'needs',
    name: 'Gastos Fijos',
    type: 'needs',
    budgeted: 50000,
    spent: 45000,
    percentage: 50,
    utilization: 90,
    health: 'warning',
    trend: {
      direction: 'up',
      percentageChange: 10,
      previousValue: 40000
    }
  },
  // ... more items
]
</script>

<template>
  <BudgetDonutChartEnhanced
    :items="items"
    :total="100000"
    currency="COP"
    :show-legend="true"
    :show-trends="true"
    :show-health-indicators="true"
    :enable-hover-details="true"
    :comparison-enabled="true"
  />
</template>
```

---

## Props

### BudgetDonutChart (v1)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BudgetDonutItem[]` | `[]` | Budget items to display |
| `total` | `number` | `0` | Total budget amount |
| `currency` | `Currency` | `'COP'` | Currency code for formatting |
| `showLegend` | `boolean` | `true` | Show legend beside chart |

### BudgetDonutChartEnhanced (v2)

Extends all v1 props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BudgetDonutItemEnhanced[]` | `[]` | Enhanced budget items with analytics |
| `showTrends` | `boolean` | `true` | Show trend indicators (↑↓→) |
| `showHealthIndicators` | `boolean` | `true` | Show health status rings |
| `enableHoverDetails` | `boolean` | `true` | Enable detailed tooltips on hover |
| `comparisonEnabled` | `boolean` | `false` | Fetch and compare with previous period |

---

## Types

### BudgetDonutItem (v1)

```typescript
interface BudgetDonutItem {
  id: string
  name: string
  type: 'needs' | 'wants' | 'savings'
  budgeted: number
  percentage: number
}
```

### BudgetDonutItemEnhanced (v2)

```typescript
interface BudgetDonutItemEnhanced extends BudgetDonutItem {
  spent: number
  trend?: {
    direction: 'up' | 'down' | 'stable' | 'new'
    percentageChange: number
    previousValue: number
  }
  health?: 'healthy' | 'warning' | 'critical' | 'neutral'
  utilization?: number
}
```

---

## Features

### v1 Features
- ✅ Donut chart visualization
- ✅ Category breakdown (needs/wants/savings)
- ✅ Percentage display
- ✅ Color-coded segments
- ✅ Legend with amounts
- ✅ Responsive layout
- ✅ Dark mode support

### v2 Additional Features
- ✅ **Enhanced Tooltips**: Show budgeted, spent, remaining, and utilization
- ✅ **Trend Indicators**: Compare vs previous period (↑↓→)
- ✅ **Health Status**: Visual health rings (green/yellow/red)
- ✅ **Utilization Bars**: Mini progress bars in legend
- ✅ **Hover Animations**: Scale and shadow effects
- ✅ **Period Comparison**: Automatic comparison with previous month
- ✅ **Smart Health Calculation**:
  - Healthy: < 70% utilization
  - Warning: 70-90% utilization
  - Critical: > 90% utilization

---

## Architecture

### Hexagonal Architecture Compliance

```
src/
├── components/molecules/budget-donut-chart/
│   ├── BudgetDonutChart.vue              # v1 component
│   ├── BudgetDonutChartEnhanced.vue      # v2 component
│   ├── types/
│   │   ├── budget-donut-chart.types.ts
│   │   └── budget-donut-chart-enhanced.types.ts
│   └── utils/
│       └── donut-chart.utils.ts          # Visual helpers
├── composables/
│   ├── application/
│   │   └── useBudgetComparisonApplication.ts  # Business logic
│   └── presenters/
│       └── useBudgetDonutPresenter.ts         # Presentation logic
```

### Separation of Concerns

1. **Components**: Pure presentation, receive props and emit events
2. **Presenters**: Transform data for UI (colors, formatting, calculations)
3. **Application**: Business logic (data fetching, aggregation)
4. **Utils**: Visual helpers (colors, gradients, animations)

---

## Health Status Logic

Health status is calculated based on utilization percentage:

```typescript
const calculateHealthStatus = (utilization: number): HealthStatus => {
  if (utilization === 0) return 'neutral'
  if (utilization < 70) return 'healthy'   // Green
  if (utilization < 90) return 'warning'   // Yellow
  return 'critical'                        // Red
}
```

---

## Trend Analysis

Trends are calculated by comparing current vs previous period:

```typescript
const calculateTrend = (current: number, previous: number) => {
  const change = ((current - previous) / previous) * 100

  if (Math.abs(change) < 5) return 'stable'  // ±5% threshold
  if (change > 0) return 'up'
  return 'down'
}
```

**Trend Interpretation**:
- **Expenses (needs/wants)**: ↓ green (good), ↑ red (bad)
- **Savings**: ↑ green (good), ↓ red (bad)

---

## Migration Guide

### From v1 to v2

1. **Install enhanced version** (already available):
   ```typescript
   import { BudgetDonutChartEnhanced } from '@/components/molecules/budget-donut-chart'
   ```

2. **Add spent data** to items:
   ```typescript
   const enhancedItems = baseItems.map(item => ({
     ...item,
     spent: getSpentAmount(item.id) // Your logic to get spent amount
   }))
   ```

3. **Replace component**:
   ```diff
   - <BudgetDonutChart :items="items" />
   + <BudgetDonutChartEnhanced :items="enhancedItems" />
   ```

4. **Optional: Enable features**:
   ```vue
   <BudgetDonutChartEnhanced
     :items="enhancedItems"
     :show-trends="true"
     :show-health-indicators="true"
     :enable-hover-details="true"
     :comparison-enabled="true"
   />
   ```

### Using Composables for Data Preparation

```vue
<script setup lang="ts">
import { useBudgetDonutPresenter } from '@/composables/presenters/useBudgetDonutPresenter'
import { useBudgetComparisonApplication } from '@/composables/application/useBudgetComparisonApplication'

const { enhanceItems } = useBudgetDonutPresenter()
const { loadComparisonData } = useBudgetComparisonApplication()

const prepareData = async () => {
  const { currentSpent, previousSpent } = await loadComparisonData(baseItems)
  return enhanceItems(baseItems, currentSpent, previousSpent)
}
</script>
```

---

## Examples

### Example 1: Basic with Health Indicators Only

```vue
<BudgetDonutChartEnhanced
  :items="items"
  :total="total"
  :show-trends="false"
  :show-health-indicators="true"
  :comparison-enabled="false"
/>
```

### Example 2: Full Analytics with Comparison

```vue
<BudgetDonutChartEnhanced
  :items="items"
  :total="total"
  :show-trends="true"
  :show-health-indicators="true"
  :enable-hover-details="true"
  :comparison-enabled="true"
/>
```

### Example 3: Without Legend (Compact)

```vue
<BudgetDonutChartEnhanced
  :items="items"
  :total="total"
  :show-legend="false"
/>
```

---

## Testing

### Demo Page

Visit `/dashboard/budget-donut-demo` to see a side-by-side comparison of v1 and v2.

### Manual Testing Checklist

- [ ] Chart renders with empty data (gray circle)
- [ ] Chart renders with valid data (colored segments)
- [ ] Legend displays correctly
- [ ] Hover shows enhanced tooltips (v2)
- [ ] Trend indicators appear (v2)
- [ ] Health rings show correct colors (v2)
- [ ] Utilization bars animate (v2)
- [ ] Comparison mode fetches previous data (v2)
- [ ] Dark mode works correctly
- [ ] Responsive layout adapts to screen size

---

## Design Tokens

Uses centralized design tokens from `@/utils/design-tokens`:

```typescript
CHART_COLORS = {
  income: '#14b8a6',    // needs
  wants: '#6366f1',     // wants
  savings: '#f59e0b'    // savings
}
```

Health colors:
- Healthy: `#22c55e` (green-500)
- Warning: `#f59e0b` (amber-500)
- Critical: `#ef4444` (red-500)
- Neutral: `#94a3b8` (slate-400)

---

## Performance Considerations

- **Lazy Loading**: Use `ClientOnly` wrapper for SSR
- **Memoization**: Use `computed` for chart options
- **Tree Shaking**: ECharts components loaded via plugin
- **Debouncing**: Hover interactions debounced automatically by ECharts

---

## Troubleshooting

### Chart doesn't show
- Verify `items` array is not empty
- Check `total` is greater than 0
- Ensure `ClientOnly` wrapper is present

### Trends not appearing
- Verify `comparisonEnabled` is `true`
- Check previous budget data exists
- Ensure `showTrends` is `true`

### Health indicators missing
- Verify `showHealthIndicators` is `true`
- Check `spent` values are provided in items
- Ensure `utilization` is calculated

---

## Future Enhancements

Potential improvements for v3:
- [ ] Drill-down to category details
- [ ] Export to image/PDF
- [ ] Custom color schemes
- [ ] Multi-period trends (3/6/12 months)
- [ ] Budget forecasting
- [ ] Goal tracking integration
- [ ] Animated transitions between periods

---

## Credits

- **Chart Library**: [Apache ECharts](https://echarts.apache.org/)
- **Vue Integration**: [vue-echarts](https://github.com/ecomfe/vue-echarts)
- **Design System**: Custom Tailwind CSS tokens
- **Architecture**: Hexagonal/Clean Architecture principles

---

## License

Part of the FinHub Dashboard project.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
