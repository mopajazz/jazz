// Icon set — minimal stroke icons. Attached to window.Icons.
const Icon = ({ d, size = 20, fill = "none", stroke = "currentColor", sw = 1.6, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

window.Icons = {
  Eye: (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /></Icon>,
  Ear: (p) => <Icon {...p} d="M6 8a6 6 0 0 1 12 0c0 4-3 4-3 7a3 3 0 0 1-6 0M9 8a3 3 0 0 1 6 0" />,
  Play: (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M7 5.5v13l11-6.5-11-6.5Z" /></Icon>,
  Hand: (p) => <Icon {...p} d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-.5V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-1.2a4 4 0 0 1-3-1.4L5 15c-.8-1-.5-2 .5-2.4L8 11.5" />,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></Icon>,
  Check: (p) => <Icon {...p} d="M4 12.5 9 17.5 20 6.5" sw={2} />,
  CheckCircle: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.2l2.6 2.6L16 9" sw={1.8} /></Icon>,
  Lock: (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>,
  ArrowRight: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  ArrowLeft: (p) => <Icon {...p} d="M19 12H5M11 18 5 12l6-6" />,
  Pause: (p) => <Icon {...p} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Icon>,
  Reset: (p) => <Icon {...p} d="M4 12a8 8 0 1 1 2.3 5.6M4 17v-4h4" />,
  Sun: (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></Icon>,
  Moon: (p) => <Icon {...p} d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  Sparkle: (p) => <Icon {...p} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Icon>,
  Chat: (p) => <Icon {...p} d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" />,
  Book: (p) => <Icon {...p} d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 18H20" />,
  Layers: (p) => <Icon {...p} d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" />,
  Video: (p) => <Icon {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></Icon>,
  Metronome: (p) => <Icon {...p} d="M9 3h6l3 18H6L9 3ZM12 7v8M12 15l4-5" />,
  Dot: (p) => <Icon {...p} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="4" /></Icon>,
  Menu: (p) => <Icon {...p} d="M4 7h16M4 12h16M4 17h16" />,
  X: (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18" />,
};
