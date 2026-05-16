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

    const doc = new jsPDF({ 
      unit: 'pt', 
      format: 'a4',
      compress: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Color Palette
    const colors = {
      primary: [99, 102, 241],      // Indigo
      secondary: [100, 116, 139],   // Slate
      success: [16, 185, 129],      // Emerald
      danger: [244, 63, 94],        // Rose
      warning: [245, 158, 11],      // Amber
      dark: [15, 23, 42],           // Dark slate
      light: [241, 245, 249],       // Light slate
    };

    // Helper Functions
    const addHeader = () => {
      // Header background
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Logo/Icon placeholder (circle)
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 15, 35, 15, 'F');
      doc.setFillColor(...colors.primary);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('S', margin + 10, 40);
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SmartOS Dashboard Report', margin + 45, 45);
    };

    const addFooter = (pageNum) => {
      doc.setFillColor(...colors.light);
      doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
      
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 20);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 30, pageHeight - 20);
    };

    const addSectionHeader = (title, icon = '') => {
      if (y > pageHeight - 100) {
        doc.addPage();
        addHeader();
        addFooter(doc.internal.getNumberOfPages());
        y = 110;
      }
      
      doc.setFillColor(...colors.light);
      doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
      
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const displayTitle = icon ? `${icon} ${title}` : title;
      doc.text(displayTitle, margin + 15, y + 22);
      
      y += 50;
    };

    const addMetricCard = (label, value, color = colors.primary) => {
      if (y > pageHeight - 100) {
        doc.addPage();
        addHeader();
        addFooter(doc.internal.getNumberOfPages());
        y = 110;
      }
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors.light);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y, contentWidth, 40, 5, 5, 'FD');
      
      // Accent bar
      doc.setFillColor(...color);
      doc.roundedRect(margin, y, 5, 40, 2, 2, 'F');
      
      // Label
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 20, y + 18);
      
      // Value
      doc.setTextColor(...colors.dark);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), margin + 20, y + 32);
      
      y += 48;
    };

    const addTextBlock = (text, isHighlight = false) => {
      const wrapped = doc.splitTextToSize(text, contentWidth - 30);
      const blockHeight = (wrapped.length * 14) + 30;
      
      if (y + blockHeight > pageHeight - 60) {
        doc.addPage();
        addHeader();
        addFooter(doc.internal.getNumberOfPages());
        y = 110;
      }
      
      if (isHighlight) {
        doc.setFillColor(252, 252, 253);
        doc.roundedRect(margin, y, contentWidth, blockHeight, 5, 5, 'F');
      }
      
      doc.setTextColor(...colors.dark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let textY = y + 20;
      wrapped.forEach((line) => {
        doc.text(line, margin + 15, textY);
        textY += 14;
      });
      
      y += blockHeight + 10;
    };

    // === PAGE 1: HEADER & OVERVIEW ===
    addHeader();
    addFooter(1);
    y = 110;

    // Status Badge
    doc.setFillColor(...colors.success);
    doc.roundedRect(margin, y, 120, 30, 15, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM ONLINE', margin + 15, y + 20);
    y += 50;

    // Overview Section
    addSectionHeader('System Overview', '');

    // Metrics Grid
    const metrics = [
      { label: 'RFID Security Scans', value: `${analytics.rfidCount} scans`, color: colors.primary },
      { label: 'Motion Detection (IR1)', value: `${analytics.ir1Count} events`, color: colors.primary },
      { label: 'Motion Detection (IR2)', value: `${analytics.ir2Count} events`, color: colors.primary },
      { label: 'Average Light Level', value: `${analytics.avgLdr} LUX`, color: colors.warning },
      { label: 'Darkness Duration', value: `${analytics.darknessDuration} hours`, color: colors.warning },
      { label: 'Light Threshold Crossings', value: `${analytics.thresholdCrossings} / day`, color: colors.warning },
      { label: 'System Uptime', value: `${analytics.uptime}%`, color: colors.success },
      { label: 'Soil Moisture Level', value: `${analytics.lastSoilVal}% (${analytics.moistureStatus})`, color: colors.success },
      { label: 'Moisture Variability', value: `±${analytics.moistureVariability}%`, color: colors.secondary },
    ];

    metrics.forEach(metric => {
      addMetricCard(metric.label, metric.value, metric.color);
    });

    // === PAGE 2: AI INSIGHTS ===
    doc.addPage();
    addHeader();
    addFooter(2);
    y = 110;

    addSectionHeader('AI-Powered Insights', '');

    const insight = aiInsight[activeTab] || 'No AI insight generated for current tab.';
    
    // Split insight into sections if it has structured format
    const insightLines = insight.split('\n').filter(line => line.trim());
    
    insightLines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (y > pageHeight - 80) {
        doc.addPage();
        addHeader();
        addFooter(doc.internal.getNumberOfPages());
        y = 110;
      }
      
      // Check if line is a section header (all caps or ends with colon)
      if (trimmedLine.match(/^[A-Z\s]+:$/) || trimmedLine.match(/^[A-Z\s]{10,}$/)) {
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text(trimmedLine, margin, y);
        y += 18;
      } 
      // Check if line is a bullet point
      else if (trimmedLine.startsWith('-')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.dark);
        const bulletText = trimmedLine.substring(1).trim();
        const wrapped = doc.splitTextToSize(bulletText, contentWidth - 30);
        wrapped.forEach(wLine => {
          if (y > pageHeight - 60) {
            doc.addPage();
            addHeader();
            addFooter(doc.internal.getNumberOfPages());
            y = 110;
          }
          doc.circle(margin + 5, y - 3, 2, 'F');
          doc.text(wLine, margin + 15, y);
          y += 14;
        });
      }
      // Regular text
      else if (trimmedLine) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.dark);
        const wrapped = doc.splitTextToSize(trimmedLine, contentWidth - 20);
        wrapped.forEach(wLine => {
          if (y > pageHeight - 60) {
            doc.addPage();
            addHeader();
            addFooter(doc.internal.getNumberOfPages());
            y = 110;
          }
          doc.text(wLine, margin + 10, y);
          y += 14;
        });
        y += 4; // Extra space after paragraph
      }
    });

    // === PAGE 3: RECOMMENDATIONS ===
    y += 20;
    addSectionHeader('System Recommendations', '');

    const recommendations = [
      'Monitor RFID access patterns for security anomalies',
      'Optimize street lighting schedule based on LDR data trends',
      'Schedule preventive maintenance during low-traffic periods',
      'Review soil moisture alerts for irrigation efficiency',
    ];

    recommendations.forEach((rec, idx) => {
      if (y > pageHeight - 100) {
        doc.addPage();
        addHeader();
        addFooter(doc.internal.getNumberOfPages());
        y = 110;
      }
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors.light);
      doc.roundedRect(margin, y, contentWidth, 35, 5, 5, 'FD');
      
      doc.setFillColor(...colors.primary);
      doc.circle(margin + 15, y + 17, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(String(idx + 1), margin + 12, y + 21);
      
      doc.setTextColor(...colors.dark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(rec, margin + 35, y + 20);
      
      y += 43;
    });

    // Save
    doc.save(`SmartOS_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
  } catch (e) {
    console.error('PDF Export Error:', e);
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
