import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import { Download, RefreshCw, BarChart3, LineChart, PieChart } from "lucide-react";

interface DataChartProps {
  title: string;
  type?: "bar" | "line" | "pie" | "scatter";
  xData: (string | number)[];
  yData: number[];
  xTitle?: string;
  yTitle?: string;
  colorScheme?: string[];
  height?: number;
}

export const DataChart: React.FC<DataChartProps> = ({
  title,
  type = "bar",
  xData,
  yData,
  xTitle,
  yTitle,
  colorScheme,
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "scatter">(type);

  const defaultPalette = ["#174D32", "#72C84A", "#A5E86A", "#26834A", "#103B29", "#8BD668"];

  useEffect(() => {
    if (!containerRef.current || !xData || !yData || xData.length === 0) return;

    let trace: any = {};

    if (chartType === "pie") {
      trace = {
        type: "pie",
        labels: xData,
        values: yData,
        hole: 0.42, // Donut chart
        marker: {
          colors: colorScheme || defaultPalette,
        },
        textinfo: "label+percent",
        hoverinfo: "label+value+percent",
      };
    } else if (chartType === "line") {
      trace = {
        type: "scatter",
        mode: "lines+markers",
        x: xData,
        y: yData,
        line: { color: "#174D32", width: 2.5, shape: "spline" },
        marker: { color: "#72C84A", size: 6, line: { color: "#103B29", width: 1.5 } },
      };
    } else if (chartType === "scatter") {
      trace = {
        type: "scatter",
        mode: "markers",
        x: xData,
        y: yData,
        marker: {
          color: "#26834A",
          size: 9,
          opacity: 0.8,
          line: { color: "#174D32", width: 1 },
        },
      };
    } else {
      // Bar chart
      trace = {
        type: "bar",
        x: xData,
        y: yData,
        marker: {
          color: xData.map((_, i) => (colorScheme || defaultPalette)[i % (colorScheme || defaultPalette).length]),
          line: { color: "#103B29", width: 0.5 },
        },
      };
    }

    const layout: any = {
      title: {
        text: title,
        font: { family: "Plus Jakarta Sans, sans-serif", size: 14, color: "#103B29" },
        x: 0.02,
      },
      margin: { l: 50, r: 25, t: 40, b: 50 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: { family: "Plus Jakarta Sans, sans-serif", color: "#657267", size: 11 },
      height,
      autosize: true,
      xaxis: {
        title: xTitle,
        showgrid: true,
        gridcolor: "#E8F5E9",
        linecolor: "#DCE6DA",
        tickfont: { size: 10, family: "Plus Jakarta Sans, sans-serif" },
      },
      yaxis: {
        title: yTitle,
        showgrid: true,
        gridcolor: "#E8F5E9",
        linecolor: "#DCE6DA",
        tickfont: { size: 10, family: "JetBrains Mono, monospace" },
      },
      hoverlabel: {
        bgcolor: "#103B29",
        font: { family: "Plus Jakarta Sans, sans-serif", color: "#FAFBF7" },
        bordercolor: "#72C84A",
      },
    };

    const config: any = {
      responsive: true,
      displayModeBar: false, // Clean look, custom export button provided
    };

    Plotly.newPlot(containerRef.current, [trace], layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [xData, yData, chartType, title, height]);

  const handleExportImage = () => {
    if (containerRef.current) {
      Plotly.downloadImage(containerRef.current, {
        format: "png",
        width: 800,
        height: 500,
        filename: `${title.replace(/\s+/g, "_").toLowerCase()}_chart`,
      });
    }
  };

  const handleExportCSV = () => {
    let csv = `${xTitle || "Dimension"},${yTitle || "Metric"}\n`;
    xData.forEach((x, i) => {
      csv += `"${x}",${yData[i]}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs relative group">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between mb-1 pb-2 border-b border-[#DCE6DA]/60">
        <h4 className="text-xs font-semibold text-[#174D32] tracking-tight">{title}</h4>
        <div className="flex items-center gap-1">
          {/* Switch Chart Type */}
          <button
            onClick={() => setChartType("bar")}
            className={`p-1 rounded text-xs transition-colors ${
              chartType === "bar" ? "bg-[#E8F5E9] text-[#174D32]" : "text-[#657267] hover:text-[#202820]"
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`p-1 rounded text-xs transition-colors ${
              chartType === "line" ? "bg-[#E8F5E9] text-[#174D32]" : "text-[#657267] hover:text-[#202820]"
            }`}
            title="Line Chart"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`p-1 rounded text-xs transition-colors ${
              chartType === "pie" ? "bg-[#E8F5E9] text-[#174D32]" : "text-[#657267] hover:text-[#202820]"
            }`}
            title="Donut / Pie Chart"
          >
            <PieChart className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-[1px] bg-[#DCE6DA] mx-1" />

          {/* Export PNG */}
          <button
            onClick={handleExportImage}
            className="p-1 rounded text-xs text-[#657267] hover:text-[#174D32] hover:bg-[#F4F8F1] transition-colors"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Plotly Canvas Container */}
      <div ref={containerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};
