import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MedicalRecordsViewer } from '../MedicalRecordsViewer';

describe('MedicalRecordsViewer attachments', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'record-1',
            patientId: 'patient-1',
            recordType: 'GENERAL',
            title: 'Uploaded ultrasound report',
            createdAt: new Date('2026-04-01T10:00:00Z').toISOString(),
            updatedAt: new Date('2026-04-01T10:00:00Z').toISOString(),
            recordedBy: 'provider-1',
            attachments: [
              'https://blob.example.com/medical-documents/patients/patient-1/report.pdf',
              'https://blob.example.com/medical-documents/patients/patient-1/scan.png',
            ],
          },
        ],
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders preview and download links for uploaded attachments', async () => {
    render(<MedicalRecordsViewer patientId="patient-1" />);

    await waitFor(() => {
      expect(screen.getByText('Uploaded ultrasound report')).toBeInTheDocument();
    });

    const previewLinks = screen.getAllByText('Preview');
    const downloadLinks = screen.getAllByText('Download');

    expect(previewLinks).toHaveLength(2);
    expect(downloadLinks).toHaveLength(2);
    expect(previewLinks[0]).toHaveAttribute('href', expect.stringContaining('report.pdf'));
    expect(downloadLinks[0]).toHaveAttribute('download');
    expect(screen.getByAltText('scan.png')).toBeInTheDocument();
  });
});
