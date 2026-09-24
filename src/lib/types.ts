export type Repository = {
  id: number;
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  pushedAt: string | null;
  stars: number;
  fork: boolean;
  archived: boolean;
};
export type ProjectFeed = {
  repositories: Repository[];
  fetchedAt: string | null;
  status: "available" | "unavailable";
};
export type AppProject = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  url: string;
  repository: string | null;
  technologies: string[];
  responsibility: string;
  notes: string[];
};
