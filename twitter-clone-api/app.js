const express = require('express');
const Twitter = require('./helpers/twitter') ;

const twitter = new Twitter() ;
const app = express() ;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

const port = process.env.PORT || 3000 ;

app.get('/tweets' , (req, res) => {
  const query = req.query.q ;
  const count = req.query.count ;
  console.log("hitted");
  twitter.get(query , count).then((response) => {
    res.status(200).send(response.data) ;
  }).catch((err) => {
    res.status(400).send(err) ;
  });
})

app.listen(port , () => console.log(`Twitter API Listening on ${port}`));
