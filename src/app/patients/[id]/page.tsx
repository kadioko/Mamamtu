'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, User, Calendar, FileText, Activity } from 'lucide-react';
import { MedicalRecordsViewer } from '@/components/patients/MedicalRecordsViewer';
import { MedicalRecordForm } from '@/components/patients/MedicalRecordForm';
import { Patient } from '@/types/patient';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [appointments, setAppointments] = useState<Array<{
    id: string;
    title: string;
    startTime: string;
    status: string;
    type: string;
  }>>([]);
  const [vitals, setVitals] = useState<{
    latest: Record<string, unknown>;
    history: Record<string, unknown>[];
  } | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient');
        }
        
        const data = await response.json();
        
        // Convert date strings to Date objects
        const patientData: Patient = {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };
        
        setPatient(patientData);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient information');
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await fetch(`/api/patients/${id}/appointments?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchVitals = async () => {
    try {
      setLoadingVitals(true);
      const response = await fetch(`/api/patients/${id}/vitals?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setVitals(data);
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
    } finally {
      setLoadingVitals(false);
    }
  };

    fetchPatient();
    fetchAppointments();
    fetchVitals();
  }, [id]);

  const handleAddRecordSuccess = () => {
    setShowAddRecordForm(false);
    // Refresh medical records
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Patient</h1>
          <p className="text-gray-600 mb-6">{error || 'Patient not found'}</p>
          <Button onClick={() => router.push('/dashboard/patients')}>
            ← Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/patients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600">Patient ID: {patient.patientId}</p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Patient
        </Button>
      </div>

      {/* Patient Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p>{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</p>
                <p className="text-sm text-gray-500">
                  Age: {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p>{patient.gender.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p>{patient.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p>{patient.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p>
                {patient.address}, {patient.city}, {patient.state}, {patient.postalCode}, {patient.country}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{patient.bloodType}</p>
              <p className="text-sm text-gray-600">Blood Type</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <Badge variant={patient.isActive ? "default" : "secondary"}>
                {patient.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Visit</p>
              <p className="text-sm">
                {appointments.length > 0 && appointments.some(apt => apt.status === 'COMPLETED')
                  ? format(new Date(appointments.find(apt => apt.status === 'COMPLETED')?.startTime || new Date()), 'MMM dd, yyyy')
                  : 'No visits yet'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Upcoming</p>
              <p className="text-sm">
                {appointments.filter(apt => new Date(apt.startTime) > new Date()).length > 0
                  ? `${appointments.filter(apt => new Date(apt.startTime) > new Date()).length} appointment(s)`
                  : 'No upcoming appointments'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Record Form */}
      {showAddRecordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <MedicalRecordForm
              patientId={patient.id}
              onSuccess={handleAddRecordSuccess}
              onCancel={() => setShowAddRecordForm(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Medical History</label>
                  <p className="text-sm">{patient.medicalHistory || 'No medical history recorded'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Allergies</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))
                      : <p className="text-sm text-gray-500">No known allergies</p>
                    }
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-sm">{patient.notes || 'No additional notes'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Person</label>
                  <p>{patient.emergencyContactName || 'Not specified'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Phone</label>
                  <p>{patient.emergencyContactPhone || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Provider</label>
                  <p>{patient.insuranceProvider || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Number</label>
                  <p>{patient.insuranceNumber || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical-records">
          <MedicalRecordsViewer
            patientId={patient.id}
            onAddRecord={() => setShowAddRecordForm(true)}
          />
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment History
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/appointments/new')}>
                  Schedule Appointment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No appointments yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This patient has no appointment history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(appointment.startTime), 'MMM dd, yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {appointment.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vitals History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVitals ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : vitals?.latest ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Latest Vitals</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vitals.latest.temperature && (
                        <div className="text-center p-4 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-700">{vitals.latest.temperature}°C</p>
                          <p className="text-sm text-blue-600">Temperature</p>
                        </div>
                      )}
                      {vitals.latest.bloodPressureSystolic && vitals.latest.bloodPressureDiastolic && (
                        <div className="text-center p-4 bg-red-50 rounded">
                          <p className="text-lg font-bold text-red-700">
                            {vitals.latest.bloodPressureSystolic}/{vitals.latest.bloodPressureDiastolic}
                          </p>
                          <p className="text-sm text-red-600">Blood Pressure</p>
                        </div>
                      )}
                      {vitals.latest.heartRate && (
                        <div className="text-center p-4 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-700">{vitals.latest.heartRate}</p>
                          <p className="text-sm text-green-600">Heart Rate (BPM)</p>
                        </div>
                      )}
                      {vitals.latest.weight && (
                        <div className="text-center p-4 bg-yellow-50 rounded">
                          <p className="text-lg font-bold text-yellow-700">{vitals.latest.weight}</p>
                          <p className="text-sm text-yellow-600">Weight (kg)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {vitals.history && vitals.history.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">History</h4>
                      <div className="space-y-2">
                        {vitals.history.slice(1, 6).map((record: Record<string, unknown>, idx: number) => (
                          <div key={idx} className="border rounded p-3 text-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{record.title}</span>
                              <span className="text-gray-500">
                                {format(new Date(record.recordedAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-600">
                              {record.vitals.temperature && <span>Temp: {record.vitals.temperature}°C</span>}
                              {record.vitals.bloodPressureSystolic && (
                                <span>BP: {record.vitals.bloodPressureSystolic}/{record.vitals.bloodPressureDiastolic}</span>
                              )}
                              {record.vitals.heartRate && <span>HR: {record.vitals.heartRate} BPM</span>}
                              {record.vitals.weight && <span>Weight: {record.vitals.weight} kg</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No vitals recorded
                  </h3>
                  <p className="text-gray-600">
                    Vitals will appear here once they are recorded in medical records
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
