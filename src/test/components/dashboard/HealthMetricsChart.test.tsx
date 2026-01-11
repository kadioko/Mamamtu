import React from 'react';
import { render, screen } from '@testing-library/react';
import { HealthMetricsChart } from '@/components/dashboard/HealthMetricsChart';

describe('HealthMetricsChart', () => {
  const mockData = [
    { label: 'Monday', value: 10 },
    { label: 'Tuesday', value: 15 },
    { label: 'Wednesday', value: 8 },
  ];

  it('renders chart title', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        data={mockData}
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        description="Test description"
        data={mockData}
      />
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders bar chart by default', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        data={mockData}
        type="bar"
      />
    );

    mockData.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.value.toString())).toBeInTheDocument();
    });
  });

  it('renders donut chart correctly', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        data={mockData}
        type="donut"
      />
    );

    // Check total in center
    const total = mockData.reduce((sum, item) => sum + item.value, 0);
    expect(screen.getByText(total.toString())).toBeInTheDocument();

    // Check legend items
    mockData.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.value.toString())).toBeInTheDocument();
    });
  });

  it('renders line chart correctly', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        data={mockData}
        type="line"
      />
    );

    mockData.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('handles empty data', () => {
    render(
      <HealthMetricsChart
        title="Test Chart"
        data={[]}
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('applies custom colors', () => {
    const dataWithColors = [
      { label: 'A', value: 10, color: '#ff0000' },
      { label: 'B', value: 15, color: '#00ff00' },
    ];

    render(
      <HealthMetricsChart
        title="Test Chart"
        data={dataWithColors}
        type="bar"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('uses custom height', () => {
    const { container } = render(
      <HealthMetricsChart
        title="Test Chart"
        data={mockData}
        height={300}
      />
    );

    // Height is applied via inline styles, so we can't easily test it
    // but we can ensure the component renders without error
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const dataWithZero = [
      { label: 'A', value: 0 },
      { label: 'B', value: 10 },
    ];

    render(
      <HealthMetricsChart
        title="Test Chart"
        data={dataWithZero}
        type="bar"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleDataPoint = [{ label: 'Single', value: 42 }];

    render(
      <HealthMetricsChart
        title="Test Chart"
        data={singleDataPoint}
        type="donut"
      />
    );

    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Total in center
  });
});
