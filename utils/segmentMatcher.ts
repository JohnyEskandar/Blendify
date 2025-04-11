import { getAudioAnalysis } from '@/lib/spotify'

export function getSegmentsForRange(
  segments: any[],
  startTime: number,
  endTime: number
) {
  return segments.filter((seg) => seg.start >= startTime && seg.start < endTime)
}

export function averageVector(segments: any[], field: 'pitches' | 'timbre') {
  if (!segments.length) return new Array(12).fill(0)

  const sum = new Array(12).fill(0)
  segments.forEach((seg) => {
    seg[field].forEach((val: number, i: number) => {
      sum[i] += val
    })
  })

  return sum.map((val) => val / segments.length)
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0))

  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

export async function scoreTransition(
  trackA: { id: string },
  trackB: { id: string },
  accessToken: string
): Promise<number> {
  const analysisA = await getAudioAnalysis(trackA.id, accessToken)
  const analysisB = await getAudioAnalysis(trackB.id, accessToken)

  const last10A = getSegmentsForRange(
    analysisA.segments,
    analysisA.track.duration - 10,
    analysisA.track.duration
  )
  const first10B = getSegmentsForRange(analysisB.segments, 0, 10)

  const pitchA = averageVector(last10A, 'pitches')
  const pitchB = averageVector(first10B, 'pitches')
  const timbreA = averageVector(last10A, 'timbre')
  const timbreB = averageVector(first10B, 'timbre')

  const pitchSim = cosineSimilarity(pitchA, pitchB)
  const timbreSim = cosineSimilarity(timbreA, timbreB)

  return 0.6 * pitchSim + 0.4 * timbreSim
}
