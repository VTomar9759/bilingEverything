/**
 * Helper utilities for Reports & Analytics calculation, filtering, and exports
 */

export const DATE_RANGES = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  THIS_WEEK: "This Week",
  LAST_WEEK: "Last Week",
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
  THIS_YEAR: "This Year",
  CUSTOM: "Custom Date",
};

/**
 * Filter items by date range string or custom dates
 */
export const filterByDateRange = (items = [], range = DATE_RANGES.THIS_MONTH, customStart = null, customEnd = null, dateKey = "created_at") => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let start = new Date(0);
  let end = new Date(8640000000000000);

  if (range === DATE_RANGES.TODAY) {
    start = startOfDay(now);
    end = endOfDay(now);
  } else if (range === DATE_RANGES.YESTERDAY) {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    start = startOfDay(y);
    end = endOfDay(y);
  } else if (range === DATE_RANGES.THIS_WEEK) {
    const day = now.getDay();
    const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now);
    mon.setDate(diffToMon);
    start = startOfDay(mon);
    end = endOfDay(now);
  } else if (range === DATE_RANGES.LAST_WEEK) {
    const day = now.getDay();
    const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const mon = new Date(now);
    mon.setDate(diffToMon);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    start = startOfDay(mon);
    end = endOfDay(sun);
  } else if (range === DATE_RANGES.THIS_MONTH) {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = endOfDay(now);
  } else if (range === DATE_RANGES.LAST_MONTH) {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === DATE_RANGES.THIS_YEAR) {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    end = endOfDay(now);
  } else if (range === DATE_RANGES.CUSTOM && customStart && customEnd) {
    start = startOfDay(new Date(customStart));
    end = endOfDay(new Date(customEnd));
  }

  return items.filter((item) => {
    const raw = item[dateKey] || item.expense_date || item.date;
    if (!raw) return false;
    const d = new Date(raw);
    return !isNaN(d.getTime()) && d >= start && d <= end;
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "₹") => {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Export data to CSV
 */
export const exportToCSV = (filename, headers = [], rows = []) => {
  if (!rows || !rows.length) return;
  const processRow = (row) =>
    row
      .map((val) => {
        let v = val === null || val === undefined ? "" : String(val);
        v = v.replace(/"/g, '""');
        return `"${v}"`;
      })
      .join(",");

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(processRow)].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Print window handler
 */
export const triggerPrintReport = (reportTitle = "Report", elementId = "report-printable-area") => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    window.print();
    return;
  }
  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; background: #ffffff; }
          h1, h2, h3 { margin-top: 0; color: #01514b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
          .badge { padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 10px; text-transform: uppercase; }
          @media print {
            body { padding: 0; }
            button, .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20px; border-bottom: 2px solid #01514b; padding-bottom: 10px;">
          <h2>BillingEveryThing - ${reportTitle}</h2>
          <p style="font-size: 11px; color: #64748b;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        ${elem.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
};
