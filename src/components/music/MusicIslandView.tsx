import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ListMusic,
  Maximize2,
  Minimize2,
  Sparkles,
  Radio,
  Check,
  Languages,
} from 'lucide-react';
import { TrackInfo, LyricLine } from '../../types';
import { DEFAULT_TRACKS, soundSynth } from '../../services/musicService';

interface MusicIslandProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSwitchToTranslation?: () => void;
  isPillMode?: boolean;
}

export const MusicIslandView: React.FC<MusicIslandProps> = ({
  isExpanded,
  onToggleExpand,
  onSwitchToTranslation,
  isPillMode = false,
}) => {
  const [tracks, setTracks] = useState<TrackInfo[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(184);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [useSynth, setUseSynth] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Initialize or change audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      } else {
        setDuration(currentTrack.duration || 180);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleError = () => {
      // If stream fails to load due to CORS or network, fallback to soundSynth
      setUseSynth(true);
      if (isPlaying) {
        soundSynth.playAmbientChords();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (currentTrack.audioUrl && currentTrack.source !== 'system') {
      audio.src = currentTrack.audioUrl;
      audio.volume = isMuted ? 0 : volume;
      setUseSynth(false);
    } else {
      setUseSynth(true);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback timer for system / synth simulation
  useEffect(() => {
    if (isPlaying) {
      if (currentTrack.audioUrl && !useSynth && audioRef.current) {
        audioRef.current.play().catch(() => {
          setUseSynth(true);
          soundSynth.playAmbientChords();
        });
      } else if (useSynth) {
        soundSynth.playAmbientChords();
      }

      // Simulated timer for system tracks or synth mode
      progressIntervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= (currentTrack.duration || 180)) {
            handleNextTrack();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      soundSynth.stop();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentTrackIndex, useSynth]);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  const handleNextTrack = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handlePrevTrack = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const target = pct * (duration || 180);
    setCurrentTime(target);
    if (audioRef.current && !useSynth && currentTrack.audioUrl) {
      audioRef.current.currentTime = target;
    }
  };

  // Find active lyric line
  const activeLyricIndex = (currentTrack.lyrics || []).reduce((acc, line, idx) => {
    if (currentTime >= line.time) {
      return idx;
    }
    return acc;
  }, 0);

  const activeLyric = currentTrack.lyrics?.[activeLyricIndex];

  // Auto scroll lyrics in expanded view
  useEffect(() => {
    if (isExpanded && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector(`[data-lyric-idx="${activeLyricIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, isExpanded]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ===================== 1. 紧凑药丸形态 (Compact Pill Mode) =====================
  if (!isExpanded) {
    return (
      <div className="flex items-center w-full h-full gap-2 px-1 min-w-0 select-none">
        {/* 左侧：微型黑胶唱片 / 封面，播放时柔和旋转 + 律动频谱 */}
        <div
          onClick={onToggleExpand}
          className="relative flex items-center gap-1.5 shrink-0 cursor-pointer group/cover"
          title="点击展开灵动岛音乐面板"
        >
          <div
            className={`w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-md relative shrink-0 transition-transform ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '6s', animationTimingFunction: 'linear' }}
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-800 flex items-center justify-center">
                <Music className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full border border-black/30 pointer-events-none" />
            <div className="absolute inset-[35%] rounded-full bg-slate-900 border border-white/40" />
          </div>

          {/* 3根动态律动频谱条 (Equalizer Bars) */}
          <div className="flex items-end gap-[2px] h-3.5 shrink-0 px-0.5" title="音频律动">
            <span
              className={`w-[2.5px] rounded-full bg-emerald-400 transition-all duration-150 ${
                isPlaying ? 'animate-pulse h-3 bg-emerald-400' : 'h-1 bg-white/30'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-cyan-300 transition-all duration-200 ${
                isPlaying ? 'animate-bounce h-3.5 bg-cyan-300' : 'h-1.5 bg-white/30'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-blue-400 transition-all duration-150 ${
                isPlaying ? 'animate-pulse h-2 bg-blue-400' : 'h-1 bg-white/30'
              }`}
            />
          </div>
        </div>

        {/* 中间：歌名、歌手与实时逐句歌词切换 */}
        <div
          onClick={onToggleExpand}
          className="flex-1 min-w-0 overflow-hidden cursor-pointer group/text flex flex-col justify-center"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-white/95 truncate">
              {currentTrack.title}
            </span>
            <span className="text-[10px] text-white/40 truncate hidden sm:inline">
              · {currentTrack.artist}
            </span>
          </div>
          {activeLyric && (
            <div className="text-[11px] text-emerald-300/90 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="truncate">{activeLyric.text}</span>
            </div>
          )}
        </div>

        {/* 右侧：紧凑播放控件 */}
        <div className="flex items-center gap-1 shrink-0 z-30">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleTogglePlay}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleNextTrack}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="下一曲"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          {onSwitchToTranslation && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSwitchToTranslation();
              }}
              className="p-1.5 rounded-full text-blue-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="切换到翻译模式"
            >
              <Languages className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
            title="展开灵动岛卡片"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // ===================== 2. 灵动岛展开大卡片形态 (Expanded Island Popover) =====================
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full flex flex-col p-4 bg-slate-950/90 text-white rounded-3xl border border-white/20 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200"
    >
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>灵动岛音乐</span>
          </div>
          {currentTrack.source === 'system' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Windows GSMTC
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onSwitchToTranslation && (
            <button
              type="button"
              onClick={onSwitchToTranslation}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="切回翻译模式"
            >
              <Languages className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPlaylist((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showPlaylist ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="播放列表"
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="折叠为药丸"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showPlaylist ? (
        // 播放列表视图
        <div className="py-3 max-h-60 overflow-y-auto space-y-1.5 pr-1">
          <div className="text-[11px] font-medium text-white/40 mb-2 px-1">
            选择伴读曲目或切换音频源:
          </div>
          {tracks.map((t, idx) => {
            const isSelected = idx === currentTrackIndex;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                  setShowPlaylist(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                    : 'hover:bg-white/10 text-white/75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                    <img
                      src={t.coverUrl}
                      alt={t.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="text-[10px] text-white/40 truncate">{t.artist}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      ) : (
        // 核心播放与歌词视图
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center gap-3">
            {/* 唱片黑胶封面 */}
            <div
              className={`w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow-xl relative shrink-0 ${
                isPlaying ? 'ring-2 ring-emerald-400/40' : ''
              }`}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{currentTrack.title}</h3>
              <p className="text-xs text-white/50 truncate mt-0.5">{currentTrack.artist}</p>
              {currentTrack.album && (
                <p className="text-[10px] text-white/35 truncate mt-0.5">{currentTrack.album}</p>
              )}
            </div>
          </div>

          {/* 实时歌词显示滚动窗口 (逐句对齐与翻译) */}
          <div
            ref={lyricsContainerRef}
            className="h-28 overflow-y-auto px-2 py-1 rounded-xl bg-white/5 border border-white/10 scroll-smooth space-y-2 mask-lyrics"
          >
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <div
                    key={idx}
                    data-lyric-idx={idx}
                    onClick={() => {
                      setCurrentTime(line.time);
                      if (audioRef.current && !useSynth) {
                        audioRef.current.currentTime = line.time;
                      }
                    }}
                    className={`transition-all duration-200 cursor-pointer rounded-lg px-2 py-1 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold scale-[1.02] shadow-sm'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <div className="text-xs">{line.text}</div>
                    {line.translation && (
                      <div className="text-[10px] text-white/40 mt-0.5">{line.translation}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/30 italic">
                暂无歌词或正在从音频总线同步...
              </div>
            )}
          </div>

          {/* 进度条与时间 */}
          <div className="flex flex-col gap-1 mt-1">
            <div
              onClick={handleSeek}
              className="relative h-1.5 bg-white/15 rounded-full overflow-hidden cursor-pointer group"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-emerald-400 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, (currentTime / (duration || 180)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 播放控制按钮栏 */}
          <div className="flex items-center justify-between pt-1">
            {/* 音量控制 */}
            <div className="flex items-center gap-1.5 w-24">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 accent-emerald-400 bg-white/20 rounded-full cursor-pointer"
              />
            </div>

            {/* 核心上一曲/播放/下一曲 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTrack}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="上一曲"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="下一曲"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* 模式标签 */}
            <div className="text-right">
              <span className="text-[10px] text-white/30 font-mono">
                {currentTrackIndex + 1}/{tracks.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
