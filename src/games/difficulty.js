// spawnInterval: khoảng cách giữa các obstacle (frames) — càng nhỏ càng khó
// balloonSpeedFactor: hệ số tốc độ bóng — < 1 = nhanh hơn (khó hơn)
// obstacleHeightMult: nhân chiều cao obstacle — > 1 = cao hơn (khó nhảy qua hơn)

export const DIFFICULTY = {
  'balloon-pop': {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      totalBalloons:20, target:10, time:35,
      balloonSpeedFactor:0.85,
      spawnBatch:2,
      desc:'Bắn 10/20 bóng trong 35 giây',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      totalBalloons:24, target:18, time:22,
      balloonSpeedFactor:0.65,
      spawnBatch:3,
      desc:'Bắn 18/24 bóng trong 22 giây',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      totalBalloons:30, target:25, time:16,
      balloonSpeedFactor:0.45,
      spawnBatch:4,
      desc:'Bắn 25/30 bóng trong 16 giây',
    },
  },
  'cat-runner': {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      surviveSecs:15, speedMult:0.85,
      spawnInterval:100,         // obstacles xuất hiện thưa
      obstacleHeightMult:0.8,
      desc:'Sống sót 15 giây',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      surviveSecs:22, speedMult:1.3,
      spawnInterval:72,
      obstacleHeightMult:1.0,
      desc:'Sống sót 22 giây',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      surviveSecs:30, speedMult:2.0,
      spawnInterval:50,          // obstacles xuất hiện dày đặc, nhanh
      obstacleHeightMult:1.3,    // cao hơn, khó nhảy qua hơn
      desc:'Sống sót 30 giây',
    },
  },
  'heart-memory': {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      pairs:6, cols:3, time:80,
      flipDelay:900,             // ms trước khi lật lại
      desc:'6 cặp trong 80 giây',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      pairs:8, cols:4, time:55,
      flipDelay:700,
      desc:'8 cặp trong 55 giây',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      pairs:8, cols:4, time:38,
      flipDelay:500,             // lật lại rất nhanh, khó nhớ
      desc:'8 cặp trong 38 giây',
    },
  },
  snake: {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      tickMs:170, targetScore:8,
      desc:'Ăn 8 mồi để thắng',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      tickMs:125, targetScore:12,
      desc:'Ăn 12 mồi để thắng',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      tickMs:90, targetScore:16,
      desc:'Ăn 16 mồi để thắng',
    },
  },
  'goose-forage': {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      targetScore:6, duration:60,
      desc:'Nhặt 6 hạt trong 60 giây',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      targetScore:9, duration:45,
      desc:'Nhặt 9 hạt trong 45 giây, tránh bụi gai',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      targetScore:12, duration:35,
      desc:'Nhặt 12 hạt trong 35 giây',
    },
  },
  'star-catcher': {
    easy: {
      label:'Dễ', icon:'😊', color:'#10b981',
      targetScore:8, duration:40, fallSpeed:145, spawnInterval:1050,
      desc:'Hứng 8 ngôi sao trong 40 giây',
    },
    medium: {
      label:'Vừa', icon:'😐', color:'#f59e0b',
      targetScore:12, duration:35, fallSpeed:180, spawnInterval:850,
      desc:'Hứng 12 ngôi sao trong 35 giây',
    },
    hard: {
      label:'Khó', icon:'😤', color:'#ef4444',
      targetScore:16, duration:32, fallSpeed:230, spawnInterval:700,
      desc:'Hứng 16 ngôi sao trong 32 giây',
    },
  },
}

export function getDiffConfig(type, difficulty) {
  return DIFFICULTY[type]?.[difficulty] || DIFFICULTY[type]?.medium || DIFFICULTY['balloon-pop'].medium
}
