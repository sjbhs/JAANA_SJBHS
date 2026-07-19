import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type {
  MerchandiseInventoryRow,
  MerchandisePaymentSummary,
  MerchandiseReservationEntry,
  MerchandiseReservationItem
} from "./merchandiseReservationStore.js";
import { buildMerchandisePaymentSummary } from "./merchandiseReservationStore.js";

export type MerchandiseReceiptNotificationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

type MerchandiseReceiptOrder = {
  reservation: MerchandiseReservationEntry;
  inventory: MerchandiseInventoryRow[];
  paymentSummary?: MerchandisePaymentSummary;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  user?: string;
  pass?: string;
};

const defaultAdminRecipients = ["jaanamedia@gmail.com"];
const receiptPdfWidth = 612;
const receiptPdfHeight = 792;
const receiptMargin = 48;
const receiptLogoCid = "jaana-school-logo";
const receiptLogoPath = path.resolve(process.cwd(), "public/assets/jaana-logo-blue.png");
const receiptGeneralContactEmail = process.env.MERCHANDISE_RECEIPT_CONTACT_EMAIL?.trim() || "jaanagroup@gmail.com";
const receiptFinanceContactEmail = process.env.MERCHANDISE_RECEIPT_FINANCE_EMAIL?.trim() || "jaanafinance@gmail.com";

function parseRecipients(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined) {
  const normalizedValue = value?.trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalizedValue ?? "")) {
    return true;
  }

  if (["false", "0", "no"].includes(normalizedValue ?? "")) {
    return false;
  }

  return null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatReceiptDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York"
  }).format(date);
}

function lineTotalFor(item: MerchandiseReservationItem) {
  return buildMerchandisePaymentSummary([item]).total;
}

function unitPriceFor(item: MerchandiseReservationItem) {
  return buildMerchandisePaymentSummary([item]).items[0]?.unitPrice ?? 0;
}

function orderTotal(order: MerchandiseReceiptOrder) {
  return order.paymentSummary?.total ?? order.reservation.paymentSummary?.total ?? buildMerchandisePaymentSummary(order.reservation.items).total;
}

function inventoryRemainingFor(order: MerchandiseReceiptOrder, item: MerchandiseReservationItem) {
  return order.inventory.find((row) => row.sku === item.sku)?.availableQuantity;
}

function getAdminRecipients() {
  const configuredRecipients = parseRecipients(process.env.MERCHANDISE_RECEIPT_EMAIL_TO);

  return configuredRecipients.length ? configuredRecipients : defaultAdminRecipients;
}

function getSmtpConfig(): SmtpConfig | null {
  const gmailUser = process.env.GMAIL_USER?.trim() || "";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim() || "";
  const host = process.env.SMTP_HOST?.trim() || (gmailUser && gmailAppPassword ? "smtp.gmail.com" : "");
  const rawPort = Number(process.env.SMTP_PORT ?? (host === "smtp.gmail.com" ? 465 : 587));
  const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 587;
  const secure = parseBoolean(process.env.SMTP_SECURE) ?? port === 465;
  const user = process.env.SMTP_USER?.trim() || gmailUser;
  const pass = process.env.SMTP_PASS?.trim() || gmailAppPassword;
  const from =
    process.env.MERCHANDISE_EMAIL_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    process.env.INQUIRY_EMAIL_FROM?.trim() ||
    (user ? `JAANA Merchandise <${user}>` : "");

  if (!host || !from) {
    return null;
  }

  if ((user && !pass) || (!user && pass)) {
    return null;
  }

  return {
    host,
    port,
    secure,
    from,
    ...(user && pass ? { user, pass } : {})
  };
}

export function getMerchandiseReceiptEmailConfigurationError() {
  const missingValues = [];
  const gmailUser = process.env.GMAIL_USER?.trim() || "";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim() || "";
  const hasGmailSmtpAlias = Boolean(gmailUser && gmailAppPassword);

  if (!process.env.SMTP_HOST?.trim() && !hasGmailSmtpAlias) {
    missingValues.push("SMTP_HOST");
  }

  if (
    !process.env.MERCHANDISE_EMAIL_FROM?.trim() &&
    !process.env.SMTP_FROM?.trim() &&
    !process.env.INQUIRY_EMAIL_FROM?.trim() &&
    !process.env.SMTP_USER?.trim() &&
    !gmailUser
  ) {
    missingValues.push("MERCHANDISE_EMAIL_FROM");
  }

  if (
    (process.env.SMTP_USER?.trim() && !process.env.SMTP_PASS?.trim() && !gmailAppPassword) ||
    (!process.env.SMTP_USER?.trim() && !gmailUser && process.env.SMTP_PASS?.trim())
  ) {
    missingValues.push("SMTP_USER and SMTP_PASS");
  }

  return missingValues.length
    ? `Merchandise receipt email is not configured. Set ${missingValues.join(", ")}.`
    : "";
}

export function isMerchandiseReceiptEmailConfigured() {
  return Boolean(getSmtpConfig());
}

export function isMerchandiseReceiptEmailDeliveryRequired() {
  const configuredValue = parseBoolean(process.env.REQUIRE_MERCHANDISE_RECEIPT_EMAIL);

  if (configuredValue !== null) {
    return configuredValue;
  }

  return Boolean(process.env.VERCEL);
}

function safePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfString(value: string) {
  return safePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function approximateTextWidth(value: string, size: number) {
  return safePdfText(value).length * size * 0.52;
}

function truncateText(value: string, maxWidth: number, size: number) {
  const safeValue = safePdfText(value);

  if (approximateTextWidth(safeValue, size) <= maxWidth) {
    return safeValue;
  }

  const ellipsis = "...";
  let nextValue = safeValue;

  while (nextValue.length > ellipsis.length && approximateTextWidth(`${nextValue}${ellipsis}`, size) > maxWidth) {
    nextValue = nextValue.slice(0, -1);
  }

  return `${nextValue.trimEnd()}${ellipsis}`;
}

function drawText(
  operations: string[],
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    font?: "regular" | "bold";
    color?: [number, number, number];
    align?: "left" | "right";
    maxWidth?: number;
  } = {}
) {
  const size = options.size ?? 10;
  const color = options.color ?? [0.08, 0.13, 0.24];
  const font = options.font === "bold" ? "F2" : "F1";
  const safeText = options.maxWidth ? truncateText(text, options.maxWidth, size) : safePdfText(text);
  const textX = options.align === "right" ? x - approximateTextWidth(safeText, size) : x;

  operations.push(
    `${color.join(" ")} rg BT /${font} ${size} Tf 1 0 0 1 ${textX.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfString(
      safeText
    )}) Tj ET`
  );
}

function drawLine(operations: string[], x1: number, y1: number, x2: number, y2: number) {
  operations.push(`0.78 0.82 0.89 RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function drawFilledRect(
  operations: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number]
) {
  operations.push(`${color.join(" ")} rg ${x} ${y} ${width} ${height} re f`);
}

function drawWrappedText(
  operations: string[],
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    size?: number;
    lineHeight?: number;
    color?: [number, number, number];
  } = {}
) {
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size + 4;
  const words = safePdfText(text).split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidateLine = line ? `${line} ${word}` : word;

    if (approximateTextWidth(candidateLine, size) <= maxWidth) {
      line = candidateLine;
    } else {
      if (line) {
        lines.push(line);
      }

      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.forEach((wrappedLine, index) => {
    drawText(operations, wrappedLine, x, y - index * lineHeight, {
      size,
      color: options.color
    });
  });

  return y - Math.max(lines.length, 1) * lineHeight;
}

function buildPdfDocument(pageOperations: string[][]) {
  const objects: Record<number, string> = {};
  const pageIds = pageOperations.map((_page, index) => 5 + index * 2);
  const contentIds = pageOperations.map((_page, index) => 6 + index * 2);
  const fontRegularId = 3;
  const fontBoldId = 4;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${
    pageIds.length
  } >>`;
  objects[fontRegularId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontBoldId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pageOperations.forEach((operations, index) => {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    const stream = operations.join("\n");

    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${receiptPdfWidth} ${receiptPdfHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
  });

  const maxObjectId = Math.max(...Object.keys(objects).map(Number));
  const offsets = Array.from({ length: maxObjectId + 1 }, () => 0);
  let pdf = "%PDF-1.4\n";

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    const objectBody = objects[objectId];

    if (!objectBody) {
      continue;
    }

    offsets[objectId] = Buffer.byteLength(pdf, "ascii");
    pdf += `${objectId} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "ascii");

  pdf += `xref\n0 ${maxObjectId + 1}\n0000000000 65535 f \n`;

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "ascii");
}

export function buildMerchandiseReceiptPdf(order: MerchandiseReceiptOrder) {
  const pages: string[][] = [];
  let operations: string[] = [];
  let y = receiptPdfHeight - receiptMargin;
  const contentLeft = receiptMargin;
  const contentRight = receiptPdfWidth - receiptMargin;
  const contentWidth = contentRight - contentLeft;
  const tableX = contentLeft;
  const tableRight = contentRight;
  const tableWidth = contentWidth;
  const itemTextX = tableX + 12;
  const qtyRight = tableX + 330;
  const unitPriceRight = tableX + 424;
  const totalRight = tableRight - 14;

  const addPage = () => {
    operations = [];
    pages.push(operations);
    y = receiptPdfHeight - receiptMargin;
  };

  const drawTableHeader = () => {
    const headerBottom = y - 25;

    drawFilledRect(operations, tableX, headerBottom, tableWidth, 31, [0.93, 0.95, 0.98]);
    drawText(operations, "Item", itemTextX, y - 13, { font: "bold", size: 9 });
    drawText(operations, "Qty", qtyRight, y - 13, { font: "bold", size: 9, align: "right" });
    drawText(operations, "Unit price", unitPriceRight, y - 13, { font: "bold", size: 9, align: "right" });
    drawText(operations, "Total", totalRight, y - 13, { font: "bold", size: 9, align: "right" });
    drawLine(operations, tableX, headerBottom, tableRight, headerBottom);
    y = headerBottom - 14;
  };

  const ensureSpace = (height: number, options: { repeatTableHeader?: boolean } = {}) => {
    if (y - height >= 72) {
      return;
    }

    addPage();
    drawText(operations, `Receipt ${order.reservation.id}`, receiptMargin, y, { font: "bold", size: 12 });
    y -= 28;

    if (options.repeatTableHeader ?? true) {
      drawTableHeader();
    }
  };

  addPage();

  drawText(operations, "JAANA", contentLeft, y, { font: "bold", size: 14, color: [0.05, 0.18, 0.43] });
  drawText(operations, "Josephite Alumni Association of North America", contentLeft, y - 18, {
    size: 9,
    color: [0.38, 0.43, 0.53]
  });
  drawText(operations, "Merchandise Receipt", contentLeft, y - 58, {
    font: "bold",
    size: 24,
    color: [0.05, 0.13, 0.31]
  });
  drawText(operations, `Reservation: ${order.reservation.id}`, contentRight, y - 8, {
    align: "right",
    font: "bold",
    size: 10
  });
  drawText(operations, formatReceiptDate(order.reservation.createdAt), contentRight, y - 24, {
    align: "right",
    size: 9,
    color: [0.38, 0.43, 0.53]
  });

  drawText(operations, "Customer Details", contentLeft, y - 88, {
    font: "bold",
    size: 10,
    color: [0.05, 0.13, 0.31]
  });
  drawText(operations, `Name: ${order.reservation.customer.name}`, contentLeft, y - 106, {
    size: 9,
    color: [0.38, 0.43, 0.53],
    maxWidth: 220
  });
  drawText(operations, `Email: ${order.reservation.customer.email}`, tableX + 260, y - 106, {
    size: 9,
    color: [0.38, 0.43, 0.53],
    maxWidth: 276
  });
  drawText(operations, `Phone: ${order.reservation.customer.phone || "Not provided"}`, contentLeft, y - 122, {
    size: 9,
    color: [0.38, 0.43, 0.53],
    maxWidth: 220
  });

  y -= 154;
  drawText(operations, "Purchased Items", contentLeft, y, {
    font: "bold",
    size: 12,
    color: [0.05, 0.13, 0.31]
  });
  y -= 20;
  drawTableHeader();

  for (const item of order.reservation.items) {
    ensureSpace(48);

    const unitPrice = unitPriceFor(item);
    const details = `${item.sku} | ${item.size} | ${item.color}`;
    const rowLineY = y - 26;

    drawText(operations, item.name, itemTextX, y, { size: 10, maxWidth: 250 });
    drawText(operations, details, itemTextX, y - 14, { size: 8.5, color: [0.38, 0.43, 0.53], maxWidth: 286 });
    drawText(operations, String(item.quantity), qtyRight, y, { size: 10, align: "right" });
    drawText(operations, formatCurrency(unitPrice), unitPriceRight, y, { size: 10, align: "right" });
    drawText(operations, formatCurrency(unitPrice * item.quantity), totalRight, y, {
      size: 10,
      font: "bold",
      align: "right"
    });
    drawLine(operations, tableX, rowLineY, tableRight, rowLineY);
    y = rowLineY - 12;
  }

  ensureSpace(150, { repeatTableHeader: false });
  const totalBandTop = y + 6;
  const totalBandBottom = totalBandTop - 34;

  drawFilledRect(operations, tableX, totalBandBottom, tableWidth, 34, [0.98, 0.99, 1]);
  drawLine(operations, tableX, totalBandTop, tableRight, totalBandTop);
  drawLine(operations, tableX, totalBandBottom, tableRight, totalBandBottom);
  drawText(operations, "Total", unitPriceRight, totalBandBottom + 12, { font: "bold", size: 12, align: "right" });
  drawText(operations, formatCurrency(orderTotal(order)), totalRight, totalBandBottom + 12, {
    font: "bold",
    size: 12,
    align: "right"
  });

  y = totalBandBottom - 58;
  const pickupBoxHeight = 106;
  const pickupBoxBottom = y - pickupBoxHeight;

  drawFilledRect(operations, contentLeft, pickupBoxBottom, contentWidth, pickupBoxHeight, [0.98, 0.96, 0.92]);
  drawText(operations, "Pickup Instructions", contentLeft + 16, y - 16, {
    font: "bold",
    size: 10,
    color: [0.05, 0.13, 0.31]
  });
  drawWrappedText(
    operations,
    "Your merchandise order is reserved for event pickup. Please bring this receipt or reservation ID to the JAANA merchandise desk. No payment is collected on the website; payment is due at pickup unless separately arranged.",
    contentLeft + 16,
    y - 34,
    contentWidth - 32,
    { size: 9.5, lineHeight: 13, color: [0.22, 0.27, 0.37] }
  );
  drawLine(operations, contentLeft + 16, pickupBoxBottom + 42, contentRight - 16, pickupBoxBottom + 42);
  drawText(operations, "JAANA Contact", contentLeft + 16, pickupBoxBottom + 22, {
    font: "bold",
    size: 9,
    color: [0.05, 0.13, 0.31]
  });
  drawText(operations, `General: ${receiptGeneralContactEmail}`, contentLeft + 198, pickupBoxBottom + 22, {
    size: 9,
    color: [0.38, 0.43, 0.53]
  });
  drawText(operations, `Finance: ${receiptFinanceContactEmail}`, contentLeft + 358, pickupBoxBottom + 22, {
    size: 9,
    color: [0.38, 0.43, 0.53]
  });

  pages.forEach((page, index) => {
    drawLine(page, contentLeft, 50, contentRight, 50);
    drawText(page, "JAANA Merchandise", contentLeft, 32, { size: 8, color: [0.48, 0.53, 0.62] });
    drawText(page, `Page ${index + 1} of ${pages.length}`, contentRight, 32, {
      size: 8,
      color: [0.48, 0.53, 0.62],
      align: "right"
    });
  });

  return buildPdfDocument(pages);
}

function formatCustomerText(order: MerchandiseReceiptOrder) {
  return [
    `Dear ${order.reservation.customer.name},`,
    "",
    "Thank you for your purchase and for supporting JAANA. Your merchandise has been reserved for event pickup.",
    "Your PDF receipt is attached to this email.",
    "",
    `Reservation: ${order.reservation.id}`,
    `Total: ${formatCurrency(orderTotal(order))}`,
    "",
    "Items:",
    ...order.reservation.items.map(
      (item) => `- ${item.name} (${item.sku}) x ${item.quantity}: ${formatCurrency(lineTotalFor(item))}`
    ),
    "",
    "With thanks,",
    "JAANA"
  ].join("\n");
}

function formatCustomerHtml(order: MerchandiseReceiptOrder) {
  const items = order.reservation.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;color:#647084;">${escapeHtml(item.sku)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${formatCurrency(
            lineTotalFor(item)
          )}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,sans-serif;color:#13213f;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d7deea;padding:24px;">
        <img src="cid:${receiptLogoCid}" alt="JAANA school logo" width="180" style="display:block;width:180px;max-width:60%;height:auto;margin:0 0 18px;" />
        <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;">Thank you for your purchase</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
          Dear ${escapeHtml(order.reservation.customer.name)}, thank you for your purchase and for supporting JAANA. Your merchandise has been reserved for event pickup, and your PDF receipt is attached to this email.
        </p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4d5a70;">
          Reservation <strong>${escapeHtml(order.reservation.id)}</strong>
        </p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px 12px;background:#eef2f7;">Item</th>
              <th align="left" style="padding:10px 12px;background:#eef2f7;">SKU</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Qty</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Total</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>
        <p style="margin:18px 0 0;font-size:16px;text-align:right;">
          <strong>Total: ${formatCurrency(orderTotal(order))}</strong>
        </p>
        <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">
          With thanks,<br />
          <strong>JAANA</strong>
        </p>
      </div>
    </div>
  `;
}

function formatAdminText(order: MerchandiseReceiptOrder) {
  return [
    "A new JAANA merchandise order was placed.",
    "",
    "Customer details:",
    `Name: ${order.reservation.customer.name}`,
    `Email: ${order.reservation.customer.email}`,
    ...(order.reservation.customer.phone ? [`Phone: ${order.reservation.customer.phone}`] : ["Phone: Not provided"]),
    "",
    "Order details:",
    `Reservation: ${order.reservation.id}`,
    `Placed: ${formatReceiptDate(order.reservation.createdAt)}`,
    `Total: ${formatCurrency(orderTotal(order))}`,
    "",
    "Items:",
    ...order.reservation.items.map((item) => {
      const remainingQuantity = inventoryRemainingFor(order, item);
      const unitPrice = unitPriceFor(item);
      const lineTotal = unitPrice * item.quantity;

      return `- ${item.name} (${item.sku}) | ${item.size} | ${item.color} | qty ${item.quantity} | unit ${formatCurrency(
        unitPrice
      )} | line total ${formatCurrency(lineTotal)} | remaining ${
        typeof remainingQuantity === "number" ? remainingQuantity : "not available"
      }`;
    })
  ].join("\n");
}

function formatAdminHtml(order: MerchandiseReceiptOrder) {
  const rows = order.reservation.items
    .map((item) => {
      const remainingQuantity = inventoryRemainingFor(order, item);
      const unitPrice = unitPriceFor(item);
      const lineTotal = unitPrice * item.quantity;

      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;">
            <div>${escapeHtml(item.name)}</div>
            <div style="font-size:12px;color:#647084;margin-top:4px;">${escapeHtml(item.size)} | ${escapeHtml(item.color)}</div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;color:#647084;">${escapeHtml(item.sku)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${formatCurrency(unitPrice)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${formatCurrency(lineTotal)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #d7deea;text-align:right;">${
            typeof remainingQuantity === "number" ? remainingQuantity : "Not available"
          }</td>
        </tr>`;
    })
    .join("");

  return `
    <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,sans-serif;color:#13213f;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d7deea;padding:24px;">
        <img src="cid:${receiptLogoCid}" alt="JAANA school logo" width="180" style="display:block;width:180px;max-width:60%;height:auto;margin:0 0 18px;" />
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;">New merchandise order</h1>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4d5a70;">
          Receipt copy attached. Customer details, order details, and remaining quantities are shown below after this reservation was saved.
        </p>
        <p style="margin:0 0 8px;"><strong>Reservation:</strong> ${escapeHtml(order.reservation.id)}</p>
        <p style="margin:0 0 8px;"><strong>Placed:</strong> ${escapeHtml(formatReceiptDate(order.reservation.createdAt))}</p>
        <p style="margin:0 0 8px;"><strong>Customer:</strong> ${escapeHtml(order.reservation.customer.name)} &lt;${escapeHtml(
          order.reservation.customer.email
        )}&gt;</p>
        <p style="margin:0 0 8px;"><strong>Phone:</strong> ${escapeHtml(order.reservation.customer.phone || "Not provided")}</p>
        <p style="margin:0 0 18px;"><strong>Total:</strong> ${formatCurrency(orderTotal(order))}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px 12px;background:#eef2f7;">Item</th>
              <th align="left" style="padding:10px 12px;background:#eef2f7;">SKU</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Purchased</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Unit</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Total</th>
              <th align="right" style="padding:10px 12px;background:#eef2f7;">Remaining</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function receiptAttachment(order: MerchandiseReceiptOrder): Mail.Attachment {
  const filename = `jaana-merchandise-receipt-${order.reservation.id.replace(/[^a-z0-9-]/gi, "-")}.pdf`;

  return {
    filename,
    content: buildMerchandiseReceiptPdf(order),
    contentType: "application/pdf"
  };
}

function receiptLogoAttachment(): Mail.Attachment | null {
  try {
    if (!fs.existsSync(receiptLogoPath)) {
      return null;
    }

    return {
      filename: "jaana-school-logo.png",
      content: fs.readFileSync(receiptLogoPath),
      contentType: "image/png",
      cid: receiptLogoCid
    };
  } catch {
    return null;
  }
}

function messageAttachments(order: MerchandiseReceiptOrder) {
  const logoAttachment = receiptLogoAttachment();

  return [receiptAttachment(order), ...(logoAttachment ? [logoAttachment] : [])];
}

export async function sendMerchandiseReceiptNotification(
  order: MerchandiseReceiptOrder
): Promise<MerchandiseReceiptNotificationResult> {
  const config = getSmtpConfig();

  if (!config) {
    return {
      ok: false,
      error: getMerchandiseReceiptEmailConfigurationError()
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user && config.pass
        ? {
            auth: {
              user: config.user,
              pass: config.pass
            }
          }
        : {})
    });
    const customerMessage = transporter.sendMail({
      from: config.from,
      to: [order.reservation.customer.email],
      subject: `JAANA merchandise receipt ${order.reservation.id}`,
      text: formatCustomerText(order),
      html: formatCustomerHtml(order),
      attachments: messageAttachments(order)
    });
    const adminMessage = transporter.sendMail({
      from: config.from,
      to: getAdminRecipients(),
      replyTo: order.reservation.customer.email,
      subject: `JAANA merchandise order ${order.reservation.id}`,
      text: formatAdminText(order),
      html: formatAdminHtml(order),
      attachments: messageAttachments(order)
    });
    const results = await Promise.allSettled([customerMessage, adminMessage]);
    const rejectedResults = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");

    if (rejectedResults.length) {
      return {
        ok: false,
        error: `Unable to send merchandise receipt email: ${rejectedResults
          .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)))
          .join("; ")}`
      };
    }

    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? `Unable to send merchandise receipt email: ${error.message}` : "Unable to send merchandise receipt email."
    };
  }
}
