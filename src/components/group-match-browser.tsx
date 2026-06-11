"use client";

import { useMemo, useState } from "react";
import type { GroupMatch } from "@/lib/data";
import { percent } from "@/lib/format";

type Props = {
  matches: GroupMatch[];
};

export function GroupMatchBrowser({ matches }: Props) {
  const groups = useMemo(
    () => Array.from(new Set(matches.map((match) => match.group))).sort(),
    [matches],
  );
  const [activeGroup, setActiveGroup] = useState(groups[0] ?? "");
  const visibleMatches = matches.filter((match) => match.group === activeGroup);

  return (
    <section className="space-y-4 px-4 py-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fixture interactivo</p>
          <h2 className="section-title">Partidos por grupo</h2>
        </div>
        <select
          value={activeGroup}
          onChange={(event) => setActiveGroup(event.target.value)}
          className="rounded-full border border-black/15 bg-[#fffdf4] px-4 py-3 text-sm font-semibold text-[#16211f] shadow-[0_4px_0_rgba(0,0,0,.12)] outline-none"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleMatches.map((match) => (
          <article key={match.match_id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black leading-tight">
                  {match.home_team} vs {match.away_team}
                </h3>
                <p className="mt-1 text-xs text-[#68736d]">
                  {match.date.slice(0, 10)} · {match.ground}
                </p>
              </div>
              <span className="rounded-full bg-[#17211f] px-3 py-1 text-xs font-black text-[#f7f0df]">
                #{match.match_id + 1}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <ProbabilityPill label="Local" value={match.home_win_probability} />
              <ProbabilityPill label="Empate" value={match.draw_probability} />
              <ProbabilityPill label="Visita" value={match.away_win_probability} />
            </div>

            <div className="mt-4 space-y-2">
              {match.scores.slice(0, 5).map((score) => (
                <div key={`${match.match_id}-${score.rank}`} className="score-line">
                  <span className="w-10 font-black">{score.exact_score}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-[#0f6f4f]"
                      style={{ width: `${Math.min(score.probability * 100, 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right">{percent(score.probability)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProbabilityPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-[#f8edda] px-2 py-2">
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6a5f55]">
        {label}
      </div>
      <div className="text-sm">{percent(value)}</div>
    </div>
  );
}
