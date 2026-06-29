import { GroupMatchBrowser } from "@/components/group-match-browser";
import { loadDashboardData } from "@/lib/data";
import type { RecencyScore, Round32Prediction } from "@/lib/data";
import { percent } from "@/lib/format";

export default async function Home() {
  const data = await loadDashboardData();
  const bestModel = data.modelScores[0];
  const champion = data.tournament[0];
  const topAwards = data.awards.filter((award) => award.rank === 1);
  const topGroups = [...data.groups]
    .sort((a, b) => b.top_2_probability - a.top_2_probability)
    .slice(0, 6);
  const titleContenders = data.tournament.slice(0, 10);
  const completedRound32 = data.round32.filter((match) => match.status === "completed").length;
  const selectedRecencyScore =
    data.recencyScores.find(
      (score) => score.split === "test_2022_plus" && score.selected_by_validation,
    ) ?? data.recencyScores[0];
  const bestWeightedRecency = data.recencyScores
    .filter((score) => score.split === "test_2022_plus" && score.model.includes("weighted"))
    .sort((a, b) => a.exact_score_log_loss - b.exact_score_log_loss)[0];

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
              Round of 32
            </span>
          </div>

          <div className="mt-9 rounded-[2rem] border border-black/15 bg-[#fffaf0] p-5 shadow-[0_18px_0_rgba(23,33,31,.16)] md:p-8">
            <p className="eyebrow text-[#b93d2f]">Modelo predictivo completo</p>
            <h1 className="mt-3 max-w-4xl text-[3.2rem] font-black leading-[.82] tracking-[-.04em] md:text-8xl">
              Mundial 2026, ahora en ronda de 32.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d6762] md:text-lg">
              Dashboard React construido sobre el pipeline: marcadores exactos,
              fase eliminatoria, recencia del modelo, premios individuales y fixture por grupo.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <HeroMetric label="Dieciseisavos" value={`${completedRound32}/16`} sub="con resultado" />
              <HeroMetric label="Campeon" value={champion.team} sub={percent(champion.champion_probability)} />
              <HeroMetric label="Top-5 score" value={percent(bestModel.top_5_accuracy)} sub="test 2022+" />
              <HeroMetric label="Log loss" value={bestModel.exact_score_log_loss.toFixed(3)} sub="marcador exacto" />
            </div>
          </div>
        </div>
      </section>

      <Round32Section matches={data.round32} />

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

      <RecencySection
        scores={data.recencyScores}
        selectedScore={selectedRecencyScore}
        bestWeightedScore={bestWeightedRecency}
      />

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

function Round32Section({ matches }: { matches: Round32Prediction[] }) {
  return (
    <section className="px-4 py-7">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Fase eliminatoria</p>
            <h2 className="section-title">Predicciones ronda de 32</h2>
          </div>
          <span className="w-fit rounded-full bg-[#17211f] px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-[#fff7e8]">
            90 minutos
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {matches.map((match) => (
            <article
              key={`${match.date}-${match.home_team}-${match.away_team}`}
              className="panel flex min-h-[260px] flex-col p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.12em] text-[#69746e]">
                    {match.date.slice(0, 10)}
                  </div>
                  <h3 className="mt-2 text-xl font-black leading-tight">
                    {match.home_team} vs {match.away_team}
                  </h3>
                </div>
                <span
                  className={
                    match.status === "completed"
                      ? "rounded-full bg-[#0f6f4f] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white"
                      : "rounded-full bg-[#f0b13d] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#17211f]"
                  }
                >
                  {match.status === "completed" ? "Final" : "Modelo"}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-[#17211f] p-4 text-[#fff7e8]">
                <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#f0b13d]">
                  {match.status === "completed" ? "Resultado real" : "Marcador probable"}
                </div>
                <div className="mt-1 text-4xl font-black">
                  {match.status === "completed" ? match.actual_score_90 : match.top_score}
                </div>
                <div className="mt-2 text-xs font-bold text-[#d8d0bd]">
                  Top score: {percent(match.top_score_probability)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <MiniProbability label="Local" value={match.home_win_probability} />
                <MiniProbability label="Empate" value={match.draw_probability} />
                <MiniProbability label="Visita" value={match.away_win_probability} />
              </div>

              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8edda] px-3 py-3">
                  <span className="text-xs font-black uppercase tracking-[.12em] text-[#75695d]">
                    Avanza
                  </span>
                  <span className="text-right text-sm font-black">
                    {match.favorite_to_advance} · {percent(match.advance_probability)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecencySection({
  scores,
  selectedScore,
  bestWeightedScore,
}: {
  scores: RecencyScore[];
  selectedScore?: RecencyScore;
  bestWeightedScore?: RecencyScore;
}) {
  const testScores = scores
    .filter((score) => score.split === "test_2022_plus")
    .sort((a, b) => a.exact_score_log_loss - b.exact_score_log_loss);

  return (
    <section className="px-4 py-7">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <article className="panel p-5 md:p-6">
          <p className="eyebrow">Recencia</p>
          <h2 className="section-title">El peso reciente no gano</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-[#5d6762]">
            Se probaron vidas medias de 6, 12, 24 y 48 meses. Para marcador exacto,
            el modelo seleccionado sigue siendo el HGB sin ponderar.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <HeroMetric
              label="Modelo usado"
              value={selectedScore?.model.replaceAll("_", " ") ?? "N/D"}
              sub={selectedScore ? selectedScore.exact_score_log_loss.toFixed(3) : "sin dato"}
            />
            <HeroMetric
              label="Mejor ponderado"
              value={bestWeightedScore?.model.replaceAll("_", " ") ?? "N/D"}
              sub={bestWeightedScore ? bestWeightedScore.exact_score_log_loss.toFixed(3) : "sin dato"}
            />
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <p className="eyebrow">Backtest 2022+</p>
          <h2 className="section-title">Ranking por log loss</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[.12em] text-[#6a746f]">
                <tr>
                  <th className="py-3">Modelo</th>
                  <th>Top-5</th>
                  <th>Log loss</th>
                  <th>Brier 1X2</th>
                </tr>
              </thead>
              <tbody>
                {testScores.map((score) => (
                  <tr key={score.model} className="border-t border-black/10">
                    <td className="max-w-[320px] py-3 pr-3 font-bold">
                      {score.model.replaceAll("_", " ")}
                    </td>
                    <td>{percent(score.top_5_accuracy)}</td>
                    <td>{score.exact_score_log_loss.toFixed(3)}</td>
                    <td>{score.brier_1x2.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

function MiniProbability({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-[#f8edda] px-2 py-2">
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6a5f55]">
        {label}
      </div>
      <div className="text-sm">{percent(value)}</div>
    </div>
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
