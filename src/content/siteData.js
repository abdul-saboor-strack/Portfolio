  export const siteData = {
    name: 'Abdul Saboor',
  
    headlinePhrases: [
      'Frontend Developer',
      'React Developer',
      'Computer Systems Engineer'
    ],
  
    about: {
      title: 'Who I am',
      image: '',
      body: `I am Abdul Saboor, a Computer Systems Engineering student at Sukkur IBA University (4th Semester).
  I specialize in building modern, responsive web applications using React, JavaScript, and Node.js.
  
  I enjoy solving real-world problems through code and have experience developing projects like e-commerce platforms and management systems.`,
    },
  
    skills: [
      { name: 'HTML5', level: 90, code: 'HTML' },
      { name: 'CSS3', level: 88, code: 'CSS' },
      { name: 'JavaScript', level: 85, code: 'JS' },
      { name: 'React', level: 82, code: 'RE' },
      { name: 'Node.js', level: 80, code: 'ND' },
      { name: 'TypeScript', level: 75, code: 'TS' },
      { name: 'Java', level: 78, code: 'JV' },
    ],
  
    projects: [
      {
        id: 'ecommerce',
        title: 'E-commerce Website',
        description: 'A full-featured e-commerce web application with product listings and user interaction.',
        image: '/images/portfolio-pic.jpeg',
        liveUrl: '#', // yahan apni deployed link daalna
        repoUrl: '#', // yahan GitHub link daalna
        details: [
          'Built using React and modern JavaScript',
          'Responsive design for mobile and desktop',
          'Product browsing and UI interactions',
        ],
        tags: ['React', 'Frontend'],
      },
      {
        id: 'hospital-system',
        title: 'Hospital Management System',
        description: 'A DSA-based system for managing hospital operations and records.',
        image: '/images/hospital.png',
        liveUrl: '#',
        repoUrl: '#',
        details: [
          'Implemented using Java',
          'Used Data Structures for efficient data handling',
          'Manages patient and hospital records',
        ],
        tags: ['Java', 'DSA'],
      },
    ],
  
    timeline: [
      {
        id: 't1',
        date: '2026',
        role: 'CSE Student (4th Semester)',
        description: 'Currently studying Computer Systems Engineering at Sukkur IBA University.',
      },
      {
        id: 't2',
        date: '2025',
        role: 'Frontend Development',
        description: 'Worked on React, JavaScript, and built real-world projects like e-commerce applications.',
      },
      {
        id: 't3',
        date: '2024',
        role: 'Programming Foundation',
        description: 'Learned Java and Data Structures and built a hospital management system project.',
      },
    ],
  
    contact: {
      email: 'abdulsaboorabbasi.becsef24@iba-suk.edu.pk', // apna email yahan daalo
    },
  
    social: [
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/yourusername',
        icon: 'github',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/yourprofile',
        icon: 'linkedin',
      },
    ],
  };
