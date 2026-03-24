export interface Workspace {
  id: string;
  name: string;
  description: string;
  role: 'owner' | 'contributor' | 'viewer';
  members: Member[];
  papers: Paper[];
  notes: Note[];
  docs: Doc[];
  skills: string[]; // Skill IDs
  files: WorkspaceFile[];
  workflows: Workflow[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: string;
  lastRun?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'search' | 'analyze' | 'summarize' | 'export' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: Record<string, any>;
  output?: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  modifiedAt: string;
  fairStatus: {
    findable: boolean;
    accessible: boolean;
    interoperable: boolean;
    reusable: boolean;
  };
  children?: WorkspaceFile[];
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'contributor' | 'viewer';
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  abstract: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  isAdded: boolean;
  citations: string[]; // IDs of papers it cites
  citedBy: string[]; // IDs of papers that cite it
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  source?: string; // Paper ID or URL
  createdAt: string;
  isAiGenerated: boolean;
}

export interface Doc {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'url';
  content: string;
  url?: string;
  addedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
}
