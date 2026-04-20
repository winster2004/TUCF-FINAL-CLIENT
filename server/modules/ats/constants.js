export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'with', 'by', 'as',
  'is', 'are', 'be', 'this', 'that', 'from', 'your', 'you', 'will', 'our', 'we', 'us',
  'role', 'job', 'work', 'experience', 'years', 'year', 'ability', 'strong', 'team',
  'using', 'build', 'develop', 'required', 'preferred', 'candidate', 'including',
  'have', 'has', 'had', 'into', 'about', 'their', 'them', 'than', 'such', 'while',
  'across', 'within', 'must', 'should', 'can', 'could', 'would', 'need', 'needs',
  'hiring', 'design',
]);

export const SECTION_ALIASES = {
  summary: ['summary', 'professional summary', 'profile', 'objective', 'about'],
  skills: ['skills', 'technical skills', 'core skills', 'technical arsenal', 'technologies'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'career'],
  education: ['education', 'academic background', 'qualifications'],
  projects: ['projects', 'personal projects', 'featured projects'],
  certifications: ['certifications', 'licenses', 'awards'],
};

export const TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node.js', 'express', 'next.js', 'html', 'css',
  'tailwind', 'redux', 'mongodb', 'postgresql', 'mysql', 'sql', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'rest api', 'graphql', 'jest', 'cypress', 'git', 'github actions',
  'ci/cd', 'agile', 'microservices', 'python', 'java', 'spring boot', 'machine learning',
  'data analysis', 'figma', 'ui/ux', 'linux', 'firebase', 'react native', 'devops',
];

export const KEYWORD_SYNONYMS = {
  javascript: ['js', 'ecmascript'],
  typescript: ['ts'],
  react: ['reactjs', 'react.js'],
  'node.js': ['node', 'nodejs'],
  express: ['express.js', 'expressjs'],
  'next.js': ['nextjs', 'next'],
  mongodb: ['mongo', 'mongo db'],
  postgresql: ['postgres', 'postgre'],
  mysql: ['my sql'],
  docker: ['containers', 'containerization'],
  kubernetes: ['k8s'],
  aws: ['amazon web services'],
  azure: ['microsoft azure'],
  gcp: ['google cloud', 'google cloud platform'],
  'rest api': ['rest', 'restful api', 'restful services'],
  graphql: ['graph ql'],
  jest: ['unit testing', 'test automation'],
  cypress: ['e2e testing', 'end to end testing'],
  git: ['version control'],
  'github actions': ['github pipelines', 'workflow automation'],
  'ci/cd': ['continuous integration', 'continuous delivery', 'continuous deployment'],
  agile: ['scrum', 'kanban'],
  microservices: ['distributed systems', 'service-oriented architecture'],
  python: ['python3'],
  java: ['core java'],
  'spring boot': ['springboot'],
  'machine learning': ['ml', 'artificial intelligence'],
  'data analysis': ['analytics', 'data analytics'],
  figma: ['design systems', 'wireframing'],
  'ui/ux': ['user interface', 'user experience'],
  linux: ['unix'],
  firebase: ['firestore'],
  'react native': ['mobile app development'],
  devops: ['platform engineering', 'infrastructure automation'],
};

export const SKILL_CATEGORIES = {
  frontend: ['javascript', 'typescript', 'react', 'next.js', 'html', 'css', 'tailwind', 'redux', 'ui/ux'],
  backend: ['node.js', 'express', 'python', 'java', 'spring boot', 'graphql', 'rest api', 'microservices'],
  data: ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'ci/cd', 'github actions'],
  quality: ['jest', 'cypress', 'agile', 'git'],
};
