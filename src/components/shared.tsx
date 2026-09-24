import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { kashEnvironments, person } from "@/content/portfolio";

export function ExternalLink({ href, children, className = "text-link" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} /></a>;
}
export function KashEnvironments() {
  return <section className="environments"><span className="eyebrow">ONE PRODUCT / FOUR CONNECTED SPACES</span><h2>Built for users.<br />Managed behind the scenes.</h2><p>Production and development environments, each with a marketplace and a back office for administrators and moderators.</p><div className="environment-grid">{kashEnvironments.map(environment => <article key={environment.name}><span className="eyebrow">{environment.name}</span><h3>{environment.name === "Production" ? "The live platform" : "The development platform"}</h3>{environment.links.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer"><span>{link.label}<small>{new URL(link.url).hostname}</small></span><ArrowUpRight size={19} /></a>)}</article>)}</div></section>;
}
export function ContactSection() {
  return <section className="contact-section"><div className="site-container"><span className="eyebrow">LET’S CONNECT</span><h2>Good work starts<br />with a conversation<span>.</span></h2><div className="actions"><a className="button primary" href={`mailto:${person.email}`}>Say hello <ArrowUpRight size={18} /></a><a className="button" href={person.cv} download>Download CV (PDF) <ArrowUpRight size={18} /></a><ExternalLink href={person.linkedin}>LinkedIn</ExternalLink><Link className="text-link" href="/about">More about me <ArrowRight size={16} /></Link></div></div></section>;
}
