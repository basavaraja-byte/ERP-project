import type { Parent } from '../types';

export const mockParents: Parent[] = [
  {
    id: 'AAR-P-0001',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    relationship: 'FATHER',
    email: 'rajesh.sharma@parent.aarohan.edu.in',
    phone: '+91 98111 22334',
    occupation: 'Senior Technical Architect at Infosys',
    address: 'Flat 402, Royal Palms Residency, Baner, Pune - 411045',
    linkedStudentIds: ['AAR-2026-0001', 'AAR-2026-0002'] // Aarav & Ananya
  },
  {
    id: 'AAR-P-0002',
    firstName: 'Suresh',
    lastName: 'Varma',
    relationship: 'FATHER',
    email: 'suresh.varma@parent.aarohan.edu.in',
    phone: '+91 98222 99887',
    occupation: 'Industrial Consultant',
    address: '12-B, Silver Crest Society, Dhantoli, Nagpur - 440012',
    linkedStudentIds: ['AAR-2026-0003'] // Rohan Varma
  }
];
