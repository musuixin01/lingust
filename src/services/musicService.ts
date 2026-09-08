import { TrackInfo, LyricLine } from '../types';

export const DEFAULT_TRACKS: TrackInfo[] = [
  {
    id: 'track-1',
    title: 'Lofi Rain & Coffee (咖啡与细雨)',
    artist: 'Lofi Study Beats',
    album: 'Deep Focus Vol.1',
    duration: 184,
    source: 'stream',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/563/563810_5674468-lq.mp3', // Relaxing ambient rain and gentle chords
    lyrics: [
      { time: 0, text: '咖啡香气在雨声中弥漫', translation: 'The aroma of coffee diffuses in the rain' },
      { time: 6, text: '键盘轻敲，思绪渐入专注', translation: 'Light keystrokes, settling into deep focus' },
      { time: 14, text: '窗外细雨洗净浮尘，世界安静下来', translation: 'Soft rain washing away the world noise' },
      { time: 24, text: '每一个生词都是通往世界的桥梁', translation: 'Every word is a bridge to the world' },
      { time: 35, text: '静心阅读，灵感与释义悄然浮现', translation: 'Reading calmly as meanings unfold' },
      { time: 48, text: '旋律在耳边缓缓流淌', translation: 'Melody flowing softly by your side' },
      { time: 62, text: '沉浸在属于自己的心流时光中', translation: 'Immersed in your own flow state' },
      { time: 80, text: '思考如春水般清澈绵长', translation: 'Thoughts as clear as spring water' },
      { time: 105, text: '伴着乐声，继续探索新的知识边界', translation: 'Continuing to explore new frontiers with music' },
    ],
  },
  {
    id: 'track-2',
    title: 'Midnight Coding Flow (午夜心流)',
    artist: 'Synthwave Ambient',
    album: 'Night Owl Sessions',
    duration: 210,
    source: 'stream',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/467/467026_5121236-lq.mp3', // Relaxing ambient synth
    lyrics: [
      { time: 0, text: '夜幕垂落，屏幕光影轻柔闪烁', translation: 'Night falls, the screen glows softly' },
      { time: 8, text: '代码与语言在指尖交织起舞', translation: 'Code and words dancing at fingertips' },
      { time: 18, text: '没有白昼的喧嚣，唯有纯粹的创造', translation: 'No daytime noise, only pure creation' },
      { time: 30, text: '灵动岛记录着每一个跳动的音符', translation: 'Dynamic island capturing every beat' },
      { time: 45, text: '在旋律的节拍中，攻克下一个难题', translation: 'Conquering the next challenge in rhythm' },
      { time: 65, text: '跨越语言与文化的边界', translation: 'Crossing the boundaries of language' },
      { time: 90, text: '万籁俱寂，唯有思绪璀璨如星', translation: 'All is quiet, only thoughts shining bright' },
    ],
  },
  {
    id: 'track-3',
    title: 'Acoustic Morning Sunlight (晨光晨曦)',
    artist: 'Peaceful Acoustic Guitar',
    album: 'Dawn Awakening',
    duration: 165,
    source: 'stream',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/612/612644_5674468-lq.mp3', // Gentle acoustic guitar
    lyrics: [
      { time: 0, text: '清晨的第一缕微光洒在桌面', translation: 'The first beam of morning light' },
      { time: 7, text: '琴弦轻拨，唤醒一整天的敏锐灵感', translation: 'Gentle chords awakening morning inspiration' },
      { time: 16, text: '一杯温水，开启高效的一天', translation: 'A warm drink to start a productive day' },
      { time: 28, text: '词句在晨风中变得清晰生动', translation: 'Words turning vivid in the fresh breeze' },
      { time: 42, text: '探索未知，发现更多可能', translation: 'Discovering possibilities in the unknown' },
      { time: 60, text: '微风不燥，时光正当时', translation: 'Gentle breeze, perfect moment' },
    ],
  },
  {
    id: 'track-4',
    title: 'Windows 系统媒体总线 (GSMTC 监听模式)',
    artist: '系统媒体 (网易云/QQ音乐/Spotify/浏览器)',
    album: 'Windows System Audio Bus',
    duration: 240,
    source: 'system',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    audioUrl: '',
    lyrics: [
      { time: 0, text: '正在监听 Windows 系统当前活跃媒体播放器', translation: 'Monitoring active Windows media player via GSMTC' },
      { time: 10, text: '支持网易云音乐、QQ音乐、Spotify、Apple Music、B站与网页音频', translation: 'Works with CloudMusic, QQMusic, Spotify, YouTube' },
      { time: 25, text: '自动同步歌曲名、歌手、封面与播放状态', translation: 'Auto sync title, artist, cover & state' },
      { time: 45, text: '在药丸灵动岛上可直接切歌、暂停与查看实时歌词', translation: 'Control track, pause, and view lyrics on Island' },
    ],
  },
];

class SoundSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playAmbientChords() {
    try {
      this.init();
      if (!this.ctx) return;
      this.isPlaying = true;
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F Major
        [196.00, 246.94, 293.66, 392.00], // G Major
      ];
      let chordIndex = 0;

      const triggerChord = () => {
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = chords[chordIndex % chords.length];
        chordIndex++;

        freqs.forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          // Soft ambient envelope
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + i * 0.1);
          osc.stop(now + 4.0);
        });

        this.timer = window.setTimeout(triggerChord, 3600);
      };

      triggerChord();
    } catch {
      // AudioContext not supported
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export const soundSynth = new SoundSynth();
