import { useState,useEffect } from "react";



const KEY = "de0d74ce";
export function useMovie(query){
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        async function fetchMovie() {
          try {
            setLoading(true);
            setError("");
            const res = await fetch(
              `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
              {
                signal : controller.signal ,
              }
            );
    
            if (!res.ok)
              throw new error("Something went wrong with fetching movies");
    
            const data = await res.json();
    
            if (data.Response === "False") throw new error("🚩 movie not found");
    
            setMovies(data.Search);
            setError("");
          } catch (err) {
            console.error(err.message);
            if (err.name !== "AbortError") {
              setError(err.message);
            }
          } finally {
            setLoading(false);
          }
        }
    
        if (query.length < 3) {
          setError("");
          setMovies([]);
          return;
        }
    
        fetchMovie();
        return () => controller.abort();
      }, [error, query])

      return {movies,error,loading}
}