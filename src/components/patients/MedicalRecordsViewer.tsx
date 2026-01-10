'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Stethoscope, TestTube, Pill, FileText } from 'lucide-react';
import { MedicalRecord, Medication, LabResult, Vitals } from '@/types/patient';
import { format } from 'date-fns';

interface MedicalRecordsViewerProps {
  patientId: string;
  onAddRecord?: () => void;
}

const getRecordIcon = (recordType: string) => {
  switch (recordType) {
    case 'CONSULTATION':
      return <Stethoscope className="h-4 w-4" />;
    case 'LAB_RESULT':
      return <TestTube className="h-4 w-4" />;
    case 'PRESCRIPTION':
      return <Pill className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NORMAL':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'HIGH':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'LOW':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CRITICAL':
      return 'bg-red-200 text-red-900 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MedicationsList = ({ medications }: { medications: Medication[] }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-700">Medications</h4>
    {medications.map((med, idx) => (
      <div key={idx} className="bg-gray-50 rounded p-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{med.name}</p>
            <p className="text-sm text-gray-600">{med.dosage}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{med.frequency}</p>
            {med.duration && <p>Duration: {med.duration}</p>}
          </div>
        </div>
        {med.instructions && (
          <p className="text-sm text-gray-700 mt-2">{med.instructions}</p>
        )}
      </div>
    ))}
  </div>
);

const LabResultsList = ({ labResults }: { labResults: LabResult[] }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-700">Lab Results</h4>
    {labResults.map((result, idx) => (
      <div key={idx} className={`border rounded p-3 ${getStatusColor(result.status)}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{result.testName}</p>
            <p className="text-sm font-bold">{result.value} {result.unit}</p>
          </div>
          <Badge className={getStatusColor(result.status)}>
            {result.status}
          </Badge>
        </div>
        {result.referenceRange && (
          <p className="text-sm mt-1">Reference: {result.referenceRange}</p>
        )}
        {result.notes && (
          <p className="text-sm mt-1">{result.notes}</p>
        )}
      </div>
    ))}
  </div>
);

const VitalsDisplay = ({ vitals }: { vitals: Vitals }) => (
  <div className="grid grid-cols-2 gap-4">
    {vitals.temperature && (
      <div className="text-center p-3 bg-blue-50 rounded">
        <p className="text-lg font-bold text-blue-700">{vitals.temperature}°C</p>
        <p className="text-sm text-blue-600">Temperature</p>
      </div>
    )}
    {(vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) && (
      <div className="text-center p-3 bg-red-50 rounded">
        <p className="text-lg font-bold text-red-700">
          {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
        </p>
        <p className="text-sm text-red-600">Blood Pressure</p>
      </div>
    )}
    {vitals.heartRate && (
      <div className="text-center p-3 bg-green-50 rounded">
        <p className="text-lg font-bold text-green-700">{vitals.heartRate} BPM</p>
        <p className="text-sm text-green-600">Heart Rate</p>
      </div>
    )}
    {vitals.weight && (
      <div className="text-center p-3 bg-yellow-50 rounded">
        <p className="text-lg font-bold text-yellow-700">{vitals.weight} kg</p>
        <p className="text-sm text-yellow-600">Weight</p>
      </div>
    )}
  </div>
);

const MedicalRecordCard = ({ record }: { record: MedicalRecord }) => (
  <Card className="mb-4">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getRecordIcon(record.recordType)}
          <CardTitle className="text-lg">{record.title}</CardTitle>
        </div>
        <Badge variant="outline">
          {record.recordType.replace(/_/g, ' ')}
        </Badge>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {format(new Date(record.createdAt), 'MMM dd, yyyy HH:mm')}
        </span>
        {record.healthcareProvider && (
          <span className="text-gray-700">
            Provider: {record.healthcareProvider}
          </span>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Basic Information */}
      {record.description && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
          <p className="text-sm text-gray-600">{record.description}</p>
        </div>
      )}

      {record.diagnosis && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h4>
          <p className="text-sm font-medium text-red-700">{record.diagnosis}</p>
        </div>
      )}

      {/* Symptoms */}
      {record.symptoms && record.symptoms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Symptoms</h4>
          <div className="flex flex-wrap gap-1">
            {record.symptoms.map((symptom, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {symptom}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Treatment */}
      {record.treatment && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Treatment</h4>
          <p className="text-sm text-gray-600">{record.treatment}</p>
        </div>
      )}

      {/* Medications */}
      {record.medications && record.medications.length > 0 && (
        <MedicationsList medications={record.medications} />
      )}

      {/* Lab Results */}
      {record.labResults && record.labResults.length > 0 && (
        <LabResultsList labResults={record.labResults} />
      )}

      {/* Vitals */}
      {record.vitals && (
        <VitalsDisplay vitals={record.vitals} />
      )}

      {/* Notes */}
      {record.notes && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
          <p className="text-sm text-gray-600">{record.notes}</p>
        </div>
      )}

      {/* Facility */}
      {record.facility && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Facility</h4>
          <p className="text-sm text-gray-600">{record.facility}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export function MedicalRecordsViewer({ patientId, onAddRecord }: MedicalRecordsViewerProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMedicalRecords();
  }, [patientId]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('recordType', activeTab);
      }

      const response = await fetch(`/api/patients/${patientId}/records?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medical records');
      }

      const data = await response.json();
      setRecords(data.data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordCount = (type: string) => {
    return records.filter(record =>
      type === 'all' ? true : record.recordType === type
    ).length;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Medical Records</span>
            {onAddRecord && (
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Medical Records ({getRecordCount(activeTab)})</span>
          {onAddRecord && (
            <Button onClick={onAddRecord}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive health history and medical records
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All ({getRecordCount('all')})
            </TabsTrigger>
            <TabsTrigger value="CONSULTATION" className="text-xs">
              Consultations ({getRecordCount('CONSULTATION')})
            </TabsTrigger>
            <TabsTrigger value="LAB_RESULT" className="text-xs">
              Labs ({getRecordCount('LAB_RESULT')})
            </TabsTrigger>
            <TabsTrigger value="PRESCRIPTION" className="text-xs">
              Prescriptions ({getRecordCount('PRESCRIPTION')})
            </TabsTrigger>
            <TabsTrigger value="PROCEDURE" className="text-xs">
              Procedures ({getRecordCount('PROCEDURE')})
            </TabsTrigger>
            <TabsTrigger value="PRENATAL_VISIT" className="text-xs">
              Prenatal ({getRecordCount('PRENATAL_VISIT')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {records.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No medical records found
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all'
                    ? 'No medical records have been added yet.'
                    : `No ${activeTab.toLowerCase().replace(/_/g, ' ')} records found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <MedicalRecordCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
