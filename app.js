//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDb",{useNewUrlParser:true,useUnifiedTopology:true});

const itemsSchema= ({
  name:String
});

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List= mongoose.model("List",listSchema);

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item ({
  name:"Buy food"
});
const item2=new Item ({
  name:"cook food"
});
const item3=new Item ({
  name:"eat food"
});

const defaultItems = [item1,item2,item3];
//
items=[]
Item.find({},function(err,result){
  if(err){
    console.log(err);
  }
  else{
    console.log(result);
    if(result.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Inserted");
        }
      })
    }}});

app.get("/", function(req, res) {
      Item.find({},function(err,result){
        if(err){
          console.log(err);
        }
        else{
          if(result.length==0){
            Item.insertMany(defaultItems,function(err){
              if(err){
                console.log(err);
              }else{
                console.log("Inserted");
              }
            })
          }
          result.forEach(function(element){
            items.push(element.name)
          });
          res.render("list", {listTitle: "today", newListItems: items});
          items=[]
        }
      });
      console.log(items);
});


app.post("/delete",function(req,res){
  const listTitle=req.body.listName
  if(listTitle==="today"){
  Item.deleteOne({name:req.body.checkbox},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Deleted");
      res.redirect("/");
    }
  })}
  else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{name:req.body.checkbox}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listTitle);
      }
    })
  }
  console.log(req.body);
})


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const list=req.body.list;
  const item1=new Item ({
    name:itemName
  });
  if(list==="today"){
    item1.save();
    res.redirect("/");
  }
  else{
  List.findOne({name:list},function(err,foundList){
    foundList.items.push(item1);
    foundList.save();
    res.redirect("/"+list);

  })}
});

app.get("/:id", function(req,res){
  const customListName=(req.params.id);
  List.findOne({name:customListName},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      if(result==null){
        //console.log("Dosent exists");
        const list=new List({
          name:customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //console.log(customListName +" exists");
        itemsSend=[]
        result.items.forEach(function(element){
          itemsSend.push(element.name)
        });
        res.render("list",{listTitle:customListName,newListItems:itemsSend})
      }
      console.log(result);
    }
  })



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
