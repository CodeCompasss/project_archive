import { insertDropdownOption, hasDropdownOptions } from '@/lib/db/dropdown-actions';

export async function seedDropdownOptions() {
  const submissionYears = [2025, 2024, 2023, 2022, 2021];
  const projectTypes = [
    "Final Year Project",
    "Mini Project",
    "Research Project",
    "Personal Project",
    "Others"
  ];
  const departments = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "Other"];
  const availableDomains = [
    "Other",
    "Web Development",
    "Mobile App Development (Android & iOS)",
    "Artificial Intelligence (AI) & Machine Learning (ML)",
    "Data Science & Big Data Analytics",
    "Cybersecurity & Ethical Hacking",
    "Blockchain & Cryptocurrency",
    "Cloud Computing & DevOps",
    "Game Development & AR/VR",
    "Internet of Things (IoT)",
    "Natural Language Processing (NLP)",
    "Database Management & Data Warehousing",
    "Quantum Computing",
    "Software Testing & Automation",
    "Full Stack Development (MERN, MEAN, etc.)",
    "UI/UX & Human-Computer Interaction",
    "Computer Networks & Network Security",
    "Augmented Reality (AR) & Virtual Reality (VR)",
    "E-commerce & CMS Development",
    "No-Code & Low-Code Development",
    "Cloud Security & Serverless Computing",
    "DevOps & Site Reliability Engineering (SRE)",
    "Edge Computing & Distributed Systems",
    "IT Infrastructure & System Administration",
    "Data Engineering & Business Intelligence",
    "IT Governance & Compliance",
    "Structural Engineering & Earthquake-Resistant Design",
    "Transportation & Highway Engineering",
    "Geotechnical Engineering & Soil Mechanics",
    "Smart Cities & Urban Planning",
    "Sustainable & Green Building Technology",
    "Hydraulics & Water Resource Engineering",
    "Construction Management & Project Planning",
    "Environmental Engineering & Waste Management",
    "Building Information Modeling (BIM)",
    "Disaster Management & Risk Analysis",
    "Bridge & Tunnel Engineering",
    "Surveying & Remote Sensing (GIS & GPS)",
    "VLSI & Chip Design",
    "Embedded Systems & Microcontrollers",
    "Wireless Communication (5G, LTE, Satellite)",
    "Signal & Image Processing",
    "Optical Fiber & Photonics",
    "Digital & Analog Circuit Design",
    "Antenna & RF Engineering",
    "Smart Sensors & Wearable Technology",
    "Audio & Speech Processing",
    "Biomedical Electronics & Bionics",
    "MEMS & Nanoelectronics",
    "Power Systems & Smart Grids",
    "Renewable Energy (Solar, Wind, Hydro)",
    "Control Systems & Automation",
    "Robotics & Mechatronics",
    "Electric Vehicles (EV) & Battery Technologies",
    "High Voltage Engineering",
    "Energy Management & Conservation",
    "Industrial Instrumentation & Process Control",
    "Electrical Machines & Drives",
    "Smart Home & Building Automation",
    "CAD, CAM & 3D Printing",
    "Automotive & Aerospace Engineering",
    "Thermodynamics & Fluid Mechanics",
    "Mechatronics & Smart Manufacturing",
    "HVAC & Refrigeration Systems",
    "Material Science & Composites",
    "Renewable Energy in Mechanical Systems",
    "Computational Fluid Dynamics (CFD)",
    "Finite Element Analysis (FEA)"
  ];

  async function seedCategory(category: string, options: (string | number)[]) {
    const exists = await hasDropdownOptions(category);
    if (!exists) {
      console.log(`Seeding category: ${category}`);
      for (const option of options) {
        await insertDropdownOption(category, String(option));
      }
    } else {
      console.log(`Category '${category}' already has options, skipping seeding.`);
    }
  }

  await seedCategory('submission_years', submissionYears);
  await seedCategory('project_types', projectTypes);
  await seedCategory('departments', departments);
  await seedCategory('domains', availableDomains);

  console.log('Dropdown options seeding complete.');
} 