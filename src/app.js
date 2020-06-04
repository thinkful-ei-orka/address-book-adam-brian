require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV}=require('./config');
const {v4:uuid} = require('uuid');

const app = express();

//secure - last

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(cors());

const addresses = [
  {
    id: uuid(),
    firstName: 'first',
    lastName: 'last',
    address1: 'address string 1',
    address2: 'address string 2',
    city: 'city',
    state: 'state',
    zip: '30316'
  }
]

app.get('/',(req,res)=>{
  res.send('Hello, boilerplate!');
});

app.get('/address',(req,res)=>{
  res.json(addresses);
});

app.post('/address',(req,res)=>{
  const {firstName,lastName,address1,address2,city,state,zip} = req.body;
  addresses.push({id:uuid(),firstName,lastName,address1,address2,city,state,zip:String(zip)});
  res.send('Post request processed');
});

app.delete('/address/:id',(req,res)=>{
  const {id} = req.params;
  const index = addresses.find(address=>address.id===id);
  addresses.splice(index,1);
  res.send('Deleted');
});

//post
//delete



app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production'){
    response = {error: {message: 'server error'}};
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;