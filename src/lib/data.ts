import { readFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export type ModelScore = {
  model: string;
  top_1_accuracy: number;
  top_3_accuracy: number;
  top_5_accuracy: number;
  exact_score_log_loss: number;
  brier_1x2: number;
};

export type TournamentTeam = {
  team: string;
  round_of_32_probability: number;
  round_of_16_probability: number;
  quarter_final_probability: number;
  semi_final_probability: number;
  final_probability: number;
  champion_probability: number;
};

export type GroupTeam = {
  group: string;
  team: string;
  group_winner_probability: number;
  top_2_probability: number;
  avg_points: number;
};

export type PlayerAward = {
  award: string;
  rank: number;
  player: string;
  team: string;
  sub_position: string;
  score: number;
  recent_goals: number;
  recent_assists: number;
  expected_matches_proxy: number;
};

export type MatchScore = {
  exact_score: string;
  probability: number;
  rank: number;
};

export type GroupMatch = {
  match_id: number;
  date: string;
  group: string;
  home_team: string;
  away_team: string;
  ground: string;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  scores: MatchScore[];
};

export type KnockoutPrediction = {
  date: string;
  home_team: string;
  away_team: string;
  status: string;
  actual_score_90: string;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  top_score: string;
  top_score_probability: number;
  favorite_to_advance: string;
  advance_probability: number;
  note: string;
};

export type RecencyScore = {
  split: string;
  model: string;
  selected_by_validation: boolean;
  test_matches: number;
  top_1_accuracy: number;
  top_3_accuracy: number;
  top_5_accuracy: number;
  exact_score_log_loss: number;
  brier_1x2: number;
};

export type DashboardData = {
  modelScores: ModelScore[];
  tournament: TournamentTeam[];
  groups: GroupTeam[];
  awards: PlayerAward[];
  matches: GroupMatch[];
  finalStage: KnockoutPrediction[];
  semifinals: KnockoutPrediction[];
  quarterfinals: KnockoutPrediction[];
  round16: KnockoutPrediction[];
  round32: KnockoutPrediction[];
  recencyScores: RecencyScore[];
};

export async function loadDashboardData(): Promise<DashboardData> {
  const [
    modelScores,
    tournament,
    groups,
    awards,
    topScores,
    oneXTwo,
    finalStage,
    semifinals,
    quarterfinals,
    round16,
    round32,
    recencyScores,
  ] =
    await Promise.all([
      readCsv("model_comparison_scores.csv"),
      readCsv("worldcup_2026_tournament_monte_carlo.csv"),
      readCsv("worldcup_2026_group_stage_monte_carlo.csv"),
      readCsv("worldcup_2026_player_awards_proxy.csv"),
      readCsv("worldcup_2026_top5_score_predictions.csv"),
      readCsv("worldcup_2026_1x2_probabilities.csv"),
      readCsv("worldcup_2026_final_stage_prediction_summary.csv"),
      readCsv("worldcup_2026_semifinals_prediction_summary.csv"),
      readCsv("worldcup_2026_quarterfinals_prediction_summary.csv"),
      readCsv("worldcup_2026_round16_prediction_summary.csv"),
      readCsv("worldcup_2026_round32_prediction_summary.csv"),
      readCsv("recency_weighting_scores.csv"),
    ]);

  return {
    modelScores: modelScores.map((row) => ({
      model: row.model,
      top_1_accuracy: toNumber(row.top_1_accuracy),
      top_3_accuracy: toNumber(row.top_3_accuracy),
      top_5_accuracy: toNumber(row.top_5_accuracy),
      exact_score_log_loss: toNumber(row.exact_score_log_loss),
      brier_1x2: toNumber(row.brier_1x2),
    })),
    tournament: tournament.map((row) => ({
      team: row.team,
      round_of_32_probability: toNumber(row.round_of_32_probability),
      round_of_16_probability: toNumber(row.round_of_16_probability),
      quarter_final_probability: toNumber(row.quarter_final_probability),
      semi_final_probability: toNumber(row.semi_final_probability),
      final_probability: toNumber(row.final_probability),
      champion_probability: toNumber(row.champion_probability),
    })),
    groups: groups.map((row) => ({
      group: row.group,
      team: row.team,
      group_winner_probability: toNumber(row.group_winner_probability),
      top_2_probability: toNumber(row.top_2_probability),
      avg_points: toNumber(row.avg_points),
    })),
    awards: awards.map((row) => ({
      award: row.award,
      rank: toNumber(row.rank),
      player: row.player,
      team: row.team,
      sub_position: row.sub_position,
      score: toNumber(row.score),
      recent_goals: toNumber(row.recent_goals),
      recent_assists: toNumber(row.recent_assists),
      expected_matches_proxy: toNumber(row.expected_matches_proxy),
    })),
    matches: buildMatches(topScores, oneXTwo),
    finalStage: finalStage.map(mapKnockoutPrediction),
    semifinals: semifinals.map(mapKnockoutPrediction),
    quarterfinals: quarterfinals.map(mapKnockoutPrediction),
    round16: round16.map(mapKnockoutPrediction),
    round32: round32.map(mapKnockoutPrediction),
    recencyScores: recencyScores.map((row) => ({
      split: row.split,
      model: row.model,
      selected_by_validation: row.selected_by_validation === "True",
      test_matches: toNumber(row.test_matches),
      top_1_accuracy: toNumber(row.top_1_accuracy),
      top_3_accuracy: toNumber(row.top_3_accuracy),
      top_5_accuracy: toNumber(row.top_5_accuracy),
      exact_score_log_loss: toNumber(row.exact_score_log_loss),
      brier_1x2: toNumber(row.brier_1x2),
    })),
  };
}

function mapKnockoutPrediction(row: Record<string, string>): KnockoutPrediction {
  return {
    date: row.date,
    home_team: row.home_team,
    away_team: row.away_team,
    status: row.status,
    actual_score_90: row.actual_score_90,
    home_win_probability: toNumber(row.home_win_probability),
    draw_probability: toNumber(row.draw_probability),
    away_win_probability: toNumber(row.away_win_probability),
    top_score: row.top_score,
    top_score_probability: toNumber(row.top_score_probability),
    favorite_to_advance: row.favorite_to_advance,
    advance_probability: toNumber(row.advance_probability),
    note: row.note,
  };
}

async function readCsv(filename: string): Promise<Record<string, string>[]> {
  const text = await readFile(path.join(DATA_DIR, filename), "utf8");
  const rows = parseCsv(text.trim());
  const [headers, ...body] = rows;
  return body.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);
  return rows.filter((cells) => cells.some((cell) => cell.length > 0));
}

function buildMatches(
  topScores: Record<string, string>[],
  oneXTwo: Record<string, string>[],
): GroupMatch[] {
  const probabilities = new Map(oneXTwo.map((row) => [row.match_id, row]));
  const byMatch = new Map<string, Record<string, string>[]>();
  for (const row of topScores) {
    const rows = byMatch.get(row.match_id) ?? [];
    rows.push(row);
    byMatch.set(row.match_id, rows);
  }

  return Array.from(byMatch.entries()).map(([matchId, rows]) => {
    const first = rows[0];
    const probs = probabilities.get(matchId);
    return {
      match_id: toNumber(matchId),
      date: first.date,
      group: first.group,
      home_team: first.home_team,
      away_team: first.away_team,
      ground: first.ground,
      home_win_probability: toNumber(probs?.home_win_probability),
      draw_probability: toNumber(probs?.draw_probability),
      away_win_probability: toNumber(probs?.away_win_probability),
      scores: rows
        .sort((a, b) => toNumber(a.rank) - toNumber(b.rank))
        .map((row) => ({
          exact_score: row.exact_score,
          probability: toNumber(row.probability),
          rank: toNumber(row.rank),
        })),
    };
  });
}

function toNumber(value: string | number | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
