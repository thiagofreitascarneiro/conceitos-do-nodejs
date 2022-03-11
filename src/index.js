const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;

   const user = users.find((value) => value.username === username)

   if(!user) {
     return response.status(404).json({ error: 'user already exists!'})
   }

   // utilizei o request abaixo para passar para demais rotas que usarem o midleware
   request.user = user;

   return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExist = users.find((value) => 
    value.username === username)

 if(usernameExist) {
   return response.status(400).json(
     { error: 'user already exists!'})
 }

 const user = {
    id: uuidv4(),
    name,
    username,  
    todos: []  
  };

  users.push(user)

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  //aqui eu pego o request usernameExist do midleware
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request; 

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todoOperation);

  return response.status(201).send(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   
  const { user } = request;
  
  const { title, deadline } = request.body;
  const { id } = request.params;
  console.log(id)

  const todo = user.todos.find(value => value.id === id);

  if(!todo){
    return response.status(404).send('Item do not exists!')
  }

user.todos.map(value => {
  if (value.id === id) {
  value.title = title
  value.deadline =  new Date(deadline)

  return response.status(201).json(user.todos);

} 
  
});
 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;


 const todo = user.todos.filter(value => value.id === id ).
 map(item =>  item.done = true)

 if(!todo){
  return response.status(404).send('Item do not exists!')
}

 return response.json(user.todos);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

 const todo = user.todos.filter(value => value.id !== id)

 console.log(todo)

if (todo) { 
  return response.status(204).json(user.todos);
} else {
  return response.status(404).json({error: "todo not found."});
}

});


module.exports = app;