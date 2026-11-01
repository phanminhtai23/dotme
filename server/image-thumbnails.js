import sharp from 'sharp'

// Limit the number and dimensions of cached thumbnails so original uploads stay untouched.
const MAX_THUMBNAILS = 64
const thumbnails = new Map()

export async function getWebpThumbnail(filename, content) {
    let pending = thumbnails.get(filename)
    if (pending) {
        thumbnails.delete(filename)
        thumbnails.set(filename, pending)
        return pending
    }

    pending = sharp(content)
        .rotate()
        .resize({ width:600, height:600, fit:'inside', withoutEnlargement:true })
        .webp({ quality:80 })
        .toBuffer()
    thumbnails.set(filename, pending)
    if (thumbnails.size > MAX_THUMBNAILS) thumbnails.delete(thumbnails.keys().next().value)
    try {
        return await pending
    } catch (error) {
        if (thumbnails.get(filename) === pending) thumbnails.delete(filename)
        throw error
    }
}

export function invalidateThumbnail(filename) {
    thumbnails.delete(filename)
}
