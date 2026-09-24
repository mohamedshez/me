"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, X, Moon, Sun, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { person } from "@/content/portfolio";

export function Shell({ children, buildVersion }: { children: React.ReactNode; buildVersion: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") setTheme(current);
  }, []);
  useEffect(() => { setMenu(false); }, [pathname]);
  const toggleTheme = () => {
    const dark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("shez-theme", next); } catch { /* Storage may be disabled. */ }
    setTheme(next);
  };
  const segments = pathname.split("/").filter(Boolean);
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="brand" aria-label="Mohamed Shez home"><span className="brand-mark">s<span>_</span></span><span>shez.app<small>MOHAMED SHEZ</small></span></Link>
      <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="primary-navigation" aria-label={menu ? "Close navigation" : "Open navigation"}>{menu ? <X /> : <Menu />}</button>
      <nav id="primary-navigation" className={`primary-nav ${menu ? "is-open" : ""}`} aria-label="Main navigation">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Overview</Link>
        <Link href="/projects" aria-current={pathname.startsWith("/projects") || pathname.startsWith("/work") ? "page" : undefined}>Projects</Link>
        <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
        <a href={person.youtube} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight size={14} /></a>
      </nav>
      <div className="header-actions"><button className="icon-button" onClick={toggleTheme} aria-label="Toggle colour theme"><Sun className="theme-sun" /><Moon className="theme-moon" /></button><a href={person.github} className="github-link" target="_blank" rel="noopener noreferrer"><Github size={19} /><span>GitHub</span><ArrowUpRight size={14} /></a></div>
    </div></header>
    <div className="location-bar"><div className="site-container location-inner"><nav aria-label="Breadcrumb"><ol><li><Link href="/">shez.app</Link></li>{segments.length === 0 ? <li aria-current="page">overview</li> : segments.map((segment, i) => <li key={segment}>{i < segments.length - 1 ? <Link href={segment === "work" ? "/projects" : "/" + segments.slice(0, i + 1).join("/")}>{segment}</Link> : <span aria-current="page">{segment.replaceAll("-", " ")}</span>}</li>)}</ol></nav><span className="edition">PERSONAL PORTFOLIO / ENGINEERING EDITION</span></div></div>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="site-container footer-inner"><div><Link className="footer-brand" href="/">shez.app</Link><p>Mohamed Shez · Senior Full-Stack Engineer</p>{buildVersion}</div><nav aria-label="Footer navigation"><Link href="/sitemap">Sitemap</Link><a href={person.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={person.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={person.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a></nav></div></footer>
  </>;
}
