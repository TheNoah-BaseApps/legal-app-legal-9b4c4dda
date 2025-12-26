'use client';

import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '@/lib/export-utils';
import { toast } from 'sonner';

export default function ExportButtons({ data, filename, type }) {
  const handleExportCSV = () => {
    try {
      const formattedData = formatDataForExport(data, type);
      const columns = Object.keys(formattedData[0] || {}).map(key => ({
        header: key,
        accessor: (row) => row[key]
      }));
      exportToCSV(formattedData, columns, `${filename}.csv`);
      toast.success('Exported to CSV');
    } catch (error) {
      toast.error('Failed to export to CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const formattedData = formatDataForExport(data, type);
      const columns = Object.keys(formattedData[0] || {}).map(key => ({
        header: key,
        accessor: (row) => row[key]
      }));
      await exportToExcel(formattedData, columns, `${filename}.xlsx`);
      toast.success('Exported to Excel');
    } catch (error) {
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const formattedData = formatDataForExport(data, type);
      const columns = Object.keys(formattedData[0] || {}).map(key => ({
        header: key,
        accessor: (row) => row[key]
      }));
      await exportToPDF(formattedData, columns, filename, `${filename}.pdf`);
      toast.success('Exported to PDF');
    } catch (error) {
      toast.error('Failed to export to PDF');
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportExcel}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPDF}>
        <FileDown className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}