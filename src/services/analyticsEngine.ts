import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Dataset, ColumnMetadata, AnalyticsKPIs } from "../types";

export class AnalyticsEngine {
  /**
   * Parse CSV file or raw string into structured dataset
   */
  static parseCSV(csvContent: string, fileName: string = "dataset.csv", fileSize: number = 0): Dataset {
    const parsed = Papa.parse<Record<string, any>>(csvContent.trim(), {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
      throw new Error(`CSV Parsing failed: ${parsed.errors[0]?.message || "Invalid CSV format"}`);
    }

    const data = parsed.data.filter((row) => row && Object.keys(row).length > 0);
    const columns = parsed.meta.fields || (data[0] ? Object.keys(data[0]) : []);

    return this.buildDatasetObject(data, columns, fileName, fileSize || csvContent.length, "csv");
  }

  /**
   * Parse Excel (.xlsx or .xls) file buffer into structured dataset
   */
  static parseExcel(buffer: ArrayBuffer, fileName: string): Dataset {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Excel workbook contains no sheets.");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
    const columns = data[0] ? Object.keys(data[0]) : [];

    return this.buildDatasetObject(data, columns, fileName, buffer.byteLength, fileName.endsWith(".xls") ? "xls" : "xlsx");
  }

  /**
   * Build complete dataset object with full metadata and quality metrics
   */
  private static buildDatasetObject(
    data: Record<string, any>[],
    columns: string[],
    name: string,
    fileSize: number,
    fileType: 'csv' | 'xlsx' | 'xls'
  ): Dataset {
    const rowCount = data.length;
    const columnCount = columns.length;

    // Check duplicate rows
    const seen = new Set<string>();
    let duplicateRows = 0;
    let missingCells = 0;

    data.forEach((row) => {
      const hash = JSON.stringify(row);
      if (seen.has(hash)) {
        duplicateRows++;
      } else {
        seen.add(hash);
      }

      columns.forEach((col) => {
        const val = row[col];
        if (val === null || val === undefined || val === "" || Number.isNaN(val)) {
          missingCells++;
        }
      });
    });

    const totalCells = rowCount * columnCount;
    const missingPercentage = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;
    const duplicatePercentage = rowCount > 0 ? (duplicateRows / rowCount) * 100 : 0;

    // Data Quality Score (0 to 100)
    const completenessScore = Math.max(0, 100 - missingPercentage * 1.5);
    const uniquenessScore = Math.max(0, 100 - duplicatePercentage * 2);
    const qualityScore = Math.round(completenessScore * 0.7 + uniquenessScore * 0.3);

    // Build column metadata
    const columnMetadata: ColumnMetadata[] = columns.map((col) => {
      const values = data.map((d) => d[col]).filter((v) => v !== null && v !== undefined && v !== "");
      const nullCount = rowCount - values.length;
      const uniqueVals = new Set(values);

      let inferredType: 'number' | 'string' | 'date' | 'boolean' = 'string';
      const numericVals: number[] = [];

      for (const v of values) {
        if (typeof v === "number" && !isNaN(v)) {
          numericVals.push(v);
        } else if (typeof v === "string") {
          const num = Number(v.replace(/[\$,]/g, ""));
          if (!isNaN(num) && v.trim() !== "") {
            numericVals.push(num);
          }
        }
      }

      if (numericVals.length > values.length * 0.8 && numericVals.length > 0) {
        inferredType = "number";
      } else if (values.some((v) => typeof v === "boolean")) {
        inferredType = "boolean";
      } else if (values.some((v) => typeof v === "string" && !isNaN(Date.parse(v)) && v.length >= 8 && (v.includes("-") || v.includes("/")))) {
        inferredType = "date";
      }

      const meta: ColumnMetadata = {
        name: col,
        type: inferredType,
        nullCount,
        nullPercentage: rowCount > 0 ? Number(((nullCount / rowCount) * 100).toFixed(1)) : 0,
        uniqueCount: uniqueVals.size,
      };

      if (inferredType === "number" && numericVals.length > 0) {
        numericVals.sort((a, b) => a - b);
        meta.min = numericVals[0];
        meta.max = numericVals[numericVals.length - 1];
        const sum = numericVals.reduce((acc, curr) => acc + curr, 0);
        meta.mean = Number((sum / numericVals.length).toFixed(2));
        const mid = Math.floor(numericVals.length / 2);
        meta.median = numericVals.length % 2 === 0
          ? Number(((numericVals[mid - 1] + numericVals[mid]) / 2).toFixed(2))
          : numericVals[mid];
      }

      return meta;
    });

    return {
      id: "ds_" + Math.random().toString(36).substring(2, 9),
      name,
      rowCount,
      columnCount,
      columns,
      data,
      fileSize,
      uploadedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileType,
      qualityScore,
      missingCells,
      duplicateRows,
      columnMetadata,
    };
  }

  /**
   * Deterministically calculate rigorous KPIs and analytics
   */
  static computeKPIs(dataset: Dataset): AnalyticsKPIs {
    const { data, columns, rowCount } = dataset;

    // Detect key columns with schema flexibility
    const findCol = (patterns: string[]) => {
      return columns.find((c) => {
        const lower = c.toLowerCase().replace(/[\s_-]/g, "");
        return patterns.some((p) => lower.includes(p.toLowerCase().replace(/[\s_-]/g, "")));
      });
    };

    const qtyCol = findCol(["quantity", "qty", "units", "count"]);
    const priceCol = findCol(["unitprice", "price", "rate", "costperunit"]);
    const costCol = findCol(["unitcost", "cost", "cogs", "expense"]);
    const revenueCol = findCol(["revenue", "sales", "totalamount", "amount", "totalprice"]);
    const profitCol = findCol(["profit", "netincome", "gain"]);
    const productCol = findCol(["productname", "product", "item", "sku", "description"]);
    const categoryCol = findCol(["category", "segment", "department", "type"]);
    const regionCol = findCol(["region", "country", "territory", "location"]);
    const channelCol = findCol(["saleschannel", "channel", "source", "medium"]);
    const dateCol = findCol(["date", "timestamp", "period", "orderdate"]);

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const productMap = new Map<string, { revenue: number; profit: number; quantity: number }>();
    const categoryMap = new Map<string, { revenue: number; profit: number; count: number }>();
    const monthMap = new Map<string, { revenue: number; profit: number; orders: number }>();
    const regionMap = new Map<string, { revenue: number; count: number }>();
    const channelMap = new Map<string, { revenue: number; count: number }>();

    data.forEach((row) => {
      const qty = qtyCol && typeof row[qtyCol] === "number" ? row[qtyCol] : 1;
      const price = priceCol && typeof row[priceCol] === "number" ? row[priceCol] : 0;
      const cost = costCol && typeof row[costCol] === "number" ? row[costCol] : 0;

      // Row-level revenue
      let rowRevenue = 0;
      if (revenueCol && typeof row[revenueCol] === "number") {
        rowRevenue = row[revenueCol];
      } else if (qtyCol && priceCol) {
        rowRevenue = qty * price;
      }

      // Row-level cost
      let rowCost = 0;
      if (costCol && typeof row[costCol] === "number") {
        rowCost = qtyCol ? qty * cost : cost;
      }

      // Row-level profit
      let rowProfit = 0;
      if (profitCol && typeof row[profitCol] === "number") {
        rowProfit = row[profitCol];
      } else {
        rowProfit = rowRevenue - rowCost;
      }

      totalRevenue += rowRevenue;
      totalCost += rowCost;
      totalProfit += rowProfit;

      // Product grouping
      if (productCol && row[productCol]) {
        const prodName = String(row[productCol]);
        const curr = productMap.get(prodName) || { revenue: 0, profit: 0, quantity: 0 };
        curr.revenue += rowRevenue;
        curr.profit += rowProfit;
        curr.quantity += qty;
        productMap.set(prodName, curr);
      }

      // Category grouping
      if (categoryCol && row[categoryCol]) {
        const catName = String(row[categoryCol]);
        const curr = categoryMap.get(catName) || { revenue: 0, profit: 0, count: 0 };
        curr.revenue += rowRevenue;
        curr.profit += rowProfit;
        curr.count += 1;
        categoryMap.set(catName, curr);
      }

      // Monthly trends
      if (dateCol && row[dateCol]) {
        const dStr = String(row[dateCol]).slice(0, 7); // YYYY-MM
        const curr = monthMap.get(dStr) || { revenue: 0, profit: 0, orders: 0 };
        curr.revenue += rowRevenue;
        curr.profit += rowProfit;
        curr.orders += 1;
        monthMap.set(dStr, curr);
      }

      // Region grouping
      if (regionCol && row[regionCol]) {
        const rName = String(row[regionCol]);
        const curr = regionMap.get(rName) || { revenue: 0, count: 0 };
        curr.revenue += rowRevenue;
        curr.count += 1;
        regionMap.set(rName, curr);
      }

      // Channel grouping
      if (channelCol && row[channelCol]) {
        const chName = String(row[channelCol]);
        const curr = channelMap.get(chName) || { revenue: 0, count: 0 };
        curr.revenue += rowRevenue;
        curr.count += 1;
        channelMap.set(chName, curr);
      }
    });

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = rowCount > 0 ? totalRevenue / rowCount : 0;

    // Outlier detection on numerical revenue/price columns using IQR
    const outliers: { column: string; value: number; rowId: string | number; reason: string }[] = [];
    if (priceCol) {
      const prices = data.map((d) => d[priceCol]).filter((v) => typeof v === "number") as number[];
      if (prices.length >= 8) {
        prices.sort((a, b) => a - b);
        const q1 = prices[Math.floor(prices.length * 0.25)];
        const q3 = prices[Math.floor(prices.length * 0.75)];
        const iqr = q3 - q1;
        const upperThreshold = q3 + 1.5 * iqr;
        const lowerThreshold = Math.max(0, q1 - 1.5 * iqr);

        data.forEach((row, i) => {
          const val = row[priceCol];
          if (typeof val === "number" && (val > upperThreshold || val < lowerThreshold)) {
            outliers.push({
              column: priceCol,
              value: val,
              rowId: row["Transaction_ID"] || row["id"] || i + 1,
              reason: val > upperThreshold ? `Above upper IQR bound ($${upperThreshold.toFixed(2)})` : `Below lower IQR bound ($${lowerThreshold.toFixed(2)})`,
            });
          }
        });
      }
    }

    // Top products
    const topProducts = Array.from(productMap.entries())
      .map(([name, stats]) => ({
        name,
        revenue: Math.round(stats.revenue),
        profit: Math.round(stats.profit),
        quantity: stats.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Category breakdown
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        revenue: Math.round(stats.revenue),
        profit: Math.round(stats.profit),
        count: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Monthly trends sorted by date
    const monthlyTrends = Array.from(monthMap.entries())
      .map(([month, stats]) => ({
        month,
        revenue: Math.round(stats.revenue),
        profit: Math.round(stats.profit),
        orders: stats.orders,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const regionalBreakdown = Array.from(regionMap.entries())
      .map(([region, stats]) => ({
        region,
        revenue: Math.round(stats.revenue),
        count: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const channelBreakdown = Array.from(channelMap.entries())
      .map(([channel, stats]) => ({
        channel,
        revenue: Math.round(stats.revenue),
        count: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalCells = dataset.rowCount * dataset.columnCount;
    const missingRate = totalCells > 0 ? (dataset.missingCells / totalCells) * 100 : 0;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      totalTransactions: rowCount,
      missingRate: Number(missingRate.toFixed(2)),
      duplicateCount: dataset.duplicateRows,
      qualityScore: dataset.qualityScore,
      topProducts,
      categoryBreakdown,
      monthlyTrends,
      regionalBreakdown,
      channelBreakdown,
      outliers: outliers.slice(0, 10),
    };
  }
}
