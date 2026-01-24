import { logger } from '@/lib/logger';

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  delimiter?: string;
  encoding?: string;
}

export class CSVExporter {
  private static instance: CSVExporter;

  static getInstance(): CSVExporter {
    if (!CSVExporter.instance) {
      CSVExporter.instance = new CSVExporter();
    }
    return CSVExporter.instance;
  }

  exportToCSV<T extends Record<string, any>>(
    data: T[],
    options: CSVExportOptions = {}
  ): string {
    const {
      filename = 'export',
      headers,
      delimiter = ',',
      encoding = 'utf-8',
    } = options;

    if (data.length === 0) {
      logger.warn('No data to export to CSV');
      return '';
    }

    try {
      // Get headers from first object if not provided
      const csvHeaders = headers || Object.keys(data[0]);
      
      // Convert data to CSV format
      const csvRows = [
        // Header row
        csvHeaders.join(delimiter),
        // Data rows
        ...data.map(row => 
          csvHeaders.map(header => {
            const value = row[header];
            return this.escapeCSVValue(value, delimiter);
          }).join(delimiter)
        )
      ];

      const csvContent = csvRows.join('\n');

      logger.info('CSV export completed', {
        filename,
        recordCount: data.length,
        headers: csvHeaders.length,
      });

      return csvContent;

    } catch (error) {
      logger.error('CSV export failed', { error, filename });
      throw new Error('Failed to export data to CSV');
    }
  }

  exportPatientsToCSV(patients: any[]): string {
    const headers = [
      'Patient ID',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Gender',
      'Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Postal Code',
      'Country',
      'Blood Type',
      'Allergies',
      'Medical History',
      'Emergency Contact',
      'Emergency Phone',
      'Insurance Provider',
      'Insurance Number',
      'Active',
      'Created At',
    ];

    const formattedData = patients.map(patient => ({
      'Patient ID': patient.patientId || '',
      'First Name': patient.firstName || '',
      'Last Name': patient.lastName || '',
      'Date of Birth': this.formatDate(patient.dateOfBirth),
      'Gender': patient.gender || '',
      'Phone': patient.phone || '',
      'Email': patient.email || '',
      'Address': patient.address || '',
      'City': patient.city || '',
      'State': patient.state || '',
      'Postal Code': patient.postalCode || '',
      'Country': patient.country || '',
      'Blood Type': patient.bloodType || '',
      'Allergies': Array.isArray(patient.allergies) ? patient.allergies.join('; ') : '',
      'Medical History': patient.medicalHistory || '',
      'Emergency Contact': patient.emergencyContactName || '',
      'Emergency Phone': patient.emergencyContactPhone || '',
      'Insurance Provider': patient.insuranceProvider || '',
      'Insurance Number': patient.insuranceNumber || '',
      'Active': patient.isActive ? 'Yes' : 'No',
      'Created At': this.formatDateTime(patient.createdAt),
    }));

    return this.exportToCSV(formattedData, {
      filename: 'patients',
      headers,
    });
  }

  exportAppointmentsToCSV(appointments: any[]): string {
    const headers = [
      'Appointment ID',
      'Patient ID',
      'Patient Name',
      'Title',
      'Description',
      'Start Time',
      'End Time',
      'Type',
      'Status',
      'Location',
      'Notes',
      'Created At',
      'Updated At',
    ];

    const formattedData = appointments.map(appointment => ({
      'Appointment ID': appointment.id || '',
      'Patient ID': appointment.patient?.patientId || '',
      'Patient Name': `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim(),
      'Title': appointment.title || '',
      'Description': appointment.description || '',
      'Start Time': this.formatDateTime(appointment.startTime),
      'End Time': this.formatDateTime(appointment.endTime),
      'Type': appointment.type || '',
      'Status': appointment.status || '',
      'Location': appointment.location || '',
      'Notes': appointment.notes || '',
      'Created At': this.formatDateTime(appointment.createdAt),
      'Updated At': this.formatDateTime(appointment.updatedAt),
    }));

    return this.exportToCSV(formattedData, {
      filename: 'appointments',
      headers,
    });
  }

  exportMedicalRecordsToCSV(records: any[]): string {
    const headers = [
      'Record ID',
      'Patient ID',
      'Patient Name',
      'Record Type',
      'Title',
      'Description',
      'Diagnosis',
      'Symptoms',
      'Treatment',
      'Medications',
      'Lab Results',
      'Vitals',
      'Healthcare Provider',
      'Facility',
      'Notes',
      'Created At',
      'Updated At',
    ];

    const formattedData = records.map(record => ({
      'Record ID': record.id || '',
      'Patient ID': record.patient?.patientId || '',
      'Patient Name': `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`.trim(),
      'Record Type': record.recordType || '',
      'Title': record.title || '',
      'Description': record.description || '',
      'Diagnosis': record.diagnosis || '',
      'Symptoms': Array.isArray(record.symptoms) ? record.symptoms.join('; ') : '',
      'Treatment': record.treatment || '',
      'Medications': Array.isArray(record.medications) ? record.medications.join('; ') : '',
      'Lab Results': Array.isArray(record.labResults) ? record.labResults.join('; ') : '',
      'Vitals': record.vitals ? JSON.stringify(record.vitals) : '',
      'Healthcare Provider': record.healthcareProvider || '',
      'Facility': record.facility || '',
      'Notes': record.notes || '',
      'Created At': this.formatDateTime(record.createdAt),
      'Updated At': this.formatDateTime(record.updatedAt),
    }));

    return this.exportToCSV(formattedData, {
      filename: 'medical-records',
      headers,
    });
  }

  private escapeCSVValue(value: any, delimiter: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);
    
    // If the value contains the delimiter, quotes, or newlines, wrap in quotes and escape quotes
    if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }

  private formatDateTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US');
  }

  downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logger.info('CSV file downloaded', { filename });
    } else {
      throw new Error('Browser does not support file download');
    }
  }
}

export const csvExporter = CSVExporter.getInstance();
