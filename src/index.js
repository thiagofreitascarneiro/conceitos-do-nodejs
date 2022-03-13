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

  return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   
  const { user } = request;
  
  const { title, deadline } = request.body;
  const { id } = request.params;
 
  const todo = user.todos.find(value => value.id === id);

  if(!todo){
    return response.status(404).json({ error: "Todo not found!" })
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);

 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;


//  const todo = user.todos.filter(value => value.id === id ).
//  map(item =>  item.done = true)

 const todo = user.todos.find((todo) => todo.id === id);

 if(!todo){
   return response.status(404).json({ error: "Todo not found!" });

};

todo.done = true;

return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

 const isTodoAlreadyExists = user.todos.some(value => value.id === id)


if (!isTodoAlreadyExists) { 
  return response.status(404).json({error: "Todo not found."});
}

user.todos = user.todos.filter((todo) => todo.id !== id);

return response.status(204).json();

});


module.exports = app;