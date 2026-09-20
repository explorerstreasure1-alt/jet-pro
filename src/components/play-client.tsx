"use client";

import {
  LEAK_DAMAGE,
  MAX_HP,
  MISS_DAMAGE,
  SERIES_SIZE,
  SERIES_WAVES,
  WORDS_PER_WAVE,
  WAVES_ARCADE,
  heatBand,
  langMeta,
  padScore,
} from "@/lib/constants";
import { hintMask, nativePrompt, pickDistractors, pickWeighted, scoreForHit, shuffle } from "@/lib/game";
import {
  pauseMusic,
  resumeAudio,
  resumeMusic,
  sfxCoin,
  sfxCombo,
  sfxFreeze,
  sfxHit,
  sfxLaser,
  sfxLose,
  sfxLowHp,
  sfxMilestone,
  sfxMiss,
  sfxShield,
  sfxWin,
  startMusic,
  stopMusic,
} from "@/lib/audio";
import {
  canListen,
  canSpeak,
  listenOnce,
  primeSpeech,
  speakTerm,
  speechMatches,
  stopSpeaking,
} from "@/lib/speech";
import type { Category, GameMode, Invader, LangCode, Level, WordCard } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Starfield } from "./starfield";
import { useApp } from "./providers";
import {
  AlienSprite,
  IconBolt,
  IconDot,
  IconEye,
  IconHint,
  IconListen,
  IconMic,
  IconPause,
  IconRepeat,
  IconSlow,
  ShipSprite,
} from "./sprites";

type Phase = "boot" | "play" | "paused" | "wave" | "over" | "win";

type RoundResult = { wordId: number; correct: boolean };

type Point = { x: number; y: number };

type Shot = {
  id: number;
  from: Point;
  to: Point;
  angle: number;
  good: boolean;
  lane: number;
  fired: boolean;
};

type Boom = { x: number; y: number; good: boolean; id: number };

/** Single source of truth for lane geometry (percent of arena width). */
const LANE_W = 100 / 3;
const laneCenter = (lane: number) => lane * LANE_W + LANE_W / 2;

export function PlayClient() {
  const params = useSearchParams();
  const { profile, tt, ui, reload } = useApp();
  const lang = (params.get("lang") || profile?.learningLang || "en") as LangCode;
  const level = (params.get("level") || profile?.cefrLevel || "A1") as Level;
  const category = (params.get("category") || profile?.category || "all") as Category;
  const mode = (params.get("mode") || "arcade") as GameMode;
  const seriesId = params.get("seriesId") || undefined;
  const native = (profile?.nativeLang === "en" ? "en" : "tr") as "tr" | "en";
  const reduce = Boolean(profile?.settings?.reducedMotion);
  const voiceRate = profile?.settings?.voiceRate ?? 0.92;
  const ship = profile?.equippedShip ?? "viper";

  const totalWaves =
    mode === "series" ? Number(params.get("seriesWaves") ?? SERIES_WAVES) : mode === "daily" ? 2 : WAVES_ARCADE;
  const perWave = WORDS_PER_WAVE;
  const asrOn = profile?.settings.asr !== false;

  const [pool, setPool] = useState<WordCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>("boot");
  const [lane, setLane] = useState(1);
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [progress, setProgress] = useState(0);
  const [invaders, setInvaders] = useState<Invader[]>([]);
  const [target, setTarget] = useState<WordCard | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [toast, setToast] = useState("");
  const [shot, setShot] = useState<Shot | null>(null);
  const [boom, setBoom] = useState<Boom | null>(null);
  const [shake, setShake] = useState(false);
  const [peek, setPeek] = useState(false);
  const [hintText, setHintText] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [shield, setShield] = useState(false);
  const [freezeQty, setFreezeQty] = useState(0);
  const [hintQty, setHintQty] = useState(0);
  const [shieldQty, setShieldQty] = useState(0);
  const [doubleScore, setDoubleScore] = useState(false);
  const [resolving, setResolving] = useState(false);
  const resolvingRef = useRef(false);
  const [report, setReport] = useState<{ xp: number; credits: number; unlocked: string[]; record: boolean } | null>(
    null,
  );

  const usedRef = useRef<Set<number>>(new Set());
  const resultsRef = useRef<RoundResult[]>([]);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const startRef = useRef(Date.now());
  const hpRef = useRef(MAX_HP);
  const comboRef = useRef(0);
  const phaseRef = useRef<Phase>("boot");
  const roundRef = useRef(0);
  const invadersRef = useRef<Invader[]>([]);
  const targetRef = useRef<WordCard | null>(null);
  const laneRef = useRef(1);
  const frozenRef = useRef(false);
  const shieldRef = useRef(false);
  const doubleRef = useRef(false);
  const endedRef = useRef(false);
  const waveHitsRef = useRef(0);
  const waveDmgRef = useRef(0);
  const poolRef = useRef<WordCard[]>([]);
  const waveRef = useRef(1);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<LangCode>(lang);
  const voiceRateRef = useRef(voiceRate);
  const autoSpeakRef = useRef(true);
  const speakInRef = useRef<"target" | "native">("target");
  const nativeRef = useRef<"tr" | "en">("tr");
  const noseRef = useRef<HTMLSpanElement | null>(null);
  const coreRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const shotRafRef = useRef<number | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    invadersRef.current = invaders;
  }, [invaders]);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);
  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    resolvingRef.current = resolving;
  }, [resolving]);
  useEffect(() => {
    frozenRef.current = frozen;
  }, [frozen]);
  useEffect(() => {
    shieldRef.current = shield;
  }, [shield]);
  useEffect(() => {
    doubleRef.current = doubleScore;
  }, [doubleScore]);
  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);
  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  useEffect(() => {
    langRef.current = lang;
    voiceRateRef.current = voiceRate;
    autoSpeakRef.current = profile?.settings.autoSpeak !== false;
    speakInRef.current = profile?.settings.speakIn ?? "target";
    nativeRef.current = native;
  }, [lang, voiceRate, profile, native]);

  // Combat music: starts with the game, ducks on pause, stops on leave.
  useEffect(() => {
    startMusic("combat");
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (phase === "paused") pauseMusic();
    else resumeMusic();
  }, [phase]);

  useEffect(() => {
    primeSpeech();
    return () => {
      stopSpeaking();
      if (shotRafRef.current !== null) cancelAnimationFrame(shotRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const qty = (code: string) => profile.inventory.find((i) => i.itemCode === code)?.qty ?? 0;
    setFreezeQty(qty("freeze"));
    setHintQty(qty("hint"));
    setShieldQty(qty("shield"));
    setDoubleScore(qty("double") > 0);
  }, [profile]);

  useEffect(() => {
    let live = true;
    setLoaded(false);

    const loadWords = async (cat: string, lvl: string): Promise<WordCard[]> => {
      const qs = new URLSearchParams({
        language: lang,
        level: lvl,
        category: cat,
        profileId: String(profile?.id ?? ""),
      });
      const res = await fetch(`/api/words?${qs.toString()}`);
      const data = (await res.json()) as WordCard[] | { error?: string };
      return Array.isArray(data) ? data : [];
    };

    (async () => {
      try {
        let list: WordCard[] = [];
        if (mode === "series" && seriesId) {
          // 150-word block: s-{lang}-{n} -> offset (n-1)*150
          const n = Number(seriesId.split("-").pop() ?? 0);
          const qs = new URLSearchParams({
            language: lang,
            offset: String(Math.max(0, (n - 1) * SERIES_SIZE)),
            limit: String(SERIES_SIZE),
            profileId: String(profile?.id ?? ""),
          });
          const res = await fetch(`/api/words?${qs.toString()}`);
          const data = (await res.json()) as WordCard[];
          list = Array.isArray(data) ? data : [];
          if (list.length < 3) {
            list = (await loadWords("all", "all")) as WordCard[];
          }
        } else {
          list = await loadWords(category, level);
          if (list.length < 3) list = await loadWords("all", level);
          if (list.length < 3) list = await loadWords(category, "all");
          if (list.length < 3) list = await loadWords("all", "all");
        }
        if (live) setPool(list);
      } catch {
        if (live) setPool([]);
      } finally {
        if (live) setLoaded(true);
      }
    })();

    return () => {
      live = false;
    };
  }, [lang, level, category, profile?.id, mode, seriesId]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 900);
  };

  const consume = useCallback(
    async (code: string) => {
      if (!profile) return;
      await fetch("/api/shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, itemCode: code, delta: -1 }),
      });
    },
    [profile],
  );

  const damage = useCallback((amt: number) => {
    if (shieldRef.current) {
      shieldRef.current = false;
      setShield(false);
      flash("◈");
      return;
    }
    waveDmgRef.current += amt;
    const prev = hpRef.current;
    const next = Math.max(0, hpRef.current - amt);
    hpRef.current = next;
    setHp(next);
    if (prev > 30 && next <= 30) sfxLowHp();
    setShake(true);
    window.setTimeout(() => setShake(false), 280);
    if (next <= 0) {
      setPhase("over");
      sfxLose();
    }
  }, []);

  const spawnRound = useCallback(
    (words: WordCard[], waveNo: number) => {
      if (words.length < 3) return;
      const targetWord = pickWeighted(words, usedRef.current);
      usedRef.current.add(targetWord.id);
      const distractors = pickDistractors(words, targetWord, 2);
      const cards = shuffle([targetWord, ...distractors]).slice(0, 3);
      while (cards.length < 3) cards.push(words[cards.length % words.length]!);
      const nextInv: Invader[] = cards.map((w, i) => {
        // Three speed tiers: fast invades quickly, slow drifts down slowly.
        const roll = Math.random();
        const fastChance = 0.18 + waveNo * 0.02;
        const speed: Invader["speed"] =
          roll < fastChance ? "fast" : roll < fastChance + 0.46 ? "normal" : "slow";
        return {
          lane: i,
          word: w,
          y: 0,
          speed,
          hp: 1,
          isCorrect: w.id === targetWord.id,
        };
      });
      roundRef.current += 1;
      setRoundKey(roundRef.current);
      setTarget(targetWord);
      setInvaders(nextInv);
      setHintText("");
      setBoom(null);
      setShot(null);
      coreRefs.current = {};
      resolvingRef.current = false;
      setResolving(false);

      // Early pronunciation: read the target aloud almost instantly after
      // the wave appears so the player hears the word BEFORE shooting.
      const spokenRound = roundRef.current;
      window.setTimeout(() => {
        if (roundRef.current !== spokenRound || phaseRef.current !== "play") return;
        if (!autoSpeakRef.current) return;
        const nativeLang =
          nativeRef.current === "en" && langRef.current === "en" ? "tr" : nativeRef.current;
        if (speakInRef.current === "native") {
          void speakTerm(nativePrompt(targetWord, nativeLang), nativeLang, voiceRateRef.current);
        } else {
          void speakTerm(targetWord.term, langRef.current, voiceRateRef.current);
        }
      }, 130);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "boot") return;
    if (!pool.length || !profile) return;
    startRef.current = Date.now();
    usedRef.current = new Set();
    resultsRef.current = [];
    correctRef.current = 0;
    wrongRef.current = 0;
    endedRef.current = false;
    waveHitsRef.current = 0;
    setPhase("play");
    spawnRound(pool, 1);
  }, [phase, pool, profile, spawnRound]);

  const selected = invaders.find((i) => i.lane === lane) ?? invaders[1];
  const heat = heatBand(target?.heat ?? 0);
  const heatLabel = heat === "fire" ? tt("fireHeat") : heat === "warm" ? tt("warm") : tt("ice");

  const finish = useCallback(
    async (won: boolean) => {
      if (endedRef.current || !profile) return;
      endedRef.current = true;
      if (resultsRef.current.length) {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id, results: resultsRef.current }),
        });
      }
      if (doubleRef.current) await consume("double");
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          language: lang,
          level,
          category,
          mode,
          seriesId,
          score,
          wavesCompleted: won ? totalWaves : Math.max(0, wave - 1),
          maxCombo,
          wordsCorrect: correctRef.current,
          wordsWrong: wrongRef.current,
          livesLeft: hpRef.current,
          durationMs: Date.now() - startRef.current,
          won,
        }),
      });
      const data = (await res.json()) as {
        xpGain?: number;
        creditGain?: number;
        unlocked?: string[];
        newRecord?: boolean;
      };
      setReport({
        xp: data.xpGain ?? 0,
        credits: data.creditGain ?? 0,
        unlocked: data.unlocked ?? [],
        record: Boolean(data.newRecord),
      });
      if (won) sfxCoin();
      await reload();
    },
    [profile, lang, level, category, mode, seriesId, score, totalWaves, wave, maxCombo, reload, consume],
  );

  useEffect(() => {
    if (phase === "over" || phase === "win") void finish(phase === "win");
  }, [phase, finish]);

  const nextAfterHit = useCallback(() => {
    const hits = waveHitsRef.current + 1;
    waveHitsRef.current = hits;
    setProgress(hits);
    if (hits >= perWave) {
      if (waveRef.current >= totalWaves) {
        setPhase("win");
        sfxWin();
        return;
      }
      setPhase("wave");
      return;
    }
    spawnRound(poolRef.current, waveRef.current);
  }, [perWave, totalWaves, spawnRound]);

  const landShot = useCallback(
    (inv: Invader, tgt: WordCard, hitLane: number, impact: Point) => {
      if (shotRafRef.current !== null) {
        cancelAnimationFrame(shotRafRef.current);
        shotRafRef.current = null;
      }
      const good = inv.isCorrect;
      resultsRef.current.push({ wordId: tgt.id, correct: good });
      setShot(null);
      setBoom({ id: Date.now(), x: impact.x, y: impact.y, good });
      if (good) {
        sfxHit();
        const c = comboRef.current + 1;
        comboRef.current = c;
        setCombo(c);
        setMaxCombo((m) => Math.max(m, c));
        sfxCombo(c);
        const pts = scoreForHit(c, level, inv.speed, doubleRef.current);
        setScore((s) => s + pts);
        if (c % 5 === 0) sfxMilestone();
        correctRef.current += 1;
        flash(tt("correct"));
        setInvaders((list) => list.filter((x) => x.lane !== hitLane));
        window.setTimeout(() => {
          setBoom(null);
          nextAfterHit();
        }, reduce ? 140 : 460);
      } else {
        sfxMiss();
        comboRef.current = 0;
        setCombo(0);
        wrongRef.current += 1;
        flash(tt("miss"));
        damage(MISS_DAMAGE);
        window.setTimeout(() => {
          setBoom(null);
          if (hpRef.current > 0) {
            resolvingRef.current = false;
            setResolving(false);
          }
        }, 300);
      }
    },
    [level, nextAfterHit, reduce, damage, tt],
  );

  /** Live position of a lane's invader core, relative to the arena box. */
  const readPoint = useCallback((el: HTMLElement | null): Point | null => {
    const arena = arenaRef.current;
    if (!arena || !el) return null;
    const ar = arena.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return {
      x: r.left + r.width / 2 - ar.left,
      y: r.top + r.height / 2 - ar.top,
    };
  }, []);

  const resolveShot = useCallback(
    (hitLane: number) => {
      if (resolvingRef.current || phaseRef.current !== "play") return;
      const inv = invadersRef.current.find((i) => i.lane === hitLane);
      const tgt = targetRef.current;
      const start = readPoint(noseRef.current);
      const firstAim = readPoint(coreRefs.current[hitLane] ?? null);
      if (!inv || !tgt || !start || !firstAim) return;
      resolvingRef.current = true;
      setResolving(true);
      sfxLaser();

      const id = Date.now();
      let pos: Point = { ...start };
      let aim: Point = { ...firstAim };
      let angle = (Math.atan2(aim.x - pos.x, pos.y - aim.y) * 180) / Math.PI;
      setShot({ id, from: start, to: pos, angle, good: inv.isCorrect, lane: hitLane, fired: true });

      if (reduce) {
        const impact = readPoint(coreRefs.current[hitLane] ?? null) ?? aim;
        window.setTimeout(() => landShot(inv, tgt, hitLane, impact), 90);
        return;
      }

      // Guided projectile: re-reads the invader position every frame so a
      // falling or frozen target is always struck dead centre.
      const speed = 1.75; // px per millisecond
      let last = performance.now();
      const step = (now: number) => {
        if (phaseRef.current === "over") {
          setShot(null);
          return;
        }
        const dt = Math.min(48, now - last);
        last = now;

        const live = readPoint(coreRefs.current[hitLane] ?? null);
        if (live) aim = live;

        const dx = aim.x - pos.x;
        const dy = aim.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const travel = speed * dt;

        if (dist <= Math.max(travel, 14)) {
          pos = { ...aim };
          setShot(null);
          landShot(inv, tgt, hitLane, aim);
          return;
        }

        pos = { x: pos.x + (dx / dist) * travel, y: pos.y + (dy / dist) * travel };
        angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
        setShot({ id, from: start, to: { ...pos }, angle, good: inv.isCorrect, lane: hitLane, fired: true });
        shotRafRef.current = requestAnimationFrame(step);
      };
      shotRafRef.current = requestAnimationFrame(step);
    },
    [landShot, reduce, readPoint],
  );

    const onLeak = (leakedLane: number) => {
    if (phaseRef.current !== "play" || resolvingRef.current) return;
    const inv = invadersRef.current.find((i) => i.lane === leakedLane);
    const tgt = targetRef.current;
    if (!inv || !tgt) return;
    if (inv.isCorrect) {
      resultsRef.current.push({ wordId: tgt.id, correct: false });
      wrongRef.current += 1;
      comboRef.current = 0;
      setCombo(0);
      flash(tt("leaked"));
      damage(LEAK_DAMAGE);
      if (hpRef.current > 0) {
        usedRef.current.delete(tgt.id);
        spawnRound(poolRef.current, waveRef.current);
      }
    } else {
      setInvaders((list) => list.filter((x) => x.lane !== leakedLane));
    }
  };

  const fire = () => {
    void resumeAudio();
    primeSpeech();
    resolveShot(laneRef.current);
  };

  /** One-tap combat: aim the ship at a lane and fire in the same gesture. */
  const fireAt = (laneIndex: number) => {
    if (phaseRef.current !== "play" || resolvingRef.current) return;
    void resumeAudio();
    primeSpeech();
    setLane(laneIndex);
    laneRef.current = laneIndex;
    resolveShot(laneIndex);
  };

  /** Tap anywhere in the arena: the horizontal position picks the lane. */
  const onArenaTap = (e: MouseEvent<HTMLDivElement>) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const laneIndex = Math.max(0, Math.min(2, Math.floor(ratio * 3)));
    fireAt(laneIndex);
  };

  const shiftLane = (dir: -1 | 1) => {
    if (phaseRef.current !== "play" || resolvingRef.current) return;
    setLane((l) => Math.max(0, Math.min(2, l + dir)));
  };

  const say = useCallback(
    async (text: string, voiceLang: string) => {
      if (!canSpeak()) {
        flash(tt("noVoice"));
        return;
      }
      primeSpeech();
      setSpeaking(true);
      const ok = await speakTerm(text, voiceLang, voiceRate);
      setSpeaking(false);
      if (!ok) flash(tt("noVoice"));
    },
    [voiceRate, tt],
  );

  const listen = () => {
    const w = invadersRef.current.find((i) => i.lane === laneRef.current)?.word;
    if (!w) return;
    void say(w.term, lang);
  };

  const promptLang = native === "en" && lang === "en" ? "tr" : native;

  const repeatTarget = () => {
    const tgt = targetRef.current;
    if (!tgt) return;
    void say(nativePrompt(tgt, promptLang), promptLang);
  };

  const applyHint = async () => {
    const tgt = targetRef.current;
    if (!tgt) return;
    if (hintQty <= 0) {
      flash(tt("hintNeed"));
      return;
    }
    setHintQty((n) => n - 1);
    setHintText(hintMask(tgt.term));
    const correctLane = invadersRef.current.find((i) => i.isCorrect)?.lane ?? 1;
    setLane(correctLane);
    await consume("hint");
  };

  const activateFreeze = async () => {
    if (frozenRef.current) return;
    if (freezeQty <= 0) {
      flash(tt("freezeNeed"));
      return;
    }
    sfxFreeze();
    setFreezeQty((n) => n - 1);
    setFrozen(true);
    await consume("freeze");
    window.setTimeout(() => setFrozen(false), 5000);
  };

  const activateShield = async () => {
    if (shieldQty <= 0 || shieldRef.current) return;
    sfxShield();
    setShieldQty((n) => n - 1);
    setShield(true);
    await consume("shield");
  };

  const speak = async () => {
    if (!asrOn) {
      flash(tt("micOff"));
      return;
    }
    if (!canListen()) {
      flash(tt("noMic"));
      return;
    }
    const tgt = targetRef.current;
    if (!tgt) return;
    setListening(true);
    try {
      const said = await listenOnce(lang);
      if (speechMatches(said, tgt.term)) {
        const correctLane = invadersRef.current.find((i) => i.isCorrect)?.lane ?? laneRef.current;
        setLane(correctLane);
        laneRef.current = correctLane;
        resolveShot(correctLane);
      } else {
        flash(`${tt("heard")}: "${said.slice(0, 24)}"`);
        damage(Math.round(MISS_DAMAGE * 0.6));
      }
    } catch {
      flash(tt("noSpeech"));
    } finally {
      setListening(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === "paused") {
        if (e.key === "Escape" || e.key === "p") setPhase("play");
        return;
      }
      if (phaseRef.current !== "play") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        shiftLane(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        shiftLane(1);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        fire();
      } else if (e.key === "l" || e.key === "L") listen();
      else if (e.key === "h" || e.key === "H") void applyHint();
      else if (e.key === "f" || e.key === "F") void activateFreeze();
      else if (e.key === "s" || e.key === "S") void speak();
      else if (e.key === "p" || e.key === "Escape") setPhase("paused");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lane, hintQty, freezeQty, frozen, listening]);

  const promptWord = target
    ? nativePrompt(target, native === "en" && lang === "en" ? "tr" : native)
    : "—";
  const crystals = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => hp > i * (MAX_HP / 7));
  }, [hp]);

  const durationFor = (inv: Invader) => {
    const base = Math.max(5.8, 13.2 - wave * 0.9);
    if (inv.speed === "fast") return base * 0.55;
    if (inv.speed === "slow") return base * 1.55;
    return base;
  };

  const continueWave = () => {
    const nextWave = waveRef.current + 1;
    waveHitsRef.current = 0;
    waveDmgRef.current = 0;
    waveRef.current = nextWave;
    setProgress(0);
    setWave(nextWave);
    setPhase("play");
    spawnRound(poolRef.current, nextWave);
  };

  const meta = langMeta(lang);
  const overlay = phase === "paused" || phase === "wave" || phase === "over" || phase === "win";

  if (!profile || !loaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#050814] text-cyan-200">
        <p className="font-display tracking-[0.3em]">{tt("loading")}</p>
      </div>
    );
  }

  if (pool.length < 3) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#050814] px-6 text-center">
        <div className="holo rounded-2xl p-6">
          <p className="text-cyan-100">{tt("emptyLexicon")}</p>
          <Link href="/" className="mt-4 inline-block text-cyan-300">
            {tt("toCommand")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-dvh overflow-hidden bg-[#050814] ${shake ? "shake" : ""}`}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url(/images/nebula.jpg)" }}
      />
      <Starfield n={36} />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[460px] flex-col px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(8px,env(safe-area-inset-top))]">
        <header className="grid grid-cols-[minmax(82px,1fr)_auto_minmax(106px,1.15fr)_auto] items-center gap-1.5">
          <div className="holo rounded-xl px-2 py-1.5">
            <div className="flex items-center justify-between text-[8px] tracking-[0.14em] text-white/45">
              <span>{tt("score")}</span>
              <span>SV.{profile.xp}</span>
            </div>
            <p className="font-digital digital text-lg leading-tight text-cyan-100">{padScore(score)}</p>
            <div className="mt-1 h-1 overflow-hidden rounded bg-white/10">
              <div className="h-full bg-cyan-400/80" style={{ width: `${Math.min(100, (combo / 10) * 100)}%` }} />
            </div>
          </div>
          <div className="holo grid h-11 w-10 place-items-center rounded-xl">
            <p className="font-display text-sm leading-none text-cyan-100">{level}</p>
            <p className="text-[8px] tracking-widest text-white/50">{lang.toUpperCase()}</p>
          </div>
          <div className="holo rounded-xl px-2 py-1.5">
            <div className="flex items-center justify-between text-[8px] tracking-[0.14em] text-white/45">
              <span>{tt("lives")}</span>
              <span>{hp}</span>
            </div>
            <div className="mt-1 flex gap-[1px] overflow-hidden">
              {crystals.map((on, i) => (
                <span key={i} className={`crystal shrink-0 ${on ? "" : "dim"}`} />
              ))}
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded bg-white/10">
              <div className="h-full bg-emerald-400" style={{ width: `${hp}%` }} />
            </div>
          </div>
          <div className="flex gap-1.5">
              <button type="button" className="btn-icon h-9 w-9 text-amber-400" onClick={repeatTarget} aria-label={tt("repeat")}>
              <IconRepeat />
            </button>
            <button
              type="button"
              className="btn-icon h-9 w-9"
              onClick={() => setPhase(phase === "paused" ? "play" : "paused")}
              aria-label={tt("pause")}
            >
              <IconPause />
            </button>
            <button
              type="button"
              className={`btn-icon h-9 w-9 ${peek ? "text-cyan-300" : ""}`}
              onClick={() => setPeek((v) => !v)}
              aria-label={tt("peek")}
            >
              <IconEye />
            </button>
          </div>
        </header>

        <div className="holo mt-2 flex items-center gap-3 rounded-xl px-3 py-1.5">
          <p className="text-[10px] tracking-[0.22em] text-white/45">
            {tt("wave")} {wave} · {progress}/{perWave}
          </p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
              style={{ width: `${(progress / perWave) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => void activateFreeze()}
            className={`font-display text-[10px] tracking-[0.2em] ${frozen ? "text-cyan-200" : "text-white/50"}`}
          >
            {frozen ? tt("freezeActive") : heatLabel} ·❄{freezeQty}
          </button>
        </div>

        <div className="holo target-pulse mt-2 flex items-center rounded-xl px-3 py-2">
          <span className="shrink-0 text-[10px] tracking-[0.28em] text-white/40">{tt("target")}</span>
          <p className="glow-cyan mx-2 min-w-0 flex-1 truncate text-center font-display text-2xl tracking-wide text-cyan-100">
            {promptWord}
          </p>
        </div>
        <div className="flex justify-center text-lg leading-none text-cyan-300">▾</div>

        <div
          ref={arenaRef}
          data-arena=""
          onClick={onArenaTap}
          className="relative min-h-[285px] flex-1 cursor-crosshair overflow-hidden rounded-[28px]"
        >
          <div className="arena-grid pointer-events-none absolute inset-0 rounded-[28px]" />
          <div className="radar-sweep pointer-events-none absolute left-1/2 top-[44%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50" />
          <div className="pointer-events-none absolute inset-x-1 top-2 bottom-[18%] rounded-[24px] border border-cyan-200/10" />
          <div
            className="pointer-events-none absolute bottom-[18%] left-0 right-0 border-t border-dashed border-fuchsia-400/40"
            style={{ top: "auto" }}
          />
          <div
            data-beam=""
            className="lane-beam pointer-events-none absolute bottom-0 top-0 rounded-[22px] transition-all duration-200"
            style={{ left: `${lane * LANE_W}%`, width: `${LANE_W}%` }}
          />
          <div
            className="pointer-events-none absolute bottom-[14%] top-4 w-px border-l border-dashed border-cyan-200/40 transition-all duration-200"
            style={{ left: `${laneCenter(lane)}%` }}
          />

          {/* Each invader is positioned with the exact same lane math as the
              beam, crosshair and ship, so lanes can never drift or clip. */}
          {[0, 1, 2].map((laneIndex) => {
            const inv = invaders.find((i) => i.lane === laneIndex);
            const selectedLane = laneIndex === lane;
            if (!inv) return null;
            return (
              <div
                key={laneIndex}
                className="pointer-events-none absolute bottom-0 top-0"
                style={{ left: `${laneIndex * LANE_W}%`, width: `${LANE_W}%` }}
              >
                    <button
                      type="button"
                      key={`${roundKey}-${laneIndex}-${inv.word.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        fireAt(laneIndex);
                      }}
                      data-invader={laneIndex}
                      {...(inv.isCorrect ? { "data-correct-lane": laneIndex } : {})}
                      className={`falling pointer-events-auto absolute inset-x-0 px-1.5 ${selectedLane ? "z-20" : "z-10 opacity-85"}`}
                      style={{
                        top: reduce ? "16%" : "0%",
                        animation: reduce ? "none" : `fallY ${durationFor(inv)}s linear forwards`,
                        animationPlayState: frozen ? "paused" : "running",
                        ["--fall-to" as string]: "48vh",
                      }}
                      onAnimationEnd={() => {
                        if (roundRef.current === roundKey) onLeak(laneIndex);
                      }}
                    >
                      <div className="relative mx-auto h-12 w-16">
                        <span
                          ref={(el) => {
                            coreRefs.current[laneIndex] = el;
                          }}
                          data-core={laneIndex}
                          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        />
                        <AlienSprite
                          className="h-full w-full"
                          tint={selectedLane ? "#c8fff4" : "#62e0b8"}
                        />
                      </div>
                      <span
                        data-chip=""
                        data-speed={inv.speed}
                        className={`mx-auto mt-0.5 flex w-fit items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] tracking-widest ${
                          inv.speed === "fast"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : inv.speed === "slow"
                              ? "bg-amber-300/15 text-amber-200"
                              : "bg-cyan-300/10 text-cyan-200"
                        }`}
                      >
                        {inv.speed === "fast" ? (
                          <IconBolt />
                        ) : inv.speed === "slow" ? (
                          <IconSlow />
                        ) : (
                          <IconDot />
                        )}
                        {inv.speed === "fast" ? tt("fast") : inv.speed === "slow" ? tt("slow") : tt("normal")}
                      </span>
                      <div
                        className={`mt-1 rounded-xl border px-1.5 py-1.5 shadow-lg backdrop-blur-sm ${
                          selectedLane ? "holo-strong" : "holo"
                        }`}
                      >
                        <p className="text-center text-[8px] tracking-[0.2em] text-cyan-200/70">
                          ★{" "}
                          {inv.word.heat < 15
                            ? tt("neu")
                            : heatBand(inv.word.heat) === "fire"
                              ? tt("fireHeat")
                              : tt("warm")}
                        </p>
                        <p
                          className={`text-center leading-tight hyphens-auto [overflow-wrap:anywhere] ${
                            selectedLane ? "text-sm text-cyan-50" : "text-xs text-white/90"
                          }`}
                        >
                          {inv.word.term}
                        </p>
                        {peek && (
                          <p className="mt-1 text-center text-[9px] leading-tight text-white/45 [overflow-wrap:anywhere]">
                            {native === "en" ? inv.word.translationEn : inv.word.translationTr}
                          </p>
                        )}
                       </div>
                    </button>
              </div>
            );
          })}

          {shot && (
            <>
              <div
                className="pointer-events-none absolute z-30 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: shot.from.x,
                  top: shot.from.y,
                  background: "radial-gradient(circle, rgba(125,255,240,0.75), transparent 70%)",
                  animation: "boom 0.22s ease-out",
                }}
              />
              <div
                className="pointer-events-none absolute z-40 will-change-transform"
                style={{
                  left: 0,
                  top: 0,
                  transform: `translate3d(${shot.to.x}px, ${shot.to.y}px, 0) translate(-50%, -50%) rotate(${shot.angle}deg)`,
                }}
              >
                <div
                  className="absolute left-1/2 top-0 h-14 w-[3px] -translate-x-1/2 -translate-y-full rounded-full blur-[1px]"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(125,255,240,0.95), rgba(125,255,240,0.25), transparent)",
                  }}
                />
                <div
                  className="h-3.5 w-3.5 rounded-full"
                  style={{
                    background: shot.good ? "#eafffb" : "#ffe3f4",
                    boxShadow: shot.good
                      ? "0 0 10px #7dfff0, 0 0 22px #37e6cf"
                      : "0 0 10px #ff6fc9, 0 0 22px #ff3fa4",
                  }}
                />
              </div>
            </>
          )}
          {boom && (
            <div
              className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
              style={{ left: boom.x, top: boom.y }}
            >
              <div
                className="h-16 w-16 rounded-full border-2"
                style={{
                  borderColor: boom.good ? "#7dfff0" : "#ff6fc9",
                  boxShadow: boom.good
                    ? "0 0 20px rgba(125,255,240,0.65), inset 0 0 18px rgba(125,255,240,0.35)"
                    : "0 0 20px rgba(255,111,201,0.65), inset 0 0 18px rgba(255,111,201,0.35)",
                  animation: "boom 0.45s ease-out",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: boom.good ? "#eafffb" : "#ffe3f4",
                  boxShadow: boom.good ? "0 0 16px #7dfff0" : "0 0 16px #ff6fc9",
                }}
              />
            </div>
          )}

          <div
            data-ship=""
            className="bob pointer-events-none absolute bottom-0 z-20 w-16 -translate-x-1/2 transition-all duration-150"
            style={{ left: `${laneCenter(lane)}%` }}
          >
            <span
              ref={noseRef}
              className="absolute left-1/2 top-1 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-100 shadow-[0_0_10px_#7dfff0]"
            />
            <div className="absolute bottom-2 left-1/2 h-5 w-10 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-md" />
            <ShipSprite
              className="relative h-16 w-16 drop-shadow-[0_0_16px_rgba(125,255,240,0.7)]"
              variant={ship}
            />
          </div>
        </div>

        {hintText && (
          <p className="mb-1 text-center font-digital text-sm tracking-[0.2em] text-amber-200">{hintText}</p>
        )}
        {combo >= 2 && (
          <p className="mb-1 text-center font-display text-xs tracking-[0.3em] text-fuchsia-300">
            {tt("combo")} x{combo}
          </p>
        )}

        <div className="mt-1 flex items-stretch gap-2">
          <div className="holo-strong min-w-0 flex-1 rounded-2xl px-3 py-2">
            <p className="text-[9px] tracking-[0.28em] text-cyan-200/70">{tt("shootThis")}</p>
            <p className="truncate text-lg text-cyan-50">{selected?.word.term ?? "—"}</p>
          </div>
          <ActionBtn
            label={speaking ? tt("speaking") : tt("listen")}
            onClick={listen}
            icon={<IconListen />}
            hot={speaking}
          />
          <ActionBtn label={tt("hint")} onClick={() => void applyHint()} icon={<IconHint />} badge={hintQty} />
          <ActionBtn
            label={listening ? tt("listening") : tt("speak")}
            onClick={() => void speak()}
            icon={<IconMic />}
            hot={listening}
            dim={!asrOn}
          />
        </div>

        <div className="mt-2 flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => shiftLane(-1)}
            className="holo w-[72px] rounded-2xl font-display text-[11px] tracking-[0.25em] text-white/70"
          >
            {tt("lane")}
          </button>
          <button
            type="button"
            onClick={fire}
            disabled={resolving || phase !== "play"}
            className="holo-strong flex-1 rounded-2xl py-4 font-display text-2xl tracking-[0.4em] text-cyan-50"
          >
            {tt("fire")}
            <span className="mt-1 block text-[10px] tracking-[0.22em] text-cyan-200/70">✓ {tt("targetLocked")}</span>
          </button>
          <button
            type="button"
            onClick={() => shiftLane(1)}
            className="holo w-[72px] rounded-2xl font-display text-[11px] tracking-[0.25em] text-white/70"
          >
            {tt("lane")}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 px-1 pb-1 text-[10px] text-white/35">
          <button type="button" onClick={() => void activateShield()}>
            {shield ? tt("shieldActive") : `◈ ${shieldQty}`}
          </button>
          <span>
            {meta.flag} {ui === "en" ? meta.nameEn : meta.nameTr}
          </span>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-full border border-cyan-300/40 bg-black/70 px-4 py-1 font-display text-xs tracking-[0.28em] text-cyan-100">
          {toast}
        </div>
      )}

      {overlay && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 px-5">
          <div className="holo w-full max-w-sm rounded-3xl p-6 text-center">
            {phase === "paused" && (
              <>
                <h2 className="font-display tracking-[0.3em] text-cyan-100">{tt("pause")}</h2>
                <button type="button" className="holo-strong mt-5 w-full rounded-xl py-3" onClick={() => setPhase("play")}>
                  {tt("resume")}
                </button>
                <Link href="/" className="mt-3 block text-sm text-white/50">
                  {tt("toCommand")}
                </Link>
              </>
            )}
            {phase === "wave" && (
              <>
                <h2 className="font-display tracking-[0.3em] text-cyan-100">{tt("waveClear")}</h2>
                <p className="mt-2 text-white/60">
                  {tt("wave")} {wave}/{totalWaves}
                </p>
                <button type="button" className="holo-strong mt-5 w-full rounded-xl py-3" onClick={continueWave}>
                  {tt("nextWave")}
                </button>
              </>
            )}
            {(phase === "over" || phase === "win") && (
              <>
                <p className="font-display text-[10px] tracking-[0.3em] text-white/40">{tt("resultTitle")}</p>
                <h2 className="font-display mt-2 tracking-[0.28em] text-cyan-100">
                  {phase === "win" ? tt("victory") : tt("gameOver")}
                </h2>
                {report?.record && <p className="mt-2 text-amber-300">{tt("newRecord")}</p>}
                <p className="font-digital mt-4 text-4xl text-cyan-100">{padScore(score)}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Stat label={tt("wordsHit")} value={`${correctRef.current}`} />
                  <Stat
                    label={tt("accuracy")}
                    value={`${
                      correctRef.current + wrongRef.current
                        ? Math.round((correctRef.current / (correctRef.current + wrongRef.current)) * 100)
                        : 0
                    }%`}
                  />
                  <Stat label={tt("maxCombo")} value={`${maxCombo}`} />
                  <Stat label={tt("creditsEarned")} value={`+${report?.credits ?? 0}`} />
                </div>
                {report?.unlocked?.length ? (
                  <p className="mt-3 text-xs text-fuchsia-300">{report.unlocked.join(" · ")}</p>
                ) : null}
                <button
                  type="button"
                  className="holo-strong mt-5 w-full rounded-xl py-3"
                  onClick={() => window.location.reload()}
                >
                  {tt("playAgain")}
                </button>
                <Link href="/" className="mt-3 block text-sm text-white/50">
                  {tt("toCommand")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  icon,
  badge,
  hot,
  dim,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  badge?: number;
  hot?: boolean;
  dim?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`holo relative grid w-[68px] place-items-center rounded-2xl py-2 ${hot ? "border-cyan-300" : ""} ${dim ? "opacity-45" : ""}`}
    >
      {icon}
      <span className="mt-1 text-[9px] tracking-[0.18em] text-white/55">{label}</span>
      {typeof badge === "number" && (
        <span className="absolute right-1 top-1 text-[9px] text-amber-300">{badge}</span>
      )}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
      <p className="text-[9px] tracking-[0.2em] text-white/40">{label}</p>
      <p className="font-digital text-lg text-cyan-100">{value}</p>
    </div>
  );
}


