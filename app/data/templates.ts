export interface TemplateContent {
  id: string;
  name: string;
  category: string;
  content: string;
  description: string;
  icon: string;
  color: string;
  featured?: boolean;
}

export const templateContents: TemplateContent[] = [
  // Basic Templates
  {
    id: 'blank',
    name: 'Blank Document',
    category: 'Basic',
    content: '<h1>Untitled Document</h1><p>Start writing your content here...</p>',
    description: 'Start with a clean slate',
    icon: '📄',
    color: 'bg-white'
  },
  {
    id: 'test',
    name: 'Test Template',
    category: 'Basic',
    content: '<h1>Test Template</h1><p>This is a <strong>test template</strong> to see if HTML parsing works.</p><h2>Section 1</h2><p>This should have proper styling.</p>',
    description: 'Simple test template',
    icon: '🧪',
    color: 'bg-green-50'
  },
  {
    id: 'note-taking',
    name: 'Note Taking',
    category: 'Basic',
    content: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> [Insert Date]</p>
<p><strong>Attendees:</strong> [List Names]</p>
<p><strong>Agenda:</strong></p>
<ul>
<li>Topic 1</li>
<li>Topic 2</li>
<li>Topic 3</li>
</ul>
<p><strong>Action Items:</strong></p>
<ul>
<li>Action 1 - [Assignee] - [Due Date]</li>
<li>Action 2 - [Assignee] - [Due Date]</li>
</ul>
<p><strong>Next Meeting:</strong> [Date and Time]</p>`,
    description: 'Template with title, date, and bullet points',
    icon: '📝',
    color: 'bg-blue-50'
  },

  // Academic Templates
  {
    id: 'research-paper',
    name: 'Research Paper',
    category: 'Academic',
    content: `<h1>Research Paper Title</h1>
<p style="text-align: center; font-style: italic; color: #6b7280; margin-bottom: 2rem;">[Subtitle or additional context]</p>

<div style="margin-bottom: 2rem;">
  <h2>Abstract</h2>
  <p style="text-align: justify; line-height: 1.6;">[Brief summary of your research, findings, and conclusions. This should be approximately 150-250 words and provide a comprehensive overview of the entire paper.]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>1. Introduction</h2>
  <p>[Background information and context for your research]</p>
  <p>[Statement of the research problem or question]</p>
  <p>[Objectives and significance of the study]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>2. Literature Review</h2>
  <p>[Summary of existing research and theories related to your topic]</p>
  <p>[Critical analysis of previous studies]</p>
  <p>[Identification of research gaps]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>3. Methodology</h2>
  <p>[Description of research design and approach]</p>
  <p>[Data collection methods and procedures]</p>
  <p>[Analysis techniques and tools used]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>4. Results</h2>
  <p>[Presentation of findings and data analysis]</p>
  <p>[Key results and statistical findings]</p>
  <p>[Visual representations (tables, charts, graphs)]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>5. Discussion</h2>
  <p>[Interpretation of results and their implications]</p>
  <p>[Comparison with existing literature]</p>
  <p>[Limitations and future research directions]</p>
</div>

<div style="margin-bottom: 2rem;">
  <h2>6. Conclusion</h2>
  <p>[Summary of key findings and contributions]</p>
  <p>[Practical implications and recommendations]</p>
  <p>[Future research directions]</p>
</div>

<div style="margin-top: 3rem;">
  <h2>References</h2>
  <p style="font-size: 0.875rem; color: #6b7280;">[List of sources in proper citation format (APA, MLA, Chicago, etc.)]</p>
</div>`,
    description: 'Complete research paper structure with sections',
    icon: '📚',
    color: 'bg-indigo-50',
    featured: true
  },
  {
    id: 'essay',
    name: 'Essay',
    category: 'Academic',
    content: `<h1>Essay Title</h1>

<h2>Introduction</h2>
<p>[Hook to engage the reader]</p>
<p>[Background information]</p>
<p>[Thesis statement - your main argument]</p>

<h2>Body Paragraph 1</h2>
<p><strong>Topic Sentence:</strong> [Main idea of this paragraph]</p>
<p>[Supporting evidence and examples]</p>
<p>[Analysis and explanation]</p>

<h2>Body Paragraph 2</h2>
<p><strong>Topic Sentence:</strong> [Main idea of this paragraph]</p>
<p>[Supporting evidence and examples]</p>
<p>[Analysis and explanation]</p>

<h2>Body Paragraph 3</h2>
<p><strong>Topic Sentence:</strong> [Main idea of this paragraph]</p>
<p>[Supporting evidence and examples]</p>
<p>[Analysis and explanation]</p>

<h2>Conclusion</h2>
<p>[Restate thesis]</p>
<p>[Summarize main points]</p>
<p>[Final thoughts or call to action]</p>`,
    description: 'Standard essay structure with introduction and conclusion',
    icon: '✍️',
    color: 'bg-purple-50'
  },

  // Business Templates
  {
    id: 'business-letter',
    name: 'Business Letter',
    category: 'Business',
    content: `<h1>Business Letter</h1>

<div style="margin-bottom: 2rem;">
  <p><strong>[Your Name]</strong><br>
  [Your Address]<br>
  [City, State ZIP Code]<br>
  [Your Email]<br>
  [Your Phone]</p>
</div>

<div style="margin-bottom: 2rem;">
  <p><strong>[Date]</strong></p>
</div>

<div style="margin-bottom: 2rem;">
  <p><strong>[Recipient's Name]</strong><br>
  [Recipient's Title]<br>
  [Company Name]<br>
  [Company Address]<br>
  [City, State ZIP Code]</p>
</div>

<div style="margin-bottom: 2rem;">
  <p><strong>Subject: [Brief Description of Letter Purpose]</strong></p>
</div>

<div style="margin-bottom: 2rem;">
  <p>Dear [Recipient's Name],</p>
</div>

<div style="margin-bottom: 1.5rem;">
  <p>[Opening paragraph - introduce yourself and state the purpose of the letter]</p>
</div>

<div style="margin-bottom: 1.5rem;">
  <p>[Body paragraph(s) - provide details, background, and supporting information]</p>
</div>

<div style="margin-bottom: 1.5rem;">
  <p>[Closing paragraph - summarize key points and state next steps or desired outcome]</p>
</div>

<div style="margin-top: 2rem;">
  <p>Sincerely,<br>
  <strong>[Your Name]</strong><br>
  [Your Title]</p>
</div>`,
    description: 'Formal business letter with proper formatting',
    icon: '💼',
    color: 'bg-gray-50',
    featured: true
  },
  {
    id: 'proposal',
    name: 'Business Proposal',
    category: 'Business',
    content: `<h1>Business Proposal</h1>
<p><strong>Prepared for:</strong> [Client/Company Name]</p>
<p><strong>Prepared by:</strong> [Your Company Name]</p>
<p><strong>Date:</strong> [Date]</p>

<h2>Executive Summary</h2>
<p>[Brief overview of the proposal and key benefits]</p>

<h2>Problem Statement</h2>
<p>[Description of the problem or opportunity]</p>

<h2>Proposed Solution</h2>
<p>[Detailed description of your solution]</p>

<h2>Implementation Plan</h2>
<p>[Timeline and steps for implementation]</p>

<h2>Budget</h2>
<p>[Cost breakdown and pricing]</p>

<h2>Company Background</h2>
<p>[Your company's qualifications and experience]</p>

<h2>Conclusion</h2>
<p>[Summary and call to action]</p>`,
    description: 'Structured proposal with executive summary',
    icon: '📋',
    color: 'bg-orange-50'
  },

  // Resume Templates
  {
    id: 'modern-cv',
    name: 'Modern CV',
    category: 'Resume',
    content: `<h1>[Your Full Name]</h1>
<p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 1rem;">[Professional Title]</p>
<p style="margin-bottom: 2rem;">[Email] • [Phone] • [Location] • [LinkedIn]</p>

<h2>Professional Summary</h2>
<p style="margin-bottom: 2rem;">[2-3 sentence overview of your professional background and key strengths]</p>

<h2>Work Experience</h2>
<div style="margin-bottom: 2rem;">
  <p><strong>[Job Title]</strong> | [Company Name] | [Dates]</p>
  <ul>
    <li>[Key achievement or responsibility]</li>
    <li>[Key achievement or responsibility]</li>
    <li>[Key achievement or responsibility]</li>
  </ul>
</div>

<div style="margin-bottom: 2rem;">
  <p><strong>[Job Title]</strong> | [Company Name] | [Dates]</p>
  <ul>
    <li>[Key achievement or responsibility]</li>
    <li>[Key achievement or responsibility]</li>
    <li>[Key achievement or responsibility]</li>
  </ul>
</div>

<h2>Education</h2>
<div style="margin-bottom: 2rem;">
  <p><strong>[Degree]</strong> | [University] | [Graduation Year]</p>
  <p>[Relevant coursework or achievements]</p>
</div>

<h2>Skills</h2>
<div style="margin-bottom: 1rem;">
  <p><strong>Technical Skills:</strong> [Skill 1], [Skill 2], [Skill 3]</p>
</div>
<div style="margin-bottom: 2rem;">
  <p><strong>Soft Skills:</strong> [Skill 1], [Skill 2], [Skill 3]</p>
</div>

<h2>Certifications</h2>
<p>[Certification 1] - [Issuing Organization] - [Year]</p>
<p>[Certification 2] - [Issuing Organization] - [Year]</p>`,
    description: 'Clean, modern resume layout',
    icon: '👔',
    color: 'bg-blue-50',
    featured: true
  },

  // Creative Templates
  {
    id: 'story',
    name: 'Story',
    category: 'Creative',
    content: `<h1>[Story Title]</h1>

<h2>Chapter 1: [Chapter Title]</h2>
<p>[Opening scene - set the mood and introduce characters]</p>
<p>[Build tension and develop the plot]</p>
<p>[End with a hook to keep readers engaged]</p>

<h2>Chapter 2: [Chapter Title]</h2>
<p>[Continue developing the story and characters]</p>
<p>[Introduce conflicts and challenges]</p>
<p>[Build toward the climax]</p>

<h2>Chapter 3: [Chapter Title]</h2>
<p>[Reach the climax of the story]</p>
<p>[Resolve conflicts and tie up loose ends]</p>
<p>[Provide a satisfying conclusion]</p>

<h3>Characters:</h3>
<ul>
<li><strong>[Character Name]:</strong> [Brief description and role]</li>
<li><strong>[Character Name]:</strong> [Brief description and role]</li>
</ul>

<h3>Setting:</h3>
<p>[Description of where and when the story takes place]</p>`,
    description: 'Story template with chapters and scenes',
    icon: '📖',
    color: 'bg-pink-50'
  },

  // Newsletter Templates
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Newsletter',
    content: `<h1>[Newsletter Title]</h1>
<p><strong>Volume [X], Issue [X]</strong> | [Date]</p>

<h2>From the Editor</h2>
<p>[Opening message from the editor or team]</p>

<h2>Featured Story</h2>
<p><strong>[Headline]</strong></p>
<p>[Lead paragraph with the most important information]</p>
<p>[Additional details and quotes]</p>

<h2>Company Updates</h2>
<p>[Recent company news and announcements]</p>
<p>[Upcoming events and important dates]</p>

<h2>Team Spotlight</h2>
<p><strong>[Employee Name]</strong></p>
<p>[Brief bio and recent achievements]</p>

<h2>Industry News</h2>
<p>[Relevant industry updates and trends]</p>

<h2>Upcoming Events</h2>
<ul>
<li>[Event 1] - [Date] - [Location]</li>
<li>[Event 2] - [Date] - [Location]</li>
</ul>

<p><strong>Contact Us:</strong> [Email] | [Phone] | [Website]</p>`,
    description: 'Multi-column newsletter with images',
    icon: '📰',
    color: 'bg-blue-50'
  }
];

export const getTemplateContent = (templateId: string): TemplateContent | null => {
  return templateContents.find(template => template.id === templateId) || null;
}; 