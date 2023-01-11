const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

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

// let items = [];
// let workItems = [];

app.get('/', (req, res) => {

    let day = date.getDay();

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

    const newItem = new Item({
        name: item
    });

    newItem.save();
    res.redirect('/');

    // if(req.body.list === 'Work'){
    //     workItems.push(item);
    //     res.redirect('/work');
    // } else {
    //     items.push(item);
    //     res.redirect('/');
    // }
 
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, (err) => {
        if(err){
            console.log(err);
        } else {
            console.log('Successfully deleted checked item');
            res.redirect('/');
        }
    });
});

app.get('/work',(req, res) => {
    res.render("list", {listTitle: "Work List", items: workItems});
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
