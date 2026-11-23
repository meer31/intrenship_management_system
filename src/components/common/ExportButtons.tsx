import React, { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => string | number);
}

export interface ExportButtonsProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  fileNamePrefix?: string;
  title?: string;
}

export function ExportButtons<T>({
  data,
  columns,
  fileNamePrefix = 'report',
  title = 'Internship Management Portal Report',
}: ExportButtonsProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const exportExcelCsv = () => {
    try {
      if (!data || data.length === 0) {
        toast.warning('No data to export');
        return;
      }

      const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
      const rows = data.map((item) =>
        columns
          .map((c) => {
            let val: string | number = '';
            if (typeof c.key === 'function') {
              val = c.key(item);
            } else {
              val = (item[c.key] as unknown as string | number) ?? '';
            }
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      );

      const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Excel / CSV export generated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export data');
    }
  };

  const exportPdf = () => {
    try {
      setIsExporting(true);
      if (!data || data.length === 0) {
        toast.warning('No data to export');
        setIsExporting(false);
        return;
      }

      const doc = new jsPDF('landscape');
      const dateStr = new Date().toLocaleString();

      // Header
      doc.setFontSize(16);
      doc.setTextColor(20, 45, 78); // Navy
      doc.text(title, 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate
      doc.text(`Institutional Internship Management System | Generated on ${dateStr}`, 14, 25);

      doc.setDrawColor(220, 228, 236);
      doc.line(14, 28, 280, 28);

      // Table Header
      let y = 35;
      const colWidth = Math.floor(260 / columns.length);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 45, 78);

      columns.forEach((col, i) => {
        doc.text(col.header, 14 + i * colWidth, y);
      });

      y += 4;
      doc.setDrawColor(200, 210, 220);
      doc.line(14, y, 280, y);
      y += 6;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      data.slice(0, 30).forEach((item) => {
        if (y > 185) {
          doc.addPage('landscape');
          y = 20;
        }

        columns.forEach((col, i) => {
          let val: string | number = '';
          if (typeof c_key(col) === 'function') {
            val = (col.key as (itm: T) => string | number)(item);
          } else {
            val = (item[col.key as keyof T] as unknown as string | number) ?? '';
          }
          const textVal = String(val).slice(0, 26);
          doc.text(textVal, 14 + i * colWidth, y);
        });

        y += 7;
      });

      if (data.length > 30) {
        y += 4;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`* Showing first 30 records out of ${data.length} total entries. Download CSV for full dataset.`, 14, y);
      }

      doc.save(`${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF document generated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  function c_key(col: ExportColumn<T>) {
    return col.key;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={exportExcelCsv}
        leftIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
      >
        Export Excel
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={exportPdf}
        isLoading={isExporting}
        leftIcon={<FileText className="h-4 w-4 text-red-600" />}
      >
        Export PDF
      </Button>
    </div>
  );
}
