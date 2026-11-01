export const DEFAULT_GAME_BY_TYPE = {
  birthday: 'balloon-pop',
  motivation: 'cat-runner',
  love: 'heart-memory',
}

export const GAME_OPTIONS = [
  { id:'balloon-pop', name:'Bắn bóng bay', emoji:'🎈', description:'Chạm bóng để ghi điểm' },
  { id:'cat-runner', name:'Mèo vượt chướng ngại', emoji:'🐱', description:'Nhảy và cúi để né chướng ngại' },
  { id:'heart-memory', name:'Lật bài đôi', emoji:'💕', description:'Tìm các cặp hình giống nhau' },
  { id:'snake', name:'Rắn săn mồi', emoji:'🐍', description:'Điều khiển rắn ăn mồi, tránh va chạm' },
  { id:'goose-forage', name:'Vịt nhặt hạt', emoji:'🦆', description:'Dẫn chú vịt đi nhặt hạt trong khu vườn' },
  { id:'star-catcher', name:'Hứng sao đêm', emoji:'🌠', description:'Di chuyển chiếc giỏ để hứng sao rơi' },
]

export function resolveGameId(gameId, type) {
  return GAME_OPTIONS.some((game) => game.id === gameId)
    ? gameId
    : DEFAULT_GAME_BY_TYPE[type] || DEFAULT_GAME_BY_TYPE.birthday
}
