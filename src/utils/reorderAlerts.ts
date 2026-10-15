import { InventoryItem, ReorderPointAlert, BakpaoMaterialType, ROPAlertLevel } from '../types/erp';

/**
 * Classifies inventory items into specific mini bakpao manufacturing material categories.
 */
export function classifyBakpaoMaterial(item: InventoryItem): { type: BakpaoMaterialType; label: string } {
  const name = item.name.toLowerCase();
  const sku = item.sku.toUpperCase();
  const category = (item.category || '').toLowerCase();

  if (category.includes('tepung') || sku.includes('TPG') || name.includes('tepung') || name.includes('terigu') || name.includes('tang mien')) {
    return { type: 'TEPUNG', label: 'Tepung Terigu & Pati' };
  }
  if (sku.includes('RGI') || name.includes('ragi') || name.includes('yeast') || name.includes('saf-instant')) {
    return { type: 'RAGI', label: 'Ragi Instan (Yeast)' };
  }
  if (category.includes('isian') || category.includes('filling') || sku.includes('FIL-') || name.includes('isian') || name.includes('pasta') || name.includes('daging') || name.includes('keju') || name.includes('tausa') || name.includes('cokelat')) {
    return { type: 'ISIAN', label: 'Isian (Filling / Pasta / Daging)' };
  }
  if (category.includes('pengembang') || category.includes('bumbu') || sku.includes('BP-') || sku.includes('GUL-') || sku.includes('SHT-') || name.includes('baking powder') || name.includes('shortening') || name.includes('gula')) {
    return { type: 'BUMBU_PENGEMBANG', label: 'Bahan Pengembang & Pelembut' };
  }
  if (category.includes('packaging') || category.includes('kemasan') || sku.includes('PKG-')) {
    return { type: 'PACKAGING', label: 'Packaging & Kertas Alas' };
  }
  return { type: 'OTHER', label: 'Bahan Penunjang Lain' };
}

/**
 * Determines whether an inventory item has reached critical or reorder warning level.
 */
export function getROPAlertLevel(item: InventoryItem): ROPAlertLevel {
  if (item.stockQuantity <= item.minSafetyStock) {
    return 'CRITICAL';
  }
  if (item.stockQuantity <= item.reorderLevel) {
    return 'WARNING';
  }
  return 'HEALTHY';
}

/**
 * Daily typical burn rate for mini bakpao factory operations (estimated based on average batch of 5,000 bakpao/day).
 */
function getEstimatedDailyBurnRate(item: InventoryItem, materialType: BakpaoMaterialType): number {
  switch (materialType) {
    case 'TEPUNG':
      return item.sku.includes('TANGMIEN') ? 25 : 180; // kg/day
    case 'RAGI':
      return 3.5; // kg/day
    case 'ISIAN':
      return 35; // kg/day
    case 'BUMBU_PENGEMBANG':
      return item.sku.includes('GUL') ? 50 : 8; // kg/day
    case 'PACKAGING':
      return item.unit === 'lembar' ? 5000 : 300;
    default:
      return 10;
  }
}

/**
 * Calculates detailed Reorder Point alerts for all inventory items.
 */
export function calculateReorderPointAlerts(inventory: InventoryItem[]): ReorderPointAlert[] {
  const alerts: ReorderPointAlert[] = [];

  for (const item of inventory) {
    const alertLevel = getROPAlertLevel(item);
    if (alertLevel === 'HEALTHY') continue;

    const { type: materialType, label: materialTypeLabel } = classifyBakpaoMaterial(item);
    const deficitToSafety = Math.max(0, item.minSafetyStock - item.stockQuantity);
    const deficitToReorder = Math.max(0, item.reorderLevel - item.stockQuantity);

    // Calculate recommended order quantity to bring stock up to safety target (~2.5x reorder level)
    let recommendedOrderQty = Math.max(
      item.reorderLevel * 2 - item.stockQuantity,
      item.reorderLevel
    );

    // Rounding based on commercial packaging units (e.g. 25kg flour sack, 10kg yeast box)
    if (item.unit === 'kg') {
      if (materialType === 'TEPUNG') {
        recommendedOrderQty = Math.ceil(recommendedOrderQty / 25) * 25; // 25kg sacks
      } else if (materialType === 'RAGI') {
        recommendedOrderQty = Math.ceil(recommendedOrderQty / 5) * 5; // 5kg cartons
      } else {
        recommendedOrderQty = Math.ceil(recommendedOrderQty / 10) * 10;
      }
    } else if (item.unit === 'lembar' || item.unit === 'pcs') {
      recommendedOrderQty = Math.ceil(recommendedOrderQty / 500) * 500;
    }

    const burnRate = getEstimatedDailyBurnRate(item, materialType);
    const estimatedDaysRemaining = burnRate > 0 
      ? Math.max(0, Number((item.stockQuantity / burnRate).toFixed(1)))
      : 0;

    let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let notes = '';

    if (alertLevel === 'CRITICAL') {
      urgency = 'HIGH';
      notes = `Stok di bawah Safety Stock (${item.minSafetyStock} ${item.unit}). Bahaya lini produksi terhenti!`;
    } else {
      notes = `Mencapai Reorder Point (${item.reorderLevel} ${item.unit}). Segera terbitkan Purchase Order ke pemasok.`;
    }

    alerts.push({
      item,
      alertLevel,
      materialType,
      materialTypeLabel,
      stockQuantity: item.stockQuantity,
      minSafetyStock: item.minSafetyStock,
      reorderLevel: item.reorderLevel,
      deficitToSafety,
      deficitToReorder,
      recommendedOrderQty,
      urgency,
      estimatedDaysRemaining,
      notes
    });
  }

  // Sort: CRITICAL first, then by priority of bakery core materials: RAGI & ISIAN & TEPUNG first
  return alerts.sort((a, b) => {
    if (a.alertLevel === 'CRITICAL' && b.alertLevel !== 'CRITICAL') return -1;
    if (a.alertLevel !== 'CRITICAL' && b.alertLevel === 'CRITICAL') return 1;

    // Prioritize core bakpao materials
    const priorityScore = (type: BakpaoMaterialType) => {
      switch (type) {
        case 'RAGI': return 1;
        case 'TEPUNG': return 2;
        case 'ISIAN': return 3;
        case 'BUMBU_PENGEMBANG': return 4;
        default: return 5;
      }
    };

    return priorityScore(a.materialType) - priorityScore(b.materialType);
  });
}

/**
 * Summary statistics for Reorder Point monitoring across the factory.
 */
export function getROPSummary(inventory: InventoryItem[]) {
  const alerts = calculateReorderPointAlerts(inventory);
  const criticalList = alerts.filter(a => a.alertLevel === 'CRITICAL');
  const warningList = alerts.filter(a => a.alertLevel === 'WARNING');

  const tepungAlerts = alerts.filter(a => a.materialType === 'TEPUNG');
  const ragiAlerts = alerts.filter(a => a.materialType === 'RAGI');
  const isianAlerts = alerts.filter(a => a.materialType === 'ISIAN');
  const otherAlerts = alerts.filter(a => !['TEPUNG', 'RAGI', 'ISIAN'].includes(a.materialType));

  return {
    totalAlerts: alerts.length,
    criticalCount: criticalList.length,
    warningCount: warningList.length,
    tepungAlerts,
    ragiAlerts,
    isianAlerts,
    otherAlerts,
    alerts,
    hasCoreCritical: alerts.some(a => a.alertLevel === 'CRITICAL' && ['TEPUNG', 'RAGI', 'ISIAN'].includes(a.materialType))
  };
}
