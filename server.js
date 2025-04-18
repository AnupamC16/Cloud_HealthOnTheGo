const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SPOONACULAR_API_KEY = 'f97fd9e9311d44a8948b712c29ca4d76';

app.post('/searchrecipe', async (req, res) => {
    const { recipeName } = req.body;

    if (!recipeName) {
        return res.status(400).json({ error: 'Missing recipeName in request body' });
    }

    try {
        const searchResponse = await axios.get(
            'https://api.spoonacular.com/recipes/complexSearch',
            {
                params: {
                    query: recipeName,
                    number: 1,
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );

        if (!searchResponse.data.results.length) {
            return res.status(404).json({ error: 'No recipe found for that name' });
        }

        const recipeId = searchResponse.data.results[0].id;

        const infoResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipeId}/information`,
            {
                params: {
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );

        const recipe = infoResponse.data;

        res.json({
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            ingredients: recipe.extendedIngredients.map(i => i.original),
            instructions: recipe.instructions || "Instructions not provided"
        });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Failed to fetch recipe", details: err.message });
    }
});

app.post('/explorerecipes', async (req, res) => {
    const { cuisine } = req.body;

    if (!cuisine) {
        return res.status(400).json({ error: 'Missing cuisine in request body' });
    }

    try {
        const response = await axios.get(
            'https://api.spoonacular.com/recipes/complexSearch',
            {
                params: {
                    cuisine: cuisine,
                    number: 10,
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );

        const recipes = response.data.results;

        if (!recipes.length) {
            return res.status(404).json({ error: 'No recipes found for this cuisine' });
        }

        const recipeId = recipes[0].id;

        const infoResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipeId}/information`,
            {
                params: {
                    apiKey: SPOONACULAR_API_KEY
                }
            }
        );

        const recipe = infoResponse.data;

        res.json({
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            ingredients: recipe.extendedIngredients.map(i => i.original),
            instructions: recipe.instructions || "Instructions not provided"
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to fetch cuisine recipes", details: error.message });
    }
});

app.post('/searchrecipebyingredients', async (req, res) => {
    try {
        const { ingredients, cuisine } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: "Ingredients must be a non-empty array." });
        }

        const formattedIngredients = ingredients.join(',');
        const queryParams = {
            includeIngredients: formattedIngredients,
            cuisine: cuisine || '',
            number: 20,
            apiKey: TEST_API_KEY
        };

        const response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", { params: queryParams });

        return res.status(200).json({
            recipes: response.data.results,
            totalResults: response.data.totalResults
        });
    } catch (err) {
        console.error("Failed to fetch recipes:", err.message || err);
        return res.status(500).json({ error: "Failed to fetch recipes from API." });
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
