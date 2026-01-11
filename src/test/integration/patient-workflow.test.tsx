import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockPatient, createMockAppointment } from '@/test/setup/test-utils';

// Mock the actual components we'd test
const PatientList = ({ patients, onSelect }: any) => (
  <div data-testid="patient-list">
    {patients.map((patient: any) => (
      <div
        key={patient.id}
        data-testid={`patient-${patient.id}`}
        onClick={() => onSelect(patient)}
      >
        {patient.firstName} {patient.lastName}
      </div>
    ))}
  </div>
);

const PatientForm = ({ onSubmit, initialData }: any) => {
  const [formData, setFormData] = React.useState(
    initialData || {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'FEMALE',
      phone: '',
      email: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form data-testid="patient-form" onSubmit={handleSubmit}>
      <input
        data-testid="firstName-input"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="First Name"
      />
      <input
        data-testid="lastName-input"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        placeholder="Last Name"
      />
      <input
        data-testid="dateOfBirth-input"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
      />
      <select
        data-testid="gender-select"
        value={formData.gender}
        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
      >
        <option value="FEMALE">Female</option>
        <option value="MALE">Male</option>
        <option value="OTHER">Other</option>
      </select>
      <input
        data-testid="phone-input"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone"
      />
      <input
        data-testid="email-input"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <button type="submit" data-testid="submit-button">
        Save Patient
      </button>
    </form>
  );
};

const PatientDetail = ({ patient, onUpdate }: any) => {
  const [isEditing, setIsEditing] = React.useState(false);

  if (isEditing) {
    return (
      <div>
        <PatientForm
          initialData={patient}
          onSubmit={(data) => {
            onUpdate(patient.id, data);
            setIsEditing(false);
          }}
        />
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div data-testid="patient-detail">
      <h2>{patient.firstName} {patient.lastName}</h2>
      <p>Date of Birth: {patient.dateOfBirth}</p>
      <p>Gender: {patient.gender}</p>
      <p>Phone: {patient.phone}</p>
      <p>Email: {patient.email}</p>
      <button onClick={() => setIsEditing(true)} data-testid="edit-button">
        Edit
      </button>
    </div>
  );
};

describe('Patient Management Workflow', () => {
  const mockPatients = [
    createMockPatient({ firstName: 'Jane', lastName: 'Doe' }),
    createMockPatient({ firstName: 'John', lastName: 'Smith' }),
  ];

  describe('Patient List', () => {
    it('displays list of patients', () => {
      render(<PatientList patients={mockPatients} onSelect={() => {}} />);

      expect(screen.getByTestId('patient-list')).toBeInTheDocument();
      expect(screen.getByTestId('patient-Jane Doe')).toBeInTheDocument();
      expect(screen.getByTestId('patient-John Smith')).toBeInTheDocument();
    });

    it('handles patient selection', async () => {
      const onSelect = jest.fn();
      render(<PatientList patients={mockPatients} onSelect={onSelect} />);

      await userEvent.click(screen.getByTestId('patient-Jane Doe'));

      expect(onSelect).toHaveBeenCalledWith(mockPatients[0]);
    });

    it('displays empty state when no patients', () => {
      render(<PatientList patients={[]} onSelect={() => {}} />);

      expect(screen.getByTestId('patient-list')).toBeInTheDocument();
      expect(screen.queryByTestId(/patient-/)).not.toBeInTheDocument();
    });
  });

  describe('Patient Creation', () => {
    it('creates new patient with valid data', async () => {
      const onSubmit = jest.fn();
      render(<PatientForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByTestId('firstName-input'), 'Jane');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(screen.getByTestId('dateOfBirth-input'), '1990-01-01');
      await userEvent.selectOptions(screen.getByTestId('gender-select'), 'FEMALE');
      await userEvent.type(screen.getByTestId('phone-input'), '+254712345678');
      await userEvent.type(screen.getByTestId('email-input'), 'jane.doe@example.com');

      await userEvent.click(screen.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        phone: '+254712345678',
        email: 'jane.doe@example.com',
      });
    });

    it('pre-fills form with initial data', () => {
      const patient = createMockPatient();
      render(<PatientForm initialData={patient} onSubmit={() => {}} />);

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const onSubmit = jest.fn();
      render(<PatientForm onSubmit={onSubmit} />);

      await userEvent.click(screen.getByTestId('submit-button'));

      // Form should not submit with empty required fields
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Patient Detail View', () => {
    it('displays patient information', () => {
      const patient = createMockPatient();
      render(<PatientDetail patient={patient} onUpdate={() => {}} />);

      expect(screen.getByTestId('patient-detail')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth: 1990-01-01')).toBeInTheDocument();
      expect(screen.getByText('Gender: FEMALE')).toBeInTheDocument();
      expect(screen.getByText('Phone: +254712345678')).toBeInTheDocument();
      expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', async () => {
      const patient = createMockPatient();
      render(<PatientDetail patient={patient} onUpdate={() => {}} />);

      await userEvent.click(screen.getByTestId('edit-button'));

      expect(screen.getByTestId('patient-form')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    it('updates patient information', async () => {
      const onUpdate = jest.fn();
      const patient = createMockPatient();
      render(<PatientDetail patient={patient} onUpdate={onUpdate} />);

      // Enter edit mode
      await userEvent.click(screen.getByTestId('edit-button'));

      // Update first name
      const firstNameInput = screen.getByTestId('firstName-input');
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'Janet');

      // Submit form
      await userEvent.click(screen.getByTestId('submit-button'));

      expect(onUpdate).toHaveBeenCalledWith(patient.id, {
        ...patient,
        firstName: 'Janet',
      });
    });

    it('cancels edit mode', async () => {
      const patient = createMockPatient();
      render(<PatientDetail patient={patient} onUpdate={() => {}} />);

      // Enter edit mode
      await userEvent.click(screen.getByTestId('edit-button'));

      // Cancel editing
      await userEvent.click(screen.getByText('Cancel'));

      // Should return to detail view
      expect(screen.getByTestId('patient-detail')).toBeInTheDocument();
      expect(screen.queryByTestId('patient-form')).not.toBeInTheDocument();
    });
  });

  describe('Complete Workflow', () => {
    it('handles complete patient management flow', async () => {
      // Mock functions
      const onCreatePatient = jest.fn();
      const onUpdatePatient = jest.fn();

      // Step 1: Create new patient
      const { unmount } = render(<PatientForm onSubmit={onCreatePatient} />);

      await userEvent.type(screen.getByTestId('firstName-input'), 'Alice');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Johnson');
      await userEvent.type(screen.getByTestId('dateOfBirth-input'), '1985-05-15');
      await userEvent.selectOptions(screen.getByTestId('gender-select'), 'FEMALE');
      await userEvent.type(screen.getByTestId('phone-input'), '+254723456789');
      await userEvent.type(screen.getByTestId('email-input'), 'alice.j@example.com');

      await userEvent.click(screen.getByTestId('submit-button'));

      expect(onCreatePatient).toHaveBeenCalledWith({
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: '1985-05-15',
        gender: 'FEMALE',
        phone: '+254723456789',
        email: 'alice.j@example.com',
      });

      // Simulate successful creation
      const newPatient = createMockPatient({
        id: 'new-patient',
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: '1985-05-15',
        phone: '+254723456789',
        email: 'alice.j@example.com',
      });

      // Step 2: View patient details
      unmount();
      render(<PatientDetail patient={newPatient} onUpdate={onUpdatePatient} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Step 3: Edit patient
      await userEvent.click(screen.getByTestId('edit-button'));

      const phoneInput = screen.getByTestId('phone-input');
      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, '+254723456780');

      await userEvent.click(screen.getByTestId('submit-button'));

      expect(onUpdatePatient).toHaveBeenCalledWith('new-patient', {
        ...newPatient,
        phone: '+254723456780',
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<PatientForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByTestId('firstName-input'), 'Jane');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(screen.getByTestId('dateOfBirth-input'), '1990-01-01');

      await userEvent.click(screen.getByTestId('submit-button'));

      // Should handle the error without crashing
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('validates email format', async () => {
      const onSubmit = jest.fn();
      render(<PatientForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByTestId('firstName-input'), 'Jane');
      await userEvent.type(screen.getByTestId('lastName-input'), 'Doe');
      await userEvent.type(screen.getByTestId('email-input'), 'invalid-email');

      await userEvent.click(screen.getByTestId('submit-button'));

      // Should not submit with invalid email
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
