export const convertToWebP = async (file: File): Promise<Blob> => {
  if (file.type === 'image/heic') return file

  const bitmap = await createImageBitmap(file)
  const MAX_LONG_EDGE = 1920
  let { width, height } = bitmap

  if (width > MAX_LONG_EDGE || height > MAX_LONG_EDGE) {
    if (width >= height) {
      height = Math.round((height * MAX_LONG_EDGE) / width)
      width = MAX_LONG_EDGE
    } else {
      width = Math.round((width * MAX_LONG_EDGE) / height)
      height = MAX_LONG_EDGE
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('変換に失敗しました')),
      'image/webp',
      0.8
    )
  })
}
