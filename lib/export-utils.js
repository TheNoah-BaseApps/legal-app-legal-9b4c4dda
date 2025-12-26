export function convertToCSV(data, columns) {
  if (!data || data.length === 0) return '';

  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.accessor(row);
      const stringValue = value?.toString() || '';
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToCSV(data, columns, filename) {
  const csv = convertToCSV(data, columns);
  downloadCSV(filename, csv);
}

export function convertToExcelData(data, columns) {
  const headers = columns.map(col => col.header);
  const rows = data.map(row => {
    return columns.map(col => col.accessor(row));
  });
  
  return [headers, ...rows];
}

export async function exportToExcel(data, columns, filename) {
  try {
    const XLSX = await import('xlsx');
    const excelData = convertToExcelData(data, columns);
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}

export async function exportToPDF(data, columns, title, filename) {
  try {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    const headers = [columns.map(col => col.header)];
    const rows = data.map(row => {
      return columns.map(col => {
        const value = col.accessor(row);
        return value?.toString() || '';
      });
    });
    
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    doc.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

export function formatDataForExport(data, type) {
  if (type === 'customers') {
    return data.map(item => ({
      'Customer ID': item.customer_id,
      'Customer Name': item.customer_name,
      'Contact Person': item.contact_person,
      'Email': item.email_address,
      'Phone': item.contact_number,
      'Industry': item.industry_type,
      'Status': item.customer_status,
      'Registration Date': item.registration_date
    }));
  }
  
  if (type === 'cases') {
    return data.map(item => ({
      'Case ID': item.case_id,
      'Case Title': item.case_title,
      'Client': item.customer_name,
      'Case Type': item.case_type,
      'Status': item.case_status,
      'Attorney': item.attorney_name,
      'Filing Date': item.filing_date,
      'Court': item.court_name,
      'Hearing Date': item.hearing_date
    }));
  }
  
  if (type === 'engagements') {
    return data.map(item => ({
      'Engagement ID': item.engagement_id,
      'Client': item.customer_name,
      'Type': item.engagement_type,
      'Channel': item.engagement_channel,
      'Date': item.engagement_date,
      'Outcome': item.engagement_outcome,
      'Contact Person': item.contact_person,
      'Recorded By': item.recorder_name
    }));
  }
  
  return data;
}