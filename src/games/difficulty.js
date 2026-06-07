// spawnInterval: khoảng cách giữa các obstacle (frames) — càng nhỏ càng khó
// balloonSpeedFactor: hệ số tốc độ bóng — < 1 = nhanh hơn (khó hơn)
// obstacleHeightMult: nhân chiều cao obstacle — > 1 = cao hơn (khó nhảy qua hơn)

export const DIFFICULTY = {
  birthday: {
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
  motivation: {
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
  love: {
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
}

export function getDiffConfig(type, difficulty) {
  return DIFFICULTY[type]?.[difficulty] || DIFFICULTY[type]?.medium
}
