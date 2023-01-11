const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('item', itemsSchema);

const item1 = new Item({
    name: 'Welcome to your todolist!'
});

const item2 = new Item({
    name: 'Second Task'
});

const item3 = new Item({    
    name: 'Third Task'
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model('list', listSchema);

let day = date.getDay();

app.get('/', (req, res) => {

    Item.find({}, (err, items) => {
        if(err){
            console.log(err);
        } else {
            if(items.length === 0){
                Item.insertMany(defaultItems , (err) =>{
                    if(err){
                        console.log(err);
                    } else {
                        console.log('Successfully saved default items to DB');

                    }
                });
                res.redirect('/');
            } else {
                res.render("list", {listTitle: day, items: items});
        }
    }
    });
});

app.post('/', (req, res) => {

    let item = req.body.newItem;
    let listName = req.body.list;

    const newItem = new Item({
        name: item
    });

    if(listName === day){
        newItem.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
});

app.get('/:slug',(req, res) => {
    const listName = _.capitalize(req.params.slug);

    List.findOne({name: listName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + listName);
            }
            else {
                res.render("list", {listTitle: foundList.name, items: foundList.items});
            }
        }
    });
});


app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if(err){
                console.log(err);
            } else {
                console.log('Successfully deleted checked item');
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedItemId}}}, (err, foundList) => {
            if(!err){
                res.redirect('/' + listName);
            }
        });
    }

});

app.post('/work', (req, res) => {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work');
});

app.get('/about',(req, res) => {
    res.render("about");
}); 

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
