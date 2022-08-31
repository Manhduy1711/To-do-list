const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolist", {useNewUrlParser: true});

const itemsShema = new mongoose.Schema({
    name: String
})
const Item = mongoose.model("Item", itemsShema)
const item1 = new Item ({
    name: "Wake up"
})

const item2 = new Item ({
    name: "Buy food"
})

const item3 = new Item ({
    name: "Make lunch"
})

const defaultItems = [item1,item2,item3]

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsShema]
})

const list = mongoose.model("List", listSchema);


var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit"
}
var today = new Date();
var day = today.toLocaleDateString("en-US", options);

app.get("/" , function(req, res) {
    
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany([defaultItems], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully");
                }
            })
            res.redirect("/");
        } else {
            res.render("index", {kindOfDay: day, ListItems : foundItems});
        }
    })
});

app.get("/favicon.ico", function(req,res) {
    res.status(204);
})

app.get("/:catalogue", function(req, res) {
    const  catalogue = _.capitalize(req.params.catalogue);
    console.log(catalogue)
    list.findOne({name: catalogue}, function(err, result) {
        if(!err) {
            if(!result) {
                const newList = new list({
                    name: catalogue,
                    items: defaultItems
                })
                newList.save(function(err) {
                    if(!err) {
                        res.redirect("/" + catalogue)
                    }
                })
            } else {
                res.render("index", {kindOfDay: catalogue, ListItems: result.items})
            }
        }
    })
})
app.post("/", function(req,res) {
    const listName = req.body.list;
    const newItem = new Item ({
        name: req.body.addItem
    });
    if (listName === day) {
        newItem.save();
        res.redirect("/");
    }
    else {
        list.findOne({name: listName}, function(err, foundList) {
            if(!err) {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listName);
            }
        })
    }
})

app.post("/delete", function(req,res) {
    const listName = req.body.listName;
    if (listName === day) {
        Item.findByIdAndDelete(req.body.checkbox, function(err) {
            if(!err) {
                console.log("Sucessfully")
            }
        });
        res.redirect("/");
    } else {
        list.findOneAndUpdate({name: listName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundList) {
            if(!err) {
                res.redirect("/" + listName);
            }
        })
    }
})
app.listen(3000, function (){
    console.log("Server is up and running on port 3000!");
})