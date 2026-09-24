import type { AppProject } from "@/lib/types";

// Personal copy is deliberately independent of external profile/company/bio fields.
export const person = {
  name: "Mohamed Shez",
  role: "Senior Full-Stack Engineer",
  introduction: "I build applications, data tools, and the systems behind them. My work spans React, Next.js, and TypeScript, with hands-on responsibility from development through maintenance.",
  about: "I’m Mohamed Shez, a Senior Full-Stack Engineer. I care about how software works, how it feels to use, and how it holds up after launch. This is a collection of my own projects, experiments, and ongoing work.",
  personal: "Away from application development, I administer PC game servers. I’m also a dad of two - there’s usually something to build, fix, or figure out.",
  github: "https://github.com/mohamedshez",
  youtube: "https://www.youtube.com/@ShazeAn",
  linkedin: "https://www.linkedin.com/in/mohamedshez/",
  email: "mr.mohamed.shez@gmail.com",
  technologies: ["React", "Next.js", "TypeScript", "Node.js"],
};

// Explicitly approved public facts. No private repository API is queried.
export const applications: AppProject[] = [
  {
    slug: "kash-lv", name: "KASH.lv", category: "Marketplace",
    summary: "A Latvian marketplace with production and development storefronts, plus dedicated back offices for administrators and moderators.",
    url: "https://kash.lv", repository: null,
    technologies: [], responsibility: "Developed and maintained by me",
    notes: ["Public marketplace for Latvia.", "Separate production and development environments.", "Back-office applications for administrators and moderators in both environments.", "Source code remains private; the live product is available to explore."],
  },
  {
    slug: "osint", name: "OSINT", category: "Intelligence interface",
    summary: "A responsive, map-first OSINT application built with Next.js and available as an installable web app.",
    url: "https://osint.shez.app", repository: "worldosview",
    technologies: ["Next.js", "TypeScript", "PWA"], responsibility: "My public project, built on an upstream foundation",
    notes: ["Map-first interface for exploring open-source intelligence.", "Responsive application with progressive web app support.", "The repository credits its upstream foundation; source and attribution are available on GitHub."],
  },
  {
    slug: "worldviewos", name: "WorldviewOS", category: "Geospatial application",
    summary: "A CesiumJS globe with flights, satellites, earthquakes, traffic, and CCTV overlays, built using Next.js.",
    url: "https://worldviewos.shez.app", repository: "worldview-ui",
    technologies: ["Next.js", "TypeScript", "CesiumJS"], responsibility: "My public application",
    notes: ["Globe-based interface built around CesiumJS.", "Multiple overlays bring different data sources into one view.", "Explore the implementation and project history in its public repository."],
  },
  {
    slug: "todo", name: "Todo", category: "Productivity",
    summary: "A task application for creating, editing, and deleting tasks, with browser storage to keep them between visits.",
    url: "https://todo.shez.app", repository: "todo-app-nextjs",
    technologies: ["React", "Next.js", "Material UI"], responsibility: "My public application",
    notes: ["Create, edit, and delete tasks.", "Local storage preserves tasks across page refreshes.", "Built with React, Next.js, and Material UI."],
  },
];

export const kashEnvironments = [
  { name: "Production", links: [{ label: "Public marketplace", url: "https://kash.lv" }, { label: "Admin & moderator back office", url: "https://admin.kash.lv" }] },
  { name: "Development", links: [{ label: "Development marketplace", url: "https://dev.kash.lv" }, { label: "Admin & moderator back office", url: "https://admin.dev.kash.lv" }] },
];
