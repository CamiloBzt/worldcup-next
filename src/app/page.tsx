import { GroupMatchBrowser } from "@/components/group-match-browser";
import { loadDashboardData } from "@/lib/data";
import { percent } from "@/lib/format";

export default async function Home() {
  const data = await loadDashboardData();
  const bestModel = data.modelScores[0];
  const champion = data.tournament[0];
  const finalist = [...data.tournament].sort(
    (a, b) => b.final_probability - a.final_probability,
  )[0];
  const topAwards = data.awards.filter((award) => award.rank === 1);
  const topGroups = [...data.groups]
    .sort((a, b) => b.top_2_probability - a.top_2_probability)
    .slice(0, 6);
  const titleContenders = data.tournament.slice(0, 10);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efdf] text-[#17211f]">
      <section className="relative px-4 pb-8 pt-5">
        <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(135deg,#10231e_0%,#173f32_48%,#c34432_49%,#c34432_54%,#f0b13d_55%,#f0b13d_100%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-white">
              WC 2026 lab
            </span>
            <span className="rounded-full bg-[#f7f0df] px-3 py-1 text-xs font-black text-[#17211f]">
              20.000 sims
            </span>
          </div>

          <div className="mt-9 rounded-[2rem] border border-black/15 bg-[#fffaf0] p-5 shadow-[0_18px_0_rgba(23,33,31,.16)] md:p-8">
            <p className="eyebrow text-[#b93d2f]">Modelo predictivo completo</p>
            <h1 className="mt-3 max-w-4xl text-[3.2rem] font-black leading-[.82] tracking-[-.04em] md:text-8xl">
              Mundial 2026, del grupo a la final.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d6762] md:text-lg">
              Dashboard React construido sobre el pipeline: marcadores exactos,
              campeon, fases del torneo, premios individuales y fixture por grupo.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <HeroMetric label="Campeon" value={champion.team} sub={percent(champion.champion_probability)} />
              <HeroMetric label="Final" value={finalist.team} sub={percent(finalist.final_probability)} />
              <HeroMetric label="Top-5 score" value={percent(bestModel.top_5_accuracy)} sub="test 2022+" />
              <HeroMetric label="Log loss" value={bestModel.exact_score_log_loss.toFixed(3)} sub="marcador exacto" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-7">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]">
            <article className="panel p-5 md:p-6">
              <p className="eyebrow">Carrera por el titulo</p>
              <h2 className="section-title">Probabilidad de campeon</h2>
              <div className="mt-5 space-y-3">
                {titleContenders.map((team, index) => (
                  <div key={team.team} className="ranking-row">
                    <span className="rank-chip">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-black">
                      {team.team}
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-black/10 md:w-44">
                      <div
                        className="h-full rounded-full bg-[#b93d2f]"
                        style={{ width: `${team.champion_probability * 100 * 4}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-black">
                      {percent(team.champion_probability)}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel p-5 md:p-6">
              <p className="eyebrow">Premios individuales</p>
              <h2 className="section-title">Candidatos proxy</h2>
              <div className="mt-5 space-y-3">
                {topAwards.map((award) => (
                  <div key={award.award} className="rounded-2xl bg-[#17211f] p-4 text-[#fff7e8]">
                    <div className="text-xs font-black uppercase tracking-[.14em] text-[#f0b13d]">
                      {award.award}
                    </div>
                    <div className="mt-1 text-2xl font-black leading-tight">
                      {award.player}
                    </div>
                    <div className="mt-1 text-sm text-[#d8d0bd]">
                      {award.team} · {award.sub_position}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold">
                      <span>G {award.recent_goals.toFixed(0)}</span>
                      <span>A {award.recent_assists.toFixed(0)}</span>
                      <span>{award.expected_matches_proxy.toFixed(1)} PJ</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 py-7">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Grupos</p>
          <h2 className="section-title">Selecciones mas fuertes para avanzar</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topGroups.map((team) => (
              <article key={`${team.group}-${team.team}`} className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#69746e]">
                      {team.group}
                    </div>
                    <h3 className="text-2xl font-black">{team.team}</h3>
                  </div>
                  <span className="rounded-full bg-[#0f6f4f] px-3 py-1 text-sm font-black text-white">
                    {percent(team.top_2_probability)}
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[#0f6f4f]"
                    style={{ width: `${team.top_2_probability * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-sm font-bold text-[#5f6b66]">
                  <span>Gana grupo {percent(team.group_winner_probability)}</span>
                  <span>{team.avg_points.toFixed(1)} pts</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <GroupMatchBrowser matches={data.matches} />

      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl panel p-5">
          <p className="eyebrow">Modelo</p>
          <h2 className="section-title">Comparacion resumida</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[.12em] text-[#6a746f]">
                <tr>
                  <th className="py-3">Modelo</th>
                  <th>Top-1</th>
                  <th>Top-3</th>
                  <th>Top-5</th>
                  <th>Log loss</th>
                </tr>
              </thead>
              <tbody>
                {data.modelScores.map((model) => (
                  <tr key={model.model} className="border-t border-black/10">
                    <td className="max-w-[280px] py-3 pr-3 font-bold">
                      {model.model}
                    </td>
                    <td>{percent(model.top_1_accuracy)}</td>
                    <td>{percent(model.top_3_accuracy)}</td>
                    <td>{percent(model.top_5_accuracy)}</td>
                    <td>{model.exact_score_log_loss.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f8edda] p-3">
      <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#75695d]">
        {label}
      </div>
      <div className="mt-1 truncate text-xl font-black leading-tight md:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-xs font-bold text-[#b93d2f]">{sub}</div>
    </div>
  );
}
