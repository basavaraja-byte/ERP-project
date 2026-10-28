import { Course, Subject } from '../types/erp';

export const initialCourses: Course[] = [
  {
    id: 'CRS-BTECH-CSE',
    code: 'BTECH-CSE',
    name: 'B.Tech in Computer Science & Engineering',
    shortName: 'B.Tech CSE',
    departmentId: 'DEPT-CSE',
    campusId: 'CMP-BLR',
    durationSemesters: 8,
    degreeType: 'Undergraduate',
    academicYear: '2026-27',
    description:
      'Four-year undergraduate engineering programme covering core algorithms, systems, databases, networks, and modern software architectures.',
  },
  {
    id: 'CRS-MTECH-CSE',
    code: 'MTECH-CSE',
    name: 'M.Tech in Computer Science & Engineering',
    shortName: 'M.Tech CSE',
    departmentId: 'DEPT-CSE',
    campusId: 'CMP-BLR',
    durationSemesters: 4,
    degreeType: 'Postgraduate',
    academicYear: '2026-27',
    description:
      'Two-year postgraduate research-oriented programme focusing on advanced algorithms, scalable distributed systems, and deep learning systems.',
  },
  {
    id: 'CRS-BTECH-ECE',
    code: 'BTECH-ECE',
    name: 'B.Tech in Electronics & Communication Engineering',
    shortName: 'B.Tech ECE',
    departmentId: 'DEPT-ECE',
    campusId: 'CMP-BLR',
    durationSemesters: 8,
    degreeType: 'Undergraduate',
    academicYear: '2026-27',
    description:
      'Four-year undergraduate programme in analog/digital circuits, signal processing, VLSI design, communication systems, and embedded hardware.',
  },
];

export const initialSubjects: Subject[] = [
  // CSE — Semester 3 (B.Tech CSE)
  {
    id: 'SUB-CS301',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 3,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Asymptotic complexity, balanced search trees, heaps, hashing, graph traversal, shortest paths, greedy and dynamic programming.',
    upcomingDeadlines: [
      {
        id: 'DL-CS301-1',
        title: 'Internal Assessment II — Graph Algorithms & DP',
        dueDate: '2026-11-06',
        category: 'Assessment',
      },
      {
        id: 'DL-CS301-2',
        title: 'Programming Assignment 3: Dijkstra & Minimum Spanning Trees',
        dueDate: '2026-11-12',
        category: 'Assignment',
      },
    ],
  },
  {
    id: 'SUB-CS302',
    code: 'CS302',
    name: 'Operating Systems',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 3,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Process scheduling, POSIX threads, synchronization primitives, deadlocks, virtual memory paging, and file system internals.',
    upcomingDeadlines: [
      {
        id: 'DL-CS302-1',
        title: 'Internal Assessment II — Synchronization & Paging',
        dueDate: '2026-11-08',
        category: 'Assessment',
      },
      {
        id: 'DL-CS302-2',
        title: 'Mini-Shell & Page Replacement Simulator Viva',
        dueDate: '2026-11-15',
        category: 'Lab Evaluation',
      },
    ],
  },
  {
    id: 'SUB-CS303',
    code: 'CS303',
    name: 'Database Management Systems',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 3,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Relational algebra, SQL, normalization (BCNF/4NF), B+ tree indexing, transaction concurrency control (2PL, MVCC), and crash recovery.',
    upcomingDeadlines: [
      {
        id: 'DL-CS303-1',
        title: 'ER Schema & Normalization Project Milestone',
        dueDate: '2026-11-05',
        category: 'Assignment',
      },
    ],
  },
  {
    id: 'SUB-CS304L',
    code: 'CS304L',
    name: 'Systems & Data Structures Laboratory',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 3,
    credits: 2,
    weeklyHours: 3,
    type: 'Lab',
    academicYear: '2026-27',
    syllabusSummary:
      'Hands-on C/C++ implementation of AVL trees, priority queues, POSIX threads, semaphores, and IPC mechanisms.',
    upcomingDeadlines: [
      {
        id: 'DL-CS304L-1',
        title: 'Lab Record Verification & Practical Test II',
        dueDate: '2026-11-10',
        category: 'Lab Evaluation',
      },
    ],
  },

  // CSE — Semester 5 (B.Tech CSE)
  {
    id: 'SUB-CS501',
    code: 'CS501',
    name: 'Computer Networks',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 5,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Data link protocols, IPv4/IPv6 addressing, OSPF & BGP routing, TCP congestion control, DNS, TLS, and socket programming.',
    upcomingDeadlines: [
      {
        id: 'DL-CS501-1',
        title: 'Packet Capture & TCP Congestion Analysis Report',
        dueDate: '2026-11-04',
        category: 'Assignment',
      },
      {
        id: 'DL-CS501-2',
        title: 'Internal Assessment II — Routing & Transport Layer',
        dueDate: '2026-11-09',
        category: 'Assessment',
      },
    ],
  },
  {
    id: 'SUB-CS502',
    code: 'CS502',
    name: 'Compiler Design',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 5,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Lexical analysis, LL/LR parsing, syntax-directed translation, intermediate representation, data-flow analysis, and code generation.',
    upcomingDeadlines: [
      {
        id: 'DL-CS502-1',
        title: 'LALR(1) Parser Implementation Checkpoint',
        dueDate: '2026-11-11',
        category: 'Assignment',
      },
    ],
  },
  {
    id: 'SUB-CS503',
    code: 'CS503',
    name: 'Machine Learning Foundations',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 5,
    credits: 3,
    weeklyHours: 3,
    type: 'Elective',
    academicYear: '2026-27',
    syllabusSummary:
      'Supervised regression/classification, SVMs, ensemble tree models, clustering, dimensionality reduction, and model evaluation.',
    upcomingDeadlines: [
      {
        id: 'DL-CS503-1',
        title: 'Mini-Project Dataset & Baseline Model Review',
        dueDate: '2026-11-07',
        category: 'Syllabus Milestone',
      },
    ],
  },

  // CSE — Semester 7 (B.Tech CSE)
  {
    id: 'SUB-CS701',
    code: 'CS701',
    name: 'Distributed Systems',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 7,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Logical clocks, Raft/Paxos consensus, distributed transactions, replication consistency models, and fault-tolerant storage.',
    upcomingDeadlines: [
      {
        id: 'DL-CS701-1',
        title: 'Raft Leader Election Lab Demo',
        dueDate: '2026-11-14',
        category: 'Lab Evaluation',
      },
    ],
  },
  {
    id: 'SUB-CS702',
    code: 'CS702',
    name: 'Cloud Native Architecture',
    courseId: 'CRS-BTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 7,
    credits: 3,
    weeklyHours: 3,
    type: 'Elective',
    academicYear: '2026-27',
    syllabusSummary:
      'Container orchestration, microservices resilience patterns, service meshes, observability, and serverless runtime design.',
    upcomingDeadlines: [
      {
        id: 'DL-CS702-1',
        title: 'Module 3 Syllabus Completion Target',
        dueDate: '2026-11-16',
        category: 'Syllabus Milestone',
      },
    ],
  },

  // CSE — Semester 1 (M.Tech CSE)
  {
    id: 'SUB-MCS101',
    code: 'MCS101',
    name: 'Advanced Algorithms & Complexity',
    courseId: 'CRS-MTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 1,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Randomized algorithms, amortized analysis, network flow, NP-completeness reductions, and approximation schemes.',
    upcomingDeadlines: [
      {
        id: 'DL-MCS101-1',
        title: 'Research Paper Critique Presentation',
        dueDate: '2026-11-13',
        category: 'Assessment',
      },
    ],
  },
  {
    id: 'SUB-MCS102',
    code: 'MCS102',
    name: 'Deep Learning Systems',
    courseId: 'CRS-MTECH-CSE',
    departmentId: 'DEPT-CSE',
    semester: 1,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Automatic differentiation engines, GPU kernel optimization, distributed data/tensor parallelism, and inference quantization.',
    upcomingDeadlines: [
      {
        id: 'DL-MCS102-1',
        title: 'Autograd Engine Benchmark Submission',
        dueDate: '2026-11-18',
        category: 'Assignment',
      },
    ],
  },

  // ECE — Semester 3 & 5 (B.Tech ECE)
  {
    id: 'SUB-EC301',
    code: 'EC301',
    name: 'Signals & Systems',
    courseId: 'CRS-BTECH-ECE',
    departmentId: 'DEPT-ECE',
    semester: 3,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Continuous and discrete-time LTI systems, convolution, Fourier series/transforms, Laplace and Z-transforms.',
    upcomingDeadlines: [
      {
        id: 'DL-EC301-1',
        title: 'Internal Assessment II — Fourier & Z-Transforms',
        dueDate: '2026-11-07',
        category: 'Assessment',
      },
    ],
  },
  {
    id: 'SUB-EC302',
    code: 'EC302',
    name: 'Digital Electronics & Logic Design',
    courseId: 'CRS-BTECH-ECE',
    departmentId: 'DEPT-ECE',
    semester: 3,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Combinational logic minimization, synchronous sequential circuits, FSM synthesis, Verilog HDL modeling, and FPGA prototyping.',
    upcomingDeadlines: [
      {
        id: 'DL-EC302-1',
        title: 'Verilog FSM Synthesis Lab Check',
        dueDate: '2026-11-11',
        category: 'Lab Evaluation',
      },
    ],
  },
  {
    id: 'SUB-EC303',
    code: 'EC303',
    name: 'Network Analysis & Synthesis',
    courseId: 'CRS-BTECH-ECE',
    departmentId: 'DEPT-ECE',
    semester: 3,
    credits: 3,
    weeklyHours: 3,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'Network theorems, transient RLC response, two-port network parameters, and passive filter synthesis.',
    upcomingDeadlines: [],
  },
  {
    id: 'SUB-EC501',
    code: 'EC501',
    name: 'CMOS VLSI Design',
    courseId: 'CRS-BTECH-ECE',
    departmentId: 'DEPT-ECE',
    semester: 5,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'MOSFET physics, CMOS inverter characteristics, stick diagrams, DRC/LVS layout rules, timing closure, and low-power design.',
    upcomingDeadlines: [
      {
        id: 'DL-EC501-1',
        title: 'Cadence 4-Bit ALU Layout Submission',
        dueDate: '2026-11-15',
        category: 'Lab Evaluation',
      },
    ],
  },
  {
    id: 'SUB-EC502',
    code: 'EC502',
    name: 'Embedded Real-Time Systems',
    courseId: 'CRS-BTECH-ECE',
    departmentId: 'DEPT-ECE',
    semester: 5,
    credits: 4,
    weeklyHours: 4,
    type: 'Core',
    academicYear: '2026-27',
    syllabusSummary:
      'ARM Cortex-M architecture, interrupt latency, RTOS task scheduling (RMS/EDF), priority inversion, and CAN/SPI/I2C buses.',
    upcomingDeadlines: [],
  },
];

