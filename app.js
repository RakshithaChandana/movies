const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1
//Get all the movies in the database (movie table)

const convertDBObjectAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((objectItem) => convertDBObjectAPI1(objectItem))
  );
});

//API 2
//Create new movie in the database(movie table)

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMoviesQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES ("${directorId}","${movieName}","${leadActor}");`;
  const dbResponse = await db.run(addMoviesQuery);
  response.send("Movie Successfully Added");
});

//API 3
//Returns movie by movieId

const convertDBObjectsAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id="${movieId}";`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDBObjectsAPI3(movie));
});

//API 4
//Update movie details by movieId in the movie table

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET director_id="${directorId}",
        movie_name="${movieName}",
        lead_actor="${leadActor}"
    WHERE movie_id=${movieId};`;
  const updateMovieResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Delete movie details based on movieId from the movie table

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  const deleteResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
//Returns list of all directors in the director table

const convertDBObjectsAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => convertDBObjectsAPI6(eachDirector))
  );
});

//API 7
//Returns list of all movie names by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT movie_name AS movieName FROM movie WHERE director_id="${directorId}";`;
  const moviesDetails = await db.all(getMoviesQuery);
  response.send(moviesDetails);
});

module.exports = app;
