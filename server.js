const express = require('express')
const axios = require('axios');
const app = express()
const PORT = 8000
const cors = require('cors')
require('dotenv').config()  //connect .env file

let yourApiKey = process.env.KEY_NAME

app.set('view engine', 'ejs')
app.use(cors())
app.use(express.static('public'))  
app.use(express.urlencoded({ extended: true }))  //replace body parser
app.use(express.json())
 
app.get( '/' , (request , response ) => {  
  response.render('index.ejs')     
})

//ie: get requested param from user-- CIK and period
app.get('/api/:CIK/:date' , async (request, response) => {
  // set variable for parameter from user
  let cik = request.params.CIK
  let periodOfReport = request.params.date

  // run queryExample function- grab data back
  let data = await queryExample(cik,periodOfReport)
  
  response.json(  data ) 
  // response.json(  queryExample(cik,periodOfReport) )
})

// setting up API options
const getFilingsQuery = async (query) => {
     const options = {
       method: 'post',
       url: 'https://api.sec-api.io',
       headers: { Authorization: yourApiKey },
       data: query,
     };

     const { data } = await axios(options);
     return ( data );
}

// setting up API queries parameters
// ie: let periodOfReport = "2022-03-31"
// ie: let cik = '0000000'
const queryExample = async (requestedCIK,requestedPeriod) => {
    const query = {
      query: { query_string: { query: `formType:\"13F-HR\" AND NOT formType:\"13F-HR/A\" AND cik:(${requestedCIK}) AND periodOfReport:\"${requestedPeriod}\"` } },
      from: '0',
      size: '20',
      sort: [{ filedAt: { order: 'desc' } }],
    };
  
    const data = await getFilingsQuery(query); // run above function
  
    //console.log(   data['filings'][0].holdings  ); //get back the holdings info
    return (   [ data  , data['filings'][0].holdings]  ); //get back data and holdings info
};
//queryExample()


app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})