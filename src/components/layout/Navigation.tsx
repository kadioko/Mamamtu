import React from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/appointments">Appointments</Link></li>
        <li><Link href="/dashboard/patients">Patients</Link></li>
        <li><Link href="/education">Education</Link></li>
      </ul>
    </nav>
  );
};

export default Navigation;
