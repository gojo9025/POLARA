// ═══════════════════════════════════════════════════════════════
// POLARA — Type Definitions
// ═══════════════════════════════════════════════════════════════

export type UserRole = 'public' | 'student' | 'researcher' | 'educator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  researchAreas?: string[];
  avatar?: string;
}

export type ResourceType =
  | 'expedition'
  | 'report'
  | 'dataset'
  | 'publication'
  | 'photograph'
  | 'video'
  | 'activity'
  | 'learning_module';

export type ContentStatus =
  | 'draft'
  | 'processing'
  | 'ai_generated'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export type PolarRegion = 'Antarctica' | 'Arctic' | 'Southern Ocean' | 'Himalayas';

export type Visibility = 'public' | 'internal' | 'restricted';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  researchArea: string;
  region: PolarRegion;
  year: number;
  status: ContentStatus;
  visibility: Visibility;
  keywords: string[];
  expeditionId?: string;
  authors?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expedition {
  id: string;
  name: string;
  expeditionNumber: string;
  year: number;
  region: PolarRegion;
  startDate: string;
  endDate: string;
  location: string;
  objectives: string[];
  researchAreas: string[];
  participants: string[];
  institution: string;
  vessel?: string;
  station?: string;
  description: string;
  imageUrl: string;
  resourceCount: {
    reports: number;
    datasets: number;
    publications: number;
    photographs: number;
    videos: number;
    learningModules: number;
  };
  status: ContentStatus;
}

export interface Report extends Resource {
  type: 'report';
  abstract: string;
  findings: string[];
  organization: string;
  fileUrl?: string;
  relatedPublications: string[];
  relatedDatasets: string[];
}

export interface Dataset extends Resource {
  type: 'dataset';
  datasetType: string;
  collectionPeriod: string;
  geographicCoverage: string;
  variables: string[];
  units: string[];
  fileFormat: string;
  license: string;
  citation: string;
  rowCount?: number;
  columnCount?: number;
}

export interface Publication extends Resource {
  type: 'publication';
  journal: string;
  doi?: string;
  abstract: string;
  publicationDate: string;
  relatedExpedition?: string;
  datasetReferences: string[];
}

export interface Photograph extends Resource {
  type: 'photograph';
  photographer: string;
  date: string;
  location: string;
  tags: string[];
  copyright: string;
  highResUrl: string;
}

export interface Video extends Resource {
  type: 'video';
  duration: string;
  thumbnailUrl: string;
  source: string;
  transcript?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  targetAudience: string;
  estimatedTime: string;
  imageUrl: string;
  sourceResources: string[];
}

export interface Quiz {
  id: string;
  title: string;
  sourceResourceId: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourceReference?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  simpleExplanation: string;
  relatedTerms: string[];
  relatedResources: string[];
  imageUrl?: string;
}

export interface OutreachPackage {
  id: string;
  sourceResourceId: string;
  sourceResourceTitle: string;
  outputs: OutreachOutput[];
  status: ContentStatus;
  createdAt: string;
}

export interface OutreachOutput {
  id: string;
  type: 'website_article' | 'linkedin' | 'instagram' | 'short_social' | 'student_explanation' | 'teacher_resource' | 'quiz' | 'newsletter' | 'research_highlight' | 'data_reel' | 'data_sonification';
  title: string;
  content: string;
  status: ContentStatus;
  generatedAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  mode: 'research' | 'student' | 'educator' | 'public';
  messages: AIMessage[];
  resourceContext?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AISource[];
  timestamp: string;
}

export interface AISource {
  resourceId: string;
  title: string;
  type: ResourceType;
  section?: string;
  page?: number;
  relevance: number;
}

export interface SearchResult {
  resource: Resource;
  matchedConcepts: string[];
  relevanceScore: number;
}

export interface Notification {
  id: string;
  type: 'upload_complete' | 'review_required' | 'approval_required' | 'published' | 'info';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  resourceId?: string;
}

export interface ResearchArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  resourceCount: number;
  color: string;
}

export interface ResourceRelationship {
  sourceId: string;
  targetId: string;
  type: 'related_to' | 'part_of_expedition' | 'derived_from' | 'supports' | 'references' | 'visualizes' | 'educational_version_of';
}
