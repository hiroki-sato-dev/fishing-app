export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ja&region=JP`
    )

    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      
      // 住所コンポーネントから都道府県と市区町村を抽出
      const components = result.address_components
      let prefecture = ''
      let city = ''

      components.forEach((component: { types: string[]; long_name: string }) => {
        if (component.types.includes('administrative_area_level_1')) {
          prefecture = component.long_name
        }
        if (component.types.includes('administrative_area_level_2')) {
          city = component.long_name
        }
      })

      // 都道府県 + 市区町村の形式で返す
      if (prefecture && city) {
        return `${prefecture}${city}`
      }

      // フォールバック: formatted_addressから都道府県と市区町村を抽出
      let address = result.formatted_address.replace('日本、', '').replace('Japan, ', '')
      
      // 郵便番号を除去
      address = address.replace(/〒\d{3}-\d{4}\s*/, '').replace(/\d{3}-\d{4}\s*/, '')
      
      // 詳細な住所（番地以下）を除去して都道府県と市区町村のみにする
      const addressParts = address.split(/[市区町村]/)
      if (addressParts.length > 1) {
        const prefectureAndCity = addressParts[0] + (address.match(/[市区町村]/)?.[0] || '')
        return prefectureAndCity
      }
      
      return address
    }

    // APIが失敗した場合は座標を返す
    return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
  }
}