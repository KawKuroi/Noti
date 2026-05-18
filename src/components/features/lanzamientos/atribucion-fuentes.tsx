export function AtribucionFuentes() {
  return (
    <footer className="border-t border-gray-100 pt-4 text-xs text-gray-400 space-y-1">
      <p>
        Las peliculas y series usan datos de{' '}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          TMDB
        </a>
        . Este producto usa la API de TMDB pero no esta avalado ni certificado por TMDB.
      </p>
      <p>
        Datos de videojuegos cortesia de{' '}
        <a
          href="https://rawg.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          RAWG.io
        </a>
        . Datos musicales cortesia de{' '}
        <a
          href="https://musicbrainz.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          MusicBrainz
        </a>
        . Datos de libros cortesia de{' '}
        <a
          href="https://books.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Google Books
        </a>
        .
      </p>
    </footer>
  )
}
