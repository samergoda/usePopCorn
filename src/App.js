import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating";
import { useMovie } from "./useMovie";
import { useKey } from "./useKey";


const KEY = "de0d74ce";

//`https://www.omdbapi.com/?apikey=${KEY}&s=interstellar`

const average = (arr) =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const controller = new AbortController();
export default function App() {
  const [query, setQuery] = useState("");
  const [selectId, setSelectId] = useState(null);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });

  const {movies,error,loading} =useMovie(query)
 

  useEffect(()=>{
    localStorage.setItem('watched',JSON.stringify(watched))
  },[watched])
  function handleSelectMovie(id) {
    setSelectId((selectId) => (id === selectId ? null : id));
  }
  function handleDeletWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  function handleCloseMovie() {
    setSelectId(null);
  }

  function handleAddWatched(movie) {
    setWatched( watched => [...watched, movie]&&[]);
  }

  return (
    <>
      {/* <StarRating maxRating={5} /> */}
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {loading && <Loader />}
          {!loading && !error && (
            <MovieList movies={movies} onSelect={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
          {/* {loading? <Loader /> : <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectId ? (
            <MovieDetails
              selectId={selectId}
              onCloseMovie={handleCloseMovie}
              onWatchedMovies={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummry watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDelete={handleDeletWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function MovieDetails({ selectId, onCloseMovie, onWatchedMovies, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched?.map((movie) => movie.imdbID).includes(selectId);
  const watchedUserRating = watched?.find(
    (movie) => movie.imdbID === selectId
  )?.userRating;

  const countRef = useRef(0)

  useEffect(()=>{
    if(userRating) countRef.current++
  },[userRating])

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;


  useKey(onCloseMovie)

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    async function getMovieDetails() {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectId}`,{
          signal:controller.signal
        }
      );

      const data = await res.json();
      setMovie(data);
      setLoading(false);
    }
    getMovieDetails();
  }, [selectId]);

  useEffect(() => {
    if (!title) return;

    document.title = `Movie | ${title}`;

    return () =>{ 
      document.title = "usePopCorn";
      controller.abort();}
  }, [title]);
  function handlAdd() {
    const newWatchedMovie = {
      imdbID: selectId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    if (newWatchedMovie.imdbID) onWatchedMovies(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <button className="btn-back" onClick={onCloseMovie}>
            &larr;
          </button>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handlAdd}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>you rated with movie {watchedUserRating}⭐️</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚩</span>
      {message}
    </p>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null)
  useEffect(()=>{
    function callBack(e){
      if(e.code==='Enter'){
        inputEl.current.focus()
      }
    }
    document.addEventListener('keydown',callBack)
    return ()=> document.addEventListener('keydown',callBack)
  },[])
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={inputEl}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box scrollbar-hidden">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelect }) {
  return (
    <ul className="list list-movies scrollbar-hidden">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelect }) {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummry({ watched }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));
  return (
    <div className="summary ">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched?.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDelete }) {
  return (
    <ul className="list scrollbar-hidden">
      {watched?.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}














