const KEY = 'llp_v1';

interface ProgressStore {
  sessions: Record<string, number>; // id -> step reached (0 = not started)
  articles: Record<string, true>;   // article number string -> read
  last: { type: 'session' | 'article'; id: string; name: string } | null;
}

function load(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { sessions: {}, articles: {}, last: null, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { sessions: {}, articles: {}, last: null };
}

function save(p: ProgressStore): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function getSessionStep(id: string): number {
  return load().sessions[id] || 0;
}

export function setSessionStep(id: string, step: number, name: string): void {
  const p = load();
  p.sessions[id] = step;
  if (step > 0) p.last = { type: 'session', id, name };
  save(p);
}

export function markArticleRead(num: number, title: string): void {
  const p = load();
  p.articles[String(num)] = true;
  p.last = { type: 'article', id: String(num), name: title };
  save(p);
}

export function isArticleRead(num: number): boolean {
  return !!load().articles[String(num)];
}

export function getLastVisited(): ProgressStore['last'] {
  return load().last;
}

export function resetProgress(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function visitCognizanceCluster(cluster: string, label: string): void {
  const p = load();
  p.sessions[`cog:${cluster}`] = 1;
  p.last = { type: 'session', id: cluster, name: label };
  save(p);
}

export function isCognizanceClusterVisited(cluster: string): boolean {
  return (load().sessions[`cog:${cluster}`] || 0) > 0;
}

export function getProgressStats(allSessionIds: string[], totalArticles: number) {
  const p = load();
  const started = allSessionIds.filter(id => (p.sessions[id] || 0) > 0).length;
  const read = Object.keys(p.articles).length;
  return {
    startedSessions: started,
    readArticles: read,
    sessionPct: allSessionIds.length ? Math.round((started / allSessionIds.length) * 100) : 0,
    articlePct: totalArticles ? Math.round((read / totalArticles) * 100) : 0,
  };
}
