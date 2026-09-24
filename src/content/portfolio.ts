import type { AppProject } from "@/lib/types";

// Personal copy is deliberately independent of external profile/company/bio fields.
export const person = {
  name: "Mohamed Shez",
  role: "Senior Full-Stack Engineer",
  introduction: "I build applications, data tools, and the systems behind them. My work spans frontend interfaces, Java and Python backends, data tools, and cloud delivery, with hands-on responsibility from development through maintenance.",
  about: "I’m Mohamed Shez, a Senior Full-Stack Engineer. I care about how software works, how it feels to use, and how it holds up after launch. With 13 years of experience and a degree in Computer Gaming and Animation Technology, I bring a mix of analytical thinking and creative curiosity to my own projects, experiments, and ongoing work.",
  personal: "Away from application development, I enjoy scripting, PC building and gaming, and classic and retro motorcycles. I administer PC game servers and I’m a dad of two - there’s usually something to build, fix, or figure out.",
  github: "https://github.com/mohamedshez",
  youtube: "https://www.youtube.com/@ShazeAn",
  linkedin: "https://www.linkedin.com/in/mohamedshez/",
  email: "mr.mohamed.shez@gmail.com",
  technologies: ["TypeScript", "React", "Java", "Spring Boot", "Python", "AWS", "Docker"],
  cv: "/cv/Mohamed-Shez-CV.pdf",
};

export const skillGroups = [
  { name: "Languages & web foundations", items: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Kotlin", "HTML5", "CSS3"] },
  { name: "Frontend & content", items: ["React", "Next.js", "Angular", "jQuery", "Tailwind CSS", "Sanity CMS"] },
  { name: "Backend & data", items: ["Node.js", "Spring Boot", "Django", "FastAPI", "REST APIs", "Snowflake", "Streamlit"] },
  { name: "DevOps & delivery", items: ["Linux", "Docker", "AWS", "Vercel", "Git", "CI/CD"] },
  { name: "Quality & collaboration", items: ["Selenium", "Jira", "Agile & Scrum", "Figma", "Clean Code"] },
];
export const learning = ["Streamlit for Snowflake (2025)", "Java Spring Framework 6 with Spring Boot 3 (2024)", "Python and Django Full Stack (2024)", "Next.js with Sanity CMS (2024)", "Modern React Bootcamp (2024)", "Clean Code (2024)", "Learning React.js (2022)", "Mobile App Development (2015)"];

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
  {
    slug: "shez-portfolio", name: "shez.app", category: "Personal portfolio",
    summary: "My engineering portfolio with live applications, a daily GitHub project feed, and a downloadable public CV.",
    url: "https://www.shez.app", repository: "me",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"], responsibility: "Designed, developed and maintained by me",
    notes: ["The personal portfolio you are visiting now.", "Public GitHub projects refresh daily without a deployment.", "Versioned releases are tested before deployment through GitHub Actions."],
  },
];

export const kashEnvironments = [
  { name: "Production", links: [{ label: "Public marketplace", url: "https://kash.lv" }, { label: "Admin & moderator back office", url: "https://admin.kash.lv" }] },
  { name: "Development", links: [{ label: "Development marketplace", url: "https://dev.kash.lv" }, { label: "Admin & moderator back office", url: "https://admin.dev.kash.lv" }] },
];
