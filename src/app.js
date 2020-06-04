require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());
app.use(cors());

const apiToken = process.env.API_TOKEN;
function handleBearerToken(req, res, next) {
  const authToken = req.get('Authorization') || ' ';
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(400).json({ error: 'No valid bearer token provided' });
  }
  if (authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  next();
}

app.use(handleBearerToken);

const addresses = [
  {
    id: uuid(),
    firstName: 'first',
    lastName: 'last',
    address1: 'address string 1',
    address2: 'address string 2',
    city: 'city',
    state: 'ST',
    zip: '30316'
  }
];

app.get('/address', (req, res) => {
  res.json(addresses);
});

app.post('/address', (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;
  if (!address1) {
    return res.status(400).send('Address 1 is required');
  }
  if (!firstName) {
    return res.status(400).send('First name is required');
  }
  if (!lastName) {
    return res.status(400).send('Last name is required');
  }
  if (!city) {
    return res.status(400).send('City is required');
  }
  if (!state) {
    return res.status(400).send('State is required');
  }
  if (!zip) {
    return res.status(400).send('Zip code is required');
  }

  if (String(zip).length !== 5) {
    return res.status(400).send('Zip code must be 5 digits');
  }
  if (state.length !== 2) {
    return res.status(400).send('State code must only be 2 characters');
  }
  addresses.push({ id: uuid(), firstName, lastName, address1, address2, city, state, zip: String(zip) });
  res.send('Post request processed');
});

app.delete('/address/:id', (req, res) => {
  const { id } = req.params;
  const index = addresses.indexOf(address => address.id === id);
  if (!id) {
    return res.status(400).send('Please provide an id value');
  }
  if (!index) {
    return res.status(400).send('id does not match any entries');
  }
  addresses.splice(index, 1);
  res.send('Deleted');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;