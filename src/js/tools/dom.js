
export function detectDeviceType() {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent,
  )
    ? 'Mobile'
    : 'Desktop'
}

// Updated on 2026-08-28
 
