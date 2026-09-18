import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';

export function generateFinancialPDF(report: ReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = [15, 23, 42]; // Slate 900
  const cyanAccent = [6, 182, 212]; // Cyan 500
  const lightBg = [248, 250, 252]; // Slate 50
  const textMuted = [100, 116, 139]; // Slate 500

  // -------------------------------------------------------------
  // HEADER BAR
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  // Cyan brand accent line
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 32, 210, 1.5, 'F');

  // App Title & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('PAYTM CASHFLOW AI', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Predict. Explain. Plan.  •  Financial Cash-Flow Copilot', 14, 22);

  // Period badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 182, 212);
  doc.text(report.periodLabel.toUpperCase(), 196, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${report.generatedAt}`, 196, 21, { align: 'right' });

  let y = 42;

  // Disclaimer banner
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(14, y, 182, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text('SYNTHETIC / DEMO DATA  •  FORECASTS ARE ESTIMATES  •  NOT FINANCIAL OR LENDING ADVICE', 18, y + 5.2);

  y += 14;

  // -------------------------------------------------------------
  // 1. FINANCIAL SNAPSHOT TILES
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. FINANCIAL SNAPSHOT', 14, y);

  y += 4;

  const cardWidth = 43;
  const cardHeight = 18;
  const cards = [
    { label: 'Available Balance', val: `Rs. ${report.snapshot.availableBalance.toLocaleString('en-IN')}`, color: [14, 165, 233] },
    { label: 'Monthly Income', val: `Rs. ${report.snapshot.monthlyIncome.toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'Monthly Spending', val: `Rs. ${report.snapshot.monthlyExpenses.toLocaleString('en-IN')}`, color: [244, 63, 94] },
    { label: 'Projected Buffer', val: `Rs. ${report.snapshot.projectedBuffer.toLocaleString('en-IN')}`, color: [6, 182, 212] },
  ];

  cards.forEach((card, idx) => {
    const xPos = 14 + idx * (cardWidth + 3.3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(xPos, y, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, y, cardWidth, cardHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, xPos + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.val, xPos + 3, y + 13.5);
  });

  y += cardHeight + 8;

  // -------------------------------------------------------------
  // 2. AI FINANCIAL BRIEF (GROQ AI / FALLBACK)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. AI FINANCIAL BRIEF (EXPLAINABLE COPILOT)', 14, y);

  y += 4;
  doc.setFillColor(240, 249, 255); // Sky 50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y, 182, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const splitBrief = doc.splitTextToSize(report.aiFinancialBrief, 174);
  doc.text(splitBrief, 18, y + 5.5);

  y += 28;

  // -------------------------------------------------------------
  // 3. MONEY FLOW DISTRIBUTION & NOTABLE CHANGES
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. MONEY FLOW BREAKDOWN & NOTABLE CHANGES', 14, y);

  y += 4;

  // Table of Notable Changes
  const notableData = report.notableChanges.map((change, i) => [`#${i + 1}`, change]);
  autoTable(doc, {
    startY: y,
    head: [['Ref', 'Observed Cash-Flow Behavior']],
    body: notableData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // 4. CASH-FLOW FORECAST TIMELINE
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CASH-FLOW FORECAST & PRESSURE TIMELINE', 14, y);

  y += 4;

  const forecastRows = report.forecast.map((pt) => [
    pt.period,
    pt.date,
    `Rs. ${pt.projectedBalance.toLocaleString('en-IN')}`,
    `Rs. ${pt.fixedCommitments.toLocaleString('en-IN')}`,
    `Rs. ${pt.variableSpending.toLocaleString('en-IN')}`,
    `Rs. ${pt.remainingBuffer.toLocaleString('en-IN')}`,
    pt.pressureLevel.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Period', 'Timeline Date', 'Projected Balance', 'Commitments', 'Variable Exp', 'Buffer Floor', 'Pressure']],
    body: forecastRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    columnStyles: {
      6: { fontStyle: 'bold', textColor: [225, 29, 72] },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // 5. COMMITMENTS & UPCOMING OBLIGATIONS
  // -------------------------------------------------------------
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('5. SCHEDULED COMMITMENTS & OBLIGATIONS', 14, y);

  y += 4;

  const commitmentRows = report.commitments.map((c) => [
    c.name,
    c.category,
    `Rs. ${c.amount.toLocaleString('en-IN')}`,
    c.frequency,
    c.dueDate,
    c.status,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Commitment Name', 'Category', 'Amount', 'Frequency', 'Due Date', 'Status']],
    body: commitmentRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // 6. SPENDING BY CATEGORY
  // -------------------------------------------------------------
  if (y > 225) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('6. SPENDING BY CATEGORY & VELOCITY', 14, y);

  y += 4;

  const categoryRows = report.spendingByCategory.map((c) => [
    c.category,
    `Rs. ${c.amount.toLocaleString('en-IN')}`,
    `${c.percentage}%`,
    c.changeVsPrior > 0 ? `+${c.changeVsPrior}%` : `${c.changeVsPrior}%`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Amount', '% of Total Outflow', 'Velocity Change vs Prior Cycle']],
    body: categoryRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // 7. SIMULATION SUMMARY (SEPARATE FROM ACTUAL DATA)
  // -------------------------------------------------------------
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('7. SIMULATION SCENARIO STATUS', 14, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (report.hasSimulation) {
    doc.text('ACTIVE SIMULATION APPLIED IN SESSION', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      'Simulated transactions are isolated from historical settled data and serve purely for stress-testing future liquidity.',
      18,
      y + 11
    );
  } else {
    doc.text('BASELINE REPORT (NO ACTIVE SIMULATION OVERLAY)', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      'All figures represent default synthetic baseline demo data without scenario alterations.',
      18,
      y + 11
    );
  }

  // -------------------------------------------------------------
  // PAGE FOOTER (EVERY PAGE)
  // -------------------------------------------------------------
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 283, 196, 283);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('CashFlow AI — Predict. Explain. Plan.', 14, 288);
    doc.text('Prototype using synthetic/demo data. Forecasts are estimates and are not financial advice.', 14, 292);

    doc.text(`Page ${i} of ${totalPages}`, 196, 290, { align: 'right' });
  }

  return doc;
}
