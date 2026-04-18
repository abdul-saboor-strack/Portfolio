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
      title: 'FS 5 Collection',
      description: 'A fully functional e-commerce website designed to provide a seamless online shopping experience. Users can browse products by categories, search and filter items, and view detailed product information. The platform includes a secure authentication system, shopping cart, and order management features. An advanced admin panel allows administrators to manage products, categories, orders, and customers efficiently, along with real-time analytics and performance tracking. The website is responsive, user-friendly, and optimized for smooth navigation and secure transactions.',
      image: 'https://placehold.co/1200x800/00f0ff/000000?text=FS+5+Collection',
      images: ['https://placehold.co/1200x800/00f0ff/000000?text=FS+5+Collection'],
      repoUrl: '#',
      details: [
        'Built using React and modern JavaScript',
        'Responsive design for mobile and desktop',
        'Product browsing and UI interactions',
      ],
      tags: ['React', 'Frontend'],
    },
    {
      id: 'hospital-system',
      title: 'Smart Quiz Management System',
      description: 'A user-friendly online platform where students can take quizzes and teachers can create, manage, and evaluate them. It includes secure login, teacher tools, and a built-in timer to ensure fair and efficient assessments.',
      image: 'https://placehold.co/1200x800/8a2be2/ffffff?text=Smart+Quiz',
      images: ['https://placehold.co/1200x800/8a2be2/ffffff?text=Smart+Quiz'],
      repoUrl: '#',
      details: [
        'Implemented using Java',
        'Used Data Structures for efficient data handling',
        'Secure login and teacher tools',
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
