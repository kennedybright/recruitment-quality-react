// Return today's full report date in format: Sunday, Aug 10, 2024 3:34 PM 
export function getPrintDate(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return formatter.format(new Date())
}

// Format observed differences on the CMR report
export function formatErrorAreas(areas) {
    if (!areas || !areas.length) return ""
    return areas.map((num) => `[${num}]`).join("  ")
}

// Conditional formatting map for Monitoring Accuracy
const accuracyFormatting = {
    red: {
      max: 90,
      hex: "#E3071D",
    },
    yellow: {
      max: 98,
      hex: "#EEBA2B",
    },
    green: {
      max: 100,
      hex: "#62CC69",
    },
}

// Format monitoring accuracy based on percentage
export function getAccuracyColor(ptg) {
    let hex = ""
    const colors = Object.values(accuracyFormatting)
    for (let i = 0; i < colors.length; i++) {
      if (ptg < colors[i].max) {
        hex = colors[i].hex
        break;
      } else {
        hex = accuracyFormatting.green.hex
      }
    }
    return hex
}

// Extract the base64 string from PDF Blob
export function blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const dataURL = reader.result.toString()
            const base64 = dataURL.replace('data:application/pdf;base64,', '') // strip metadata
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(blob)
    })
}