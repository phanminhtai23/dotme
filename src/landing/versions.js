import { lazy } from 'react'

export const DEFAULT_VERSION = 'classic'

export const LANDING_VERSIONS = [
  { id: 'classic', name: 'Classic', description: 'Bản hiện tại: nền tối, điểm nhấn tím, hero căn giữa.', load: lazy(() => import('./Classic')) },
  { id: 'poster', name: 'Poster', description: 'Nền xanh ultramarine, tên cỡ lớn, ảnh chân dung đè lên chữ.', load: lazy(() => import('./Poster')) },
  { id: 'bento', name: 'Bento', description: 'Nền tối xanh navy, lưới ô to nhỏ kiểu bento.', load: lazy(() => import('./Bento')) },
  { id: 'editorial', name: 'Editorial', description: 'Nền sáng, chữ serif, cột menu bên trái như tạp chí.', load: lazy(() => import('./Editorial')) },
]

export const isLandingVersion = id => LANDING_VERSIONS.some(version => version.id === id)
