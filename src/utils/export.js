export const exportToCSV = (analytics, aiInsight, activeTab) => {
  const rows = [
    ['Section', 'Metric', 'Value'],
    ['Security', 'RFID Scans', String(analytics.rfidCount)],
    ['Motion', 'IR1 Count', String(analytics.ir1Count)],
    ['Motion', 'IR2 Count', String(analytics.ir2Count)],
    ['Lighting', 'Average LDR (LUX)', String(analytics.avgLdr)],
    ['Lighting', 'Darkness Duration (hrs)', String(analytics.darknessDuration)],
    ['Lighting', 'Threshold Crossings (daily)', String(analytics.thresholdCrossings)],
    ['System', 'Uptime (%)', String(analytics.uptime)],
    ['Soil', 'Last Moisture (%)', String(analytics.lastSoilVal)],
    ['Soil', 'Moisture Status', String(analytics.moistureStatus)],
    ['Soil', 'Variability (±%)', String(analytics.moistureVariability)],
  ];

  const aiText = aiInsight[activeTab] || 'AI insight not generated for current tab';
  rows.push(['AI', 'Insight (' + activeTab + ')', aiText.replace(/\r?\n/g, ' ')]);

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smartcity_report_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (analytics, aiInsight, activeTab, addNotification) => {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      addNotification('Error: PDF engine not loaded', 'error');
      return false;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 48;
    let y = margin;

    doc.setFontSize(18);
    doc.text('Smart City Dashboard Report', margin, y);
    y += 24;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 24;

    doc.setFontSize(12);
    doc.text('Overview', margin, y);
    y += 16;

    doc.setFontSize(11);
    const lines = [
      `RFID Scans: ${analytics.rfidCount}`,
      `Motion IR1/IR2: ${analytics.ir1Count} / ${analytics.ir2Count}`,
      `Average LDR: ${analytics.avgLdr} LUX`,
      `Darkness Duration: ${analytics.darknessDuration} hrs`,
      `Threshold Crossings: ${analytics.thresholdCrossings} / day`,
      `System Uptime: ${analytics.uptime}%`,
      `Soil Moisture: ${analytics.lastSoilVal}% (${analytics.moistureStatus})`,
      `Moisture Variability: ±${analytics.moistureVariability}%`,
    ];

    lines.forEach((t) => {
      doc.text(`• ${t}`, margin, y);
      y += 16;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text('AI Insight', margin, y);
    y += 16;

    doc.setFontSize(11);
    const insight = aiInsight[activeTab] || 'No AI insight generated for current tab.';
    const wrapped = doc.splitTextToSize(insight.replace(/\*/g, ''), 520);

    wrapped.forEach((line) => {
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    });

    doc.save(`smartcity_report_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
    return true;
  } catch (e) {
    addNotification('Error: Failed to generate PDF', 'error');
    return false;
  }
};

export const loadJsPDF = () => {
  return new Promise((resolve) => {
    if (window.jspdf) return resolve(window.jspdf);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => resolve(window.jspdf);
    document.head.appendChild(script);
  });
};
