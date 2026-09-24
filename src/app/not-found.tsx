import Link from "next/link";
export default function NotFound() {
  return <div className="site-container page-content"><span className="eyebrow">404 / ROUTE NOT FOUND</span><h1>This route leads nowhere.</h1><p className="lede">The project may have moved, become private, or been removed. There’s more to explore in the project directory.</p><div className="actions"><Link className="button primary" href="/projects">Explore projects →</Link><Link className="text-link" href="/">Back home</Link></div></div>;
}
