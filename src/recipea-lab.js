//Importing the modules needed to run this
const express = require("express");
const fs = require("fs").promises;

//Declaring the app and saying we'll be using express
const app = express();

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

//The express.json() function is a built-in middleware function in Express. It parses incoming requests with JSON payloads
app.use(express.json());

//Start of the helper functions

//This function accesses all recipes in the data file
//Using async-await gives the program time to get the data and be ready for these functions - otherwise, they would run immediately, before anything else, and return "undefined" as it wouldn't know there's a database just yet
const getRecipes = async () => {
  const recipes = await fs.readFile("../data/recipea-data.json", "utf8");

  return recipes;
};

//This function returns just the requested recipe - with SQL, we won't have to read the entire database and then return one file, it will just go directly to that one file
const getRecipe = async (id) => {
  //this makes sure the computer isn't interpreting the entered ID as a string
  const number = Number(id);
  const data = await fs.readFile("../data/recipea-data.json", "utf8");
  const parsedData = JSON.parse(data);
  return parsedData[number];
};

//This function deletes the selected file
const deleteRecipe = async (id) => {
  const data = await fs.readFile("../data/recipea-data.json", "utf8");
  //Parse is turning this from JSON to JS so that we can run a function on it
  //Below has an implicit return - it's saying - if the recipe id doesn't match the id given, then great, keep that recipe
  const recipes = JSON.parse(data).filter((recipe, i) => i !== id);
  //Stringify returns the formatting to JSON - first parameter is what is being stringified, null is saying to do basic stringify, and 2 means to put two spaces between the items
  const jsonRecipes = JSON.stringify(recipes, null, 2);
  await fs.writeFile("../data/recipea-data.json", jsonRecipes);
};

const createRecipe = async (name, cookingMethod, ingredients) => {
  const recipeArray = await fs.readFile("../data/recipea-data.json", "utf8");
  const recipeList = JSON.parse(recipeArray);
  const newRecipe = {
    name: name,
    cookingMethod: cookingMethod,
    ingredients: ingredients,
  };
  recipeList.push(newRecipe);
  const jsonAddRecipe = JSON.stringify(recipeList, null, 2);
  await fs.writeFile("../data/recipea-data.json", jsonAddRecipe);
};

// const updateRecipe = async (id, updatedRecipe) => {
//   const data = await fs.readFile("../data/recipea-data.json", "utf8");
//   const recipe = JSON.parse(data).map((recipe, i) => {
//     return i === id ? updatedRecipe : recipe;
//   });
//   const jsonUpdatedRecipe = JSON.stringify(recipe, null, 2);
//   await fs.writeFile("../data/recipea-data.json", jsonUpdatedRecipe);
// };

const updateRecipe = async (id, updatedRecipe) => {
  const data = await fs.readFile("../data/recipea-data.json", "utf8");
  const recipeArray = JSON.parse(data);
  recipeArray[id] = updatedRecipe;
  const jsonUpdatedRecipe = JSON.stringify(recipeArray, null, 2);
  await fs.writeFile("../data/recipea-data.json", jsonUpdatedRecipe);
};

//Routes
//API CALLS

//API call for finding all recipes
app.get("/find-recipes", async (req, res) => {
  const recipes = await getRecipes();
  res.send(recipes);
});

app.get("/find-recipe/:id", async (req, res) => {
  const recipe = await getRecipe(req.params.id);
  res.send(recipe);
});

app.post("/create-recipe", async (req, res) => {
  //Don't need a const here because there's no return of any value - it's just taking the info and sending it to the database - we can send a status or something, but no data needed, so can just do a simple await
  await createRecipe(
    req.body.name,
    req.body.cookingMethod,
    req.body.ingredients
  );
  res.status(201).json("You added a new recipe");
});

// app.put("/update-recipe/:id", async (req, res) => {
//   const updatedRecipe = await updateRecipe({
//     name: req.body.name,
//     cookingMethod: req.body.cookingMethod,
//     ingredients: req.body.ingredients,
//   });
//   await updateRecipe(Number(req.params.id), updatedRecipe);
//   res.send(updateRecipe);
//   res
//     .send(updatedRecipe)
//     .status(201)
//     .json(
//       "You have successfully updated the recipe - but are you positive it needs 5000 pounds of peas? That seems like ... too few"
//     );
// });

app.put("/update-recipe/:id", async (req, res) => {
  const recipeID = Number(req.params.id);
  const updatedRecipe = {
    name: req.body.name,
    cookingMethod: req.body.cookingMethod,
    ingredients: req.body.ingredients,
  };
  await updateRecipe(recipeID, updatedRecipe);
  res
    .status(201)
    .json(
      "You have successfully updated the recipe - but are you positive it needs 5000 pounds of peas? That seems like ... too few"
    );
  res.send(updatedRecipe);

  // res
  //   .status(201)
  //   .json(
  //     "You have successfully updated the recipe - but are you positive it needs 5000 pounds of peas? That seems like ... too few"
  //   );
});

app.delete("/delete-recipe/:id", async (req, res) => {
  const id = Number(req.params.id);
  const recipe = await deleteRecipe(id);
  res.send("Recipe with this ID has been deleted");
});
