// Resuelve los enlaces de descarga de las apps nativas desde los releases
// de GitHub. Hay dos releases independientes (tags app-v* y android-v*) y el
// asset de Windows incluye la version en el nombre, asi que no existe una URL
// estable: se consulta la lista y se toma el asset mas reciente de cada tipo.

interface AssetRelease {
  name: string
  browser_download_url: string
}

interface ReleaseGitHub {
  draft: boolean
  prerelease: boolean
  assets: AssetRelease[]
}

export interface EnlacesDescarga {
  windows: string | null
  android: string | null
}

export const URL_RELEASES = 'https://github.com/KawKuroi/Noti/releases'

const API_RELEASES = 'https://api.github.com/repos/KawKuroi/Noti/releases?per_page=10'

// Cacheado 1 hora por Next: una llamada anonima por hora queda muy por debajo
// del limite de 60/h de la API de GitHub.
export async function obtenerEnlacesDescarga(): Promise<EnlacesDescarga> {
  try {
    const res = await fetch(API_RELEASES, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return { windows: null, android: null }

    const releases = (await res.json()) as ReleaseGitHub[]
    let windows: string | null = null
    let android: string | null = null

    // La API devuelve los releases del mas reciente al mas antiguo.
    for (const release of releases) {
      if (release.draft || release.prerelease) continue
      for (const asset of release.assets) {
        if (!windows && asset.name.endsWith('-setup.exe')) {
          windows = asset.browser_download_url
        }
        if (!android && asset.name === 'noti-android.apk') {
          android = asset.browser_download_url
        }
      }
      if (windows && android) break
    }

    return { windows, android }
  } catch {
    return { windows: null, android: null }
  }
}
