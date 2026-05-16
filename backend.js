const express = require("express");
const session = require("express-session");
const app = express();
const route = express.Router();
const axios=require("axios");

const users = [];
const books = [
  {
    id: 1,
    isbn: "9783161484100",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    reviews: {
      "john_doe": "Amazing story, loved the characters!",
      "alice123": "Classic literature, a must-read."
    }
  },
  {
    id: 2,
    isbn: "9780452284234",
    title: "1984",
    author: "George Orwell",
    reviews: {
      "mark89": "Chilling and thought-provoking.",
      "sara_k": "A dystopian masterpiece."
    }
  }
];

app.use(express.json());
app.use(session({
  secret: "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Middleware to protect routes except register/login
function authenticatelogin(req, res, next) {
  if (req.path === "/register" || req.path.startsWith("/login")) {
    return next(); // allow public routes
  }

  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
}

// Mount router with middleware
app.use("/books", authenticatelogin, route);



// Welcome
app.get("/", (req, res) => {
  res.send("welcome");
});

// Task1
route.get("/", (req, res) => {
  res.json(books);
});

// Task2
route.get("/isbn/:isbn", (req, res) => {
  const bookisbn = req.params.isbn;
  const find = books.find(book => book.isbn === bookisbn);
  if (find) res.json({ message: "book is found", book: find });
  else res.json({ message: "book is not found" });
});

// Task3
route.get("/author/:author", (req, res) => {
  const bookauthor = req.params.author.toLowerCase().trim();
  const find = books.filter(book =>
    book.author.toLowerCase().trim().includes(bookauthor)
  );
  if (find.length > 0) res.json({ message: "book is found", book: find });
  else res.json({ message: "book is not found" });
});

// Task4
route.get("/title/:title", (req, res) => {
  const booktitle = req.params.title.toLowerCase().trim();
  const find = books.filter(book =>
    book.title.toLowerCase().trim().includes(booktitle)
  );
  if (find.length > 0) res.json({ message: "book is found", book: find });
  else res.json({ message: "book is not found" });
});

// Task5
route.get("/review/:id", (req, res) => {
  const bookid = parseInt(req.params.id);
  const find = books.find(book => book.id === bookid);
  if (find) res.json({ message: "book is found", review: find.reviews });
  else res.json({ message: "book is not found" });
});

// Task6: register 
route.post("/register", (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.json({ message: "User registered", user: newUser });
  
});

// Task7: login (public)
route.get("/login/:email/:pwd", (req, res) => {
  const email = req.params.email;
  const password = req.params.pwd;
  const find = users.find(user => user.email === email && user.password === password);
  if (find) {
    req.session.user = find; 
    res.json({ message: "login successful" });
  } else {
    res.json({ message: "wrong username or password" });
  }
});

//task8

route.post("/review/:id/:text",(req,res)=>{
  const bookid=parseInt(req.params.id);
  const reviewtext=req.params.text
  const find=books.find((book)=>book.id===bookid);
  if(find){
    find.reviews[req.session.user.name] = reviewtext;
    res.json({message:"book found",review:find.reviews})
  
  }else{
    res.json({message:"no book found"})
  }
})


// task9

route.delete("/delete/:id",(req,res)=>{
  const index=books.findIndex((book)=>book.id=req.params.id);
  if(index!==-1){
    const deleted=books.splice(index,1);
    res.json({message:"book deleted",deleted})
   
  }else{
    res.json({message:"book not found"});
  }
})

//Task10
route.put("/update/:id",(req,res)=>{
  const book=books.find((book)=>book.id===parseInt(req.params.id))
  if(book){
    Object.assign(book,req.body);
    res.json({message:"book updated",book:book})
  }else{
    res.json({message:"book not found"});
  }
})

route.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});
// task10

async function getallbooks(){
  try{
  const url =await  axios.get(`http://localhost:3000/books` );
  console.log("response is  "+ response.data);
  }catch(err){
    console.error(err);
  }
}
// task11
function searchbyisbn(isbn){
  axios.get(`http://localhost:3000/books/isbn/${isbn}`)
  .then(response=>console.log(response.data))
  .catch(err=>console.error(err));
}
// task12
function searchbyauthor(author){
   axios.get(`http://localhost:3000/books/author/${author}`)
  .then(response=>console.log(response.data))
  .catch(err=>console.error(err));
}
// task13
function searchbytitle(title){
   axios.get(`http://localhost:3000/books/title/${title}`)
  .then(response=>console.log(response.data))
  .catch(err=>console.error(err));
}



// Start server
app.listen(3000, () => {
  console.log("Listening at http://localhost:3000");
});
