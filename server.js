const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const cors = require("cors");

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Middleware
app.use(express.json());
// Config environment
env.config();

//
mongoose.connect("mongodb+srv://swornimchhetriofficial_db_user:admin@cluster0.tvxthle.mongodb.net/?appName=Cluster0")
.then(
    () => {
        console.log("Connected to MongoDB Successfully!");

        app.listen(process.env.PORT, ()=>{
            console.log("Application started on PORT:", process.env.PORT);
        })
    }
)
.catch(
    (err) => {
        console.log(`Connection error: ${err}` );
    }
);

// Schemas
const vendorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true}
})

const itemSchema = new mongoose.Schema({
        name: {type: String, required: true},
        description: {type: String, requried: false},
        vendors: [vendorSchema]
    },
    {timestamps: true}
);

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/api/items', async (req,res) => {

    const searchTerm = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    skip = (page - 1) * limit;

    try{
        const filter = searchTerm 
        ? { name: { $regex:searchTerm, $options: "i" } }
        : {}

        const [ items, totalItems ] = await Promise.all([
            Item.find(filter).skip(skip).limit(limit),
            Item.countDocuments(filter)
        ]);

        res.json({
            items,
            currentPage: page,
            totalPages: Math.ceil(totalItems/limit),
            totalItems
        })
    res.render('index', {title: "Express"});

    }
    catch(error){
        res.status(500).json({error: error.message});   
    }

});

app.get('/api/items/:id', async (req,res) =>{

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
    }

    try{
        const item = await Item.findById(id);

        if (!item){
            res.status(404).json({error: "Item not found!"});
        }

        res.status(200).json(item);
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
})

app.post('/api/items/', async (req,res) =>{

    const { name, description, vendors } = req.body;

    if(!name || name.trim() === ""){
        return res.status(400).json({error: "Invalid/Empty name!"});
    }

    try{
        const newItem = new Item({
            name: name.trim(),
            description: description ? description.trim() : "",
            vendors: vendors || []
        });

        const savedItem = await newItem.save();

        res.status(200).json(savedItem)
    }
    catch (error){
        res.status(500).json({error: error.message});
    }
});

app.put('/api/items/:id', async (req,res)=>{

    const { id } = req.params;
    const { name, description, vendors } = req.body;

    try{
        const updatedItem = await Item.findByIdAndUpdate(id,
            {
                $set : {
                    name: name.trim(),
                    description: description? description.trim() : "",
                    vendors: vendors || [],
                }
            },
            { new: true }
        );

        if(!updatedItem){
            res.status(404).json({error: "Item not found!"});
        }

        res.status(200).json(updatedItem);

    }
    catch (error){
        res.status(500).json({error: error.message});
    }

});

app.delete('/api/items/:id', async (req,res) => {
    
    const { id } = req.params;

    try{
        const deletedItem = await Item.findByIdAndDelete(id);

        if(!deletedItem){
            res.status(404).json({error: "Item not found!"});
        }

        res.status(200).json({message: "Item deleted successfully!"});
    }
    catch (error){
        res.status(500).json({error: error.message});
    }
});

app.get('/api/analytics/', async (req,res)=>{

    try{

        const items = await Item.find();

        const summary = items.map(
            (item)=>{
                const prices = item.vendors.map((v)=>v.price);
                
                if(prices.length === 0){
                    return{
                        name: item.name,
                        vendorCount: 0,
                        minPrice: null,
                        maxPrice: null,
                        avgPrice: null,
                        cheapestVendor: "No Vendors!"
                    }
                }

                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const avgPrice = prices.reduce((total, p)=>total+p, 0) / prices.length;

                const cheapest = item.vendors.find((v)=>v.price===minPrice);

                return{
                    name: item.name,
                    vendorCount: item.vendors.length,
                    minPrice,
                    maxPrice,
                    avgPrice: Math.round(avgPrice),
                    cheapestVendor: cheapest ? cheapest.name : "-",
                };
            });

            res.status(200).json(summary);

    }
    catch(error){
        res.status(500).json({error: error.message});
    }

});