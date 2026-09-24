"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="site-container page-content"><span className="eyebrow">SOMETHING WENT WRONG</span><h1>Let’s try that again.</h1><p className="lede">This page couldn’t be loaded. Please try again in a moment.</p><div className="actions"><button className="button primary" onClick={reset}>Try again</button><a className="text-link" href="/">Back home</a></div></div>;
}
