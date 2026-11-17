// Builds data/trains.json from CP's official GTFS feed (Linha de Cascais, Carcavelos + Oeiras).
//
// Usage (run again when CP changes the timetable, the app warns when the data runs out):
//   curl -L -o /tmp/cp-gtfs.zip https://publico.cp.pt/gtfs/gtfs.zip
//   unzip -o /tmp/cp-gtfs.zip -d /tmp/cp-gtfs
//   node scripts/build-train-timetable.mjs /tmp/cp-gtfs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const feedDir = process.argv[2];
if (!feedDir) {
  console.error("Usage: node scripts/build-train-timetable.mjs <unzipped GTFS folder>");
  process.exit(1);
}

const STATIONS = {
  carcavelos: { stopId: "94_69187", name: "Carcavelos" },
  oeiras: { stopId: "94_69179", name: "Oeiras" },
};
const CAIS_DO_SODRE = "94_69005";

/** Minimal CSV reader (GTFS files are plain CSV with optional quotes). */
function readCsv(name) {
  const text = readFileSync(join(feedDir, name), "utf8").replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const split = (line) => {
    const out = [];
    let cur = "";
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
  });
}

const stops = Object.fromEntries(readCsv("stops.txt").map((s) => [s.stop_id, s]));
const trips = Object.fromEntries(readCsv("trips.txt").map((t) => [t.trip_id, t]));
const calendar = readCsv("calendar.txt");
const exceptions = readCsv("calendar_dates.txt");

const stopTimes = new Map();
for (const r of readCsv("stop_times.txt")) {
  if (!stopTimes.has(r.trip_id)) stopTimes.set(r.trip_id, []);
  stopTimes.get(r.trip_id).push(r);
}
for (const list of stopTimes.values()) list.sort((a, b) => a.stop_sequence - b.stop_sequence);

/** Prettier stop names: "Cais do Sodre" -> "Cais do Sodré". */
const PRETTY = { "Cais do Sodre": "Cais do Sodré", "Sao Pedro do Estoril": "São Pedro do Estoril" };
const stopName = (id) => PRETTY[stops[id]?.stop_name] ?? stops[id]?.stop_name ?? id;

// Only trips that stop at one of our stations matter.
const relevant = [...stopTimes.entries()].filter(([, list]) =>
  list.some(
    (r) => r.stop_id === STATIONS.carcavelos.stopId || r.stop_id === STATIONS.oeiras.stopId,
  ),
);

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
function activeServices(date) {
  const ymd = date.replaceAll("-", "");
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const on = new Set(
    calendar
      .filter((c) => c.start_date <= ymd && ymd <= c.end_date && c[weekday] === "1")
      .map((c) => c.service_id),
  );
  for (const e of exceptions) {
    if (e.date !== ymd) continue;
    if (e.exception_type === "1") on.add(e.service_id);
    else on.delete(e.service_id);
  }
  return on;
}

function dayFor(date) {
  const on = activeServices(date);
  const day = {};
  for (const [key, { stopId }] of Object.entries(STATIONS)) {
    const toLisbon = [];
    const toCascais = [];
    const toCampus = [];
    for (const [tripId, list] of relevant) {
      if (!on.has(trips[tripId]?.service_id)) continue;
      const i = list.findIndex((r) => r.stop_id === stopId);
      if (i === -1) continue;
      const end = list.at(-1);
      // Trains from Cais do Sodré that stop here: [departure in Cais do Sodré, arrival here].
      const lisbon = list.findIndex((r) => r.stop_id === CAIS_DO_SODRE);
      if (lisbon !== -1 && lisbon < i)
        toCampus.push([list[lisbon].departure_time.slice(0, 5), list[i].arrival_time.slice(0, 5)]);
      if (i === list.length - 1) continue; // ends here
      const dep = list[i].departure_time.slice(0, 5);
      if (end.stop_id === CAIS_DO_SODRE) toLisbon.push([dep, end.arrival_time.slice(0, 5)]);
      else toCascais.push([dep, stopName(end.stop_id)]);
    }
    const byTime = (a, b) => a[0].localeCompare(b[0]);
    day[key] = {
      toCampus: toCampus.sort(byTime),
      toLisbon: toLisbon.sort(byTime),
      toCascais: toCascais.sort(byTime),
    };
  }
  return day;
}

// Every date the feed covers, starting today.
const lastDate = calendar.reduce((max, c) => (c.end_date > max ? c.end_date : max), "");
const end = `${lastDate.slice(0, 4)}-${lastDate.slice(4, 6)}-${lastDate.slice(6, 8)}`;
const today = new Date().toISOString().slice(0, 10);

const patterns = [];
const patternIndex = new Map();
const days = {};
for (let d = today; d <= end;) {
  const day = dayFor(d);
  if (day.carcavelos.toLisbon.length > 0) {
    const key = JSON.stringify(day);
    if (!patternIndex.has(key)) {
      patternIndex.set(key, patterns.length);
      patterns.push(day);
    }
    days[d] = patternIndex.get(key);
  }
  const next = new Date(`${d}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  d = next.toISOString().slice(0, 10);
}

const timetable = {
  source: "CP – Comboios de Portugal, official GTFS feed (publico.cp.pt/gtfs)",
  fetched: today,
  stations: Object.fromEntries(
    Object.entries(STATIONS).map(([key, { stopId, name }]) => [
      key,
      { name, lat: Number(stops[stopId].stop_lat), lon: Number(stops[stopId].stop_lon) },
    ]),
  ),
  patterns,
  days,
};

const out = new URL("../data/trains.json", import.meta.url);
writeFileSync(out, JSON.stringify(timetable) + "\n");
console.log(
  `Wrote ${Object.keys(days).length} days (${patterns.length} different schedules) until ${end}.`,
);
