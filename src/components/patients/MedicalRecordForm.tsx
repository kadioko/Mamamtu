'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const medicalRecordSchema = z.object({
  recordType: z.enum(['CONSULTATION', 'LAB_RESULT', 'PRESCRIPTION', 'PROCEDURE', 'ADMISSION', 'DISCHARGE', 'VACCINATION', 'PRENATAL_VISIT', 'APISSCOMA', 'GENERAL']),
  title: z.string().min(2, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  diagnosis: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  treatment: z.string().optional(),
  healthcareProvider: z.string().optional(),
  facility: z.string().optional(),
  notes: z.string().optional(),

  vitals: z.object({
    temperature: z.number().min(35, 'Temperature too low').max(45, 'Temperature too high').optional(),
    bloodPressureSystolic: z.number().min(70, 'Systolic BP too low').max(250, 'Systolic BP too high').optional(),
    bloodPressureDiastolic: z.number().min(40, 'Diastolic BP too low').max(150, 'Diastolic BP too high').optional(),
    heartRate: z.number().min(30, 'Heart rate too low').max(200, 'Heart rate too high').optional(),
    respiratoryRate: z.number().min(8, 'Respiratory rate too low').max(60, 'Respiratory rate too high').optional(),
    oxygenSaturation: z.number().min(70, 'Oxygen saturation too low').max(100).optional(),
    weight: z.number().min(1, 'Weight must be positive').max(500, 'Weight seems too high').optional(),
    height: z.number().min(30, 'Height too low (cm)').max(250, 'Height too high (cm)').optional(),
    gestationalAge: z.number().min(4, 'Gestational age too low').max(42, 'Gestational age too high').optional()
  }).optional(),

  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().optional(),
    instructions: z.string().optional()
  })).optional(),

  labResults: z.array(z.object({
    testName: z.string().min(1, 'Test name is required'),
    value: z.string().min(1, 'Value is required'),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    status: z.enum(['NORMAL', 'HIGH', 'LOW', 'CRITICAL']),
    notes: z.string().optional()
  })).optional()
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

interface LabResultEntry {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  notes?: string;
}

interface MedicalRecordFormProps {
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MedicationForm = ({ medications = [], onChange }: {
  medications: MedicationEntry[];
  onChange: (meds: MedicationEntry[]) => void;
}) => {
  const addMedication = () => {
    onChange([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const removeMedication = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, updates: Partial<MedicationEntry>) => {
    const newMeds = medications.map((med, i) =>
      i === index ? { ...med, ...updates } : med
    );
    onChange(newMeds);
  };

  return (
    <div className="space-y-4">
      {medications.map((med, index) => (
        <div key={index} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Medication {index + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeMedication(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`med-name-${index}`}>Name</Label>
              <Input
                id={`med-name-${index}`}
                value={med.name}
                onChange={(e) => updateMedication(index, { name: e.target.value })}
                placeholder="Medication name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
              <Input
                id={`med-dosage-${index}`}
                value={med.dosage}
                onChange={(e) => updateMedication(index, { dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
              <Input
                id={`med-frequency-${index}`}
                value={med.frequency}
                onChange={(e) => updateMedication(index, { frequency: e.target.value })}
                placeholder="e.g., twice daily"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`med-duration-${index}`}>Duration</Label>
              <Input
                id={`med-duration-${index}`}
                value={med.duration || ''}
                onChange={(e) => updateMedication(index, { duration: e.target.value })}
                placeholder="e.g., 7 days"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`med-instructions-${index}`}>Instructions</Label>
            <Textarea
              id={`med-instructions-${index}`}
              value={med.instructions || ''}
              onChange={(e) => updateMedication(index, { instructions: e.target.value })}
              placeholder="Special instructions..."
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addMedication}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Medication
      </Button>
    </div>
  );
};

const LabResultsForm = ({ labResults = [], onChange }: {
  labResults: LabResultEntry[];
  onChange: (results: LabResultEntry[]) => void;
}) => {
  const addLabResult = () => {
    onChange([...labResults, { testName: '', value: '', status: 'NORMAL' }]);
  };

  const removeLabResult = (index: number) => {
    onChange(labResults.filter((_, i) => i !== index));
  };

  const updateLabResult = (index: number, updates: Partial<LabResultEntry>) => {
    const newResults = labResults.map((result, i) =>
      i === index ? { ...result, ...updates } : result
    );
    onChange(newResults);
  };

  return (
    <div className="space-y-4">
      {labResults.map((result, index) => (
        <div key={index} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Lab Result {index + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLabResult(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`lab-test-${index}`}>Test Name</Label>
              <Input
                id={`lab-test-${index}`}
                value={result.testName}
                onChange={(e) => updateLabResult(index, { testName: e.target.value })}
                placeholder="e.g., Glucose"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lab-value-${index}`}>Value</Label>
              <Input
                id={`lab-value-${index}`}
                value={result.value}
                onChange={(e) => updateLabResult(index, { value: e.target.value })}
                placeholder="e.g., 95"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`lab-unit-${index}`}>Unit</Label>
              <Input
                id={`lab-unit-${index}`}
                value={result.unit || ''}
                onChange={(e) => updateLabResult(index, { unit: e.target.value })}
                placeholder="e.g., mg/dL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lab-range-${index}`}>Reference Range</Label>
              <Input
                id={`lab-range-${index}`}
                value={result.referenceRange || ''}
                onChange={(e) => updateLabResult(index, { referenceRange: e.target.value })}
                placeholder="e.g., 70-99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lab-status-${index}`}>Status</Label>
              <Select value={result.status} onValueChange={(value: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL') =>
                updateLabResult(index, { status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`lab-notes-${index}`}>Notes</Label>
            <Textarea
              id={`lab-notes-${index}`}
              value={result.notes || ''}
              onChange={(e) => updateLabResult(index, { notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addLabResult}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Lab Result
      </Button>
    </div>
  );
};

export function MedicalRecordForm({ patientId, onSuccess, onCancel }: MedicalRecordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [labResults, setLabResults] = useState<LabResultEntry[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');

  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      recordType: 'GENERAL',
      title: '',
      description: '',
      diagnosis: '',
      symptoms: [],
      treatment: '',
      healthcareProvider: '',
      facility: '',
      notes: '',
    }
  });

  const onSubmit = async (data: MedicalRecordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const recordData = {
        ...data,
        patientId,
        symptoms,
        medications,
        labResults,
      };

      const response = await fetch('/api/patients/' + patientId + '/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create medical record');
      }

      toast.success('Medical record created successfully');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating medical record:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create medical record';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Add Medical Record</CardTitle>
        <p className="text-sm text-gray-600">Create a comprehensive medical record for this patient</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type *</Label>
                <Controller
                  name="recordType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONSULTATION">Consultation</SelectItem>
                        <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
                        <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                        <SelectItem value="PROCEDURE">Procedure</SelectItem>
                        <SelectItem value="ADMISSION">Admission</SelectItem>
                        <SelectItem value="DISCHARGE">Discharge</SelectItem>
                        <SelectItem value="VACCINATION">Vaccination</SelectItem>
                        <SelectItem value="PRENATAL_VISIT">Prenatal Visit</SelectItem>
                        <SelectItem value="GENERAL">General Record</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.recordType && (
                  <p className="text-sm text-red-500">{form.formState.errors.recordType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Record title" />
                  )}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Record description..." rows={2} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Controller
                name="diagnosis"
                control={form.control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Diagnosis..." rows={2} />
                )}
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-4">
            <Label>Symptoms</Label>
            <div className="flex gap-2">
              <Input
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="Add symptom..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
              />
              <Button type="button" onClick={addSymptom} disabled={!newSymptom.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom, index) => (
                  <div key={index} className="bg-gray-100 rounded px-3 py-1 flex items-center gap-2">
                    <span className="text-sm">{symptom}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSymptom(symptom)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Controller
                    name="treatment"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea {...field} placeholder="Treatment plan..." rows={3} />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthcareProvider">Healthcare Provider</Label>
                  <Controller
                    name="healthcareProvider"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Provider name" />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facility">Facility</Label>
                  <Controller
                    name="facility"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Healthcare facility" />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea {...field} placeholder="Additional notes..." rows={3} />
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="medications">
              <MedicationForm medications={medications} onChange={setMedications} />
            </TabsContent>

            <TabsContent value="lab-results">
              <LabResultsForm labResults={labResults} onChange={setLabResults} />
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Controller
                    name="vitals.temperature"
                    control={form.control}
                    render={({ field: { onChange, ...field } }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="37.5"
                        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressureSystolic">Blood Pressure Systolic</Label>
                  <Controller
                    name="vitals.bloodPressureSystolic"
                    control={form.control}
                    render={({ field: { onChange, ...field } }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="120"
                        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressureDiastolic">Blood Pressure Diastolic</Label>
                  <Controller
                    name="vitals.bloodPressureDiastolic"
                    control={form.control}
                    render={({ field: { onChange, ...field } }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="80"
                        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                  <Controller
                    name="vitals.heartRate"
                    control={form.control}
                    render={({ field: { onChange, ...field } }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="72"
                        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Controller
                    name="vitals.weight"
                    control={form.control}
                    render={({ field: { onChange, ...field } }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="65.5"
                        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>

                {form.watch('recordType') === 'PRENATAL_VISIT' && (
                  <div className="space-y-2">
                    <Label htmlFor="gestationalAge">Gestational Age (weeks)</Label>
                    <Controller
                      name="vitals.gestationalAge"
                      control={form.control}
                      render={({ field: { onChange, ...field } }) => (
                        <Input
                          {...field}
                          type="number"
                          min="4"
                          max="42"
                          placeholder="20"
                          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Medical Record
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
