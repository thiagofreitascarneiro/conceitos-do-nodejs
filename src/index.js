const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;

   const usernameExist = users.find((value) => value.username === username)

   if(!usernameExist) {
     return response.status(404).json({ error: 'user already exists!'})
   }

   // utilizei o request abaixo para passar para demais rotas que usarem o midleware
   request.usernameExist = usernameExist;

   return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExist = users.find((value) => 
    value.username === username)

 if(usernameExist) {
   return response.status(404).json(
     { error: 'user already exists!'})
 }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: []  
  });

  return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  //aqui eu pego o request usernameExist do midleware
  const { usernameExist } = request;

  return response.json(usernameExist.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { usernameExist } = request; 

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  usernameExist.todos.push(todoOperation);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.listen(4444);

module.exports = app;