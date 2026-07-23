export type MerchandiseReportOrder = {
  id: string;
  createdAt: string;
  status: "reserved" | "cancelled" | "fulfilled";
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    sku: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  paymentSummary?: {
    total?: number;
  };
};

export type MerchandiseReportInventoryRow = {
  sku: string;
  name: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  price?: number;
};

type WorkbookCell = {
  value: string | number;
  style?: "currency" | "header" | "integer";
};

type WorkbookSheet = {
  name: string;
  rows: WorkbookCell[][];
  widths: number[];
};

const textEncoder = new TextEncoder();

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCsvCell(value: string | number) {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

function unitPriceFor(item: MerchandiseReportOrder["items"][number]) {
  if (typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice)) {
    return item.unitPrice;
  }

  if (typeof item.lineTotal === "number" && item.quantity > 0) {
    return item.lineTotal / item.quantity;
  }

  return 0;
}

function lineTotalFor(item: MerchandiseReportOrder["items"][number]) {
  return typeof item.lineTotal === "number" && Number.isFinite(item.lineTotal)
    ? item.lineTotal
    : unitPriceFor(item) * item.quantity;
}

function customerKey(order: MerchandiseReportOrder) {
  return (
    order.customer.email.trim().toLowerCase() ||
    order.customer.phone?.replace(/\D/g, "") ||
    order.customer.name.trim().toLowerCase()
  );
}

function headerRow(labels: string[]) {
  return labels.map((value) => ({ value, style: "header" as const }));
}

function numberCell(value: number) {
  return { value, style: "integer" as const };
}

function currencyCell(value: number) {
  return { value, style: "currency" as const };
}

function orderDetailRows(orders: MerchandiseReportOrder[]): WorkbookCell[][] {
  return [
    headerRow([
      "Order ID",
      "Ordered At (UTC)",
      "Status",
      "Customer",
      "Email",
      "Phone",
      "SKU",
      "Item",
      "Size",
      "Color",
      "Quantity",
      "Unit Price",
      "Line Total",
      "Order Total"
    ]),
    ...orders.flatMap((order) =>
      order.items.map((item) => [
        { value: order.id },
        { value: new Date(order.createdAt).toISOString() },
        { value: order.status },
        { value: order.customer.name },
        { value: order.customer.email },
        { value: order.customer.phone ?? "" },
        { value: item.sku },
        { value: item.name },
        { value: item.size },
        { value: item.color },
        numberCell(item.quantity),
        currencyCell(unitPriceFor(item)),
        currencyCell(lineTotalFor(item)),
        currencyCell(order.paymentSummary?.total ?? 0)
      ])
    )
  ];
}

function customerSummaryRows(orders: MerchandiseReportOrder[]): WorkbookCell[][] {
  const summaries = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      orders: number;
      active: number;
      cancelled: number;
      fulfilled: number;
      units: number;
      total: number;
    }
  >();

  orders.forEach((order) => {
    const key = customerKey(order);
    const current = summaries.get(key) ?? {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone ?? "",
      orders: 0,
      active: 0,
      cancelled: 0,
      fulfilled: 0,
      units: 0,
      total: 0
    };

    current.orders += 1;
    current.active += order.status === "reserved" ? 1 : 0;
    current.cancelled += order.status === "cancelled" ? 1 : 0;
    current.fulfilled += order.status === "fulfilled" ? 1 : 0;
    current.units += order.items.reduce((total, item) => total + item.quantity, 0);
    current.total += order.paymentSummary?.total ?? 0;
    summaries.set(key, current);
  });

  return [
    headerRow([
      "Customer",
      "Email",
      "Phone",
      "Orders",
      "Active",
      "Cancelled",
      "Fulfilled",
      "Units Ordered",
      "Order Value"
    ]),
    ...Array.from(summaries.values()).map((summary) => [
      { value: summary.name },
      { value: summary.email },
      { value: summary.phone },
      numberCell(summary.orders),
      numberCell(summary.active),
      numberCell(summary.cancelled),
      numberCell(summary.fulfilled),
      numberCell(summary.units),
      currencyCell(summary.total)
    ])
  ];
}

function inventoryRows(inventory: MerchandiseReportInventoryRow[]): WorkbookCell[][] {
  const detailRows = inventory.map((row) => {
    const price = typeof row.price === "number" && Number.isFinite(row.price) ? row.price : 0;

    return [
      { value: row.sku },
      { value: row.name },
      { value: row.sku.startsWith("BUNDLE-") ? "Bundle (derived)" : "Individual" },
      numberCell(row.totalQuantity),
      numberCell(row.reservedQuantity),
      numberCell(row.availableQuantity),
      currencyCell(price),
      currencyCell(row.totalQuantity * price),
      currencyCell(row.reservedQuantity * price),
      currencyCell(row.availableQuantity * price)
    ];
  });
  const individualRows = inventory.filter((row) => !row.sku.startsWith("BUNDLE-"));
  const summarize = (rows: MerchandiseReportInventoryRow[]) =>
    rows.reduce(
      (summary, row) => {
        const price = typeof row.price === "number" && Number.isFinite(row.price) ? row.price : 0;
        summary.total += row.totalQuantity;
        summary.reserved += row.reservedQuantity;
        summary.available += row.availableQuantity;
        summary.totalValue += row.totalQuantity * price;
        summary.reservedValue += row.reservedQuantity * price;
        summary.availableValue += row.availableQuantity * price;
        return summary;
      },
      {
        total: 0,
        reserved: 0,
        available: 0,
        totalValue: 0,
        reservedValue: 0,
        availableValue: 0
      }
    );
  const individualTotals = summarize(individualRows);
  const allRowsTotals = summarize(inventory);
  const summaryRow = (label: string, totals: ReturnType<typeof summarize>): WorkbookCell[] => [
    { value: "" },
    { value: label, style: "header" },
    { value: "" },
    numberCell(totals.total),
    numberCell(totals.reserved),
    numberCell(totals.available),
    { value: "" },
    currencyCell(totals.totalValue),
    currencyCell(totals.reservedValue),
    currencyCell(totals.availableValue)
  ];

  return [
    headerRow([
      "SKU",
      "Item",
      "Product Type",
      "Total Quantity",
      "Reserved",
      "Remaining",
      "Unit Price",
      "Total Retail Value",
      "Reserved Value",
      "Remaining Value"
    ]),
    ...detailRows,
    [],
    summaryRow("Individual inventory totals", individualTotals),
    summaryRow("All rows including derived bundles", allRowsTotals)
  ];
}

function columnName(index: number) {
  let value = index + 1;
  let name = "";

  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }

  return name;
}

function worksheetXml(sheet: WorkbookSheet) {
  const maxColumn = Math.max(...sheet.rows.map((row) => row.length), 1);
  const maxRow = Math.max(sheet.rows.length, 1);
  const columns = sheet.widths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join("");
  const rows = sheet.rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
          const styleIndex = cell.style === "header" ? 1 : cell.style === "currency" ? 2 : cell.style === "integer" ? 3 : 0;

          if (typeof cell.value === "number") {
            return `<c r="${reference}" s="${styleIndex}"><v>${cell.value}</v></c>`;
          }

          return `<c r="${reference}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.value)}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${columns}</cols>
  <sheetData>${rows}</sheetData>
  <autoFilter ref="A1:${columnName(maxColumn - 1)}${maxRow}"/>
</worksheet>`;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function zipFiles(files: Array<{ name: string; contents: string }>) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  files.forEach((file) => {
    const name = textEncoder.encode(file.name);
    const data = textEncoder.encode(file.contents);
    const checksum = crc32(data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + data.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);

  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localOffset, true);

  return concatBytes([...localParts, centralDirectory, end]);
}

export function buildMerchandiseOrdersCsv(orders: MerchandiseReportOrder[]) {
  const headers = [
    "Order ID",
    "Ordered At (UTC)",
    "Status",
    "Customer",
    "Email",
    "Phone",
    "SKU",
    "Item",
    "Size",
    "Color",
    "Quantity",
    "Unit Price",
    "Line Total",
    "Order Total"
  ];
  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      order.id,
      new Date(order.createdAt).toISOString(),
      order.status,
      order.customer.name,
      order.customer.email,
      order.customer.phone ?? "",
      item.sku,
      item.name,
      item.size,
      item.color,
      item.quantity,
      unitPriceFor(item).toFixed(2),
      lineTotalFor(item).toFixed(2),
      (order.paymentSummary?.total ?? 0).toFixed(2)
    ])
  );

  return `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n")}`;
}

export function buildMerchandiseReportXlsx(
  orders: MerchandiseReportOrder[],
  inventory: MerchandiseReportInventoryRow[]
) {
  const sheets: WorkbookSheet[] = [
    {
      name: "Order Details",
      rows: orderDetailRows(orders),
      widths: [39, 24, 12, 24, 30, 16, 16, 34, 14, 16, 11, 14, 14, 14]
    },
    {
      name: "Customer Summary",
      rows: customerSummaryRows(orders),
      widths: [26, 32, 17, 11, 11, 11, 11, 14, 16]
    },
    {
      name: "Inventory & Value",
      rows: inventoryRows(inventory),
      widths: [16, 36, 20, 15, 12, 12, 14, 18, 17, 17]
    }
  ];
  const workbookSheets = sheets
    .map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("");
  const workbookRelationships = sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join("");
  const worksheetOverrides = sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join("");
  const files = [
    {
      name: "[Content_Types].xml",
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${worksheetOverrides}
</Types>`
    },
    {
      name: "_rels/.rels",
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: "xl/workbook.xml",
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${workbookSheets}</sheets>
</workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelationships}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    },
    {
      name: "xl/styles.xml",
      contents: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts>
  <fonts count="2">
    <font><sz val="11"/><name val="Aptos"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF13357F"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
    },
    ...sheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      contents: worksheetXml(sheet)
    }))
  ];

  return new Blob([zipFiles(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
