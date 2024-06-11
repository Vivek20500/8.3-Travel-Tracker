import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import { render } from "ejs";

const app = express();
const port = 3000;
const db=new pg.Client({
  user: 'postgres',
  password: 'Vivek12345',
  host: 'localhost',
  port: 5432,
  database: 'World'
}
)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
db.connect();

function impData(array){
  var row=array.rows;
  let countrydata=[];
  row.forEach(i=>{
    countrydata.push(i.country_code)
  })
  return countrydata;
}
function renderer(data,total,res,error){
  res.render('index.ejs',{
    data:data,
    total:total,
    error:error||null
  })
}

app.get("/", async (req, res) => {
  var data= await db.query("SELECT country_code FROM visited_country");
  var country=impData(data)
  var total=country.length
  console.log(country)
  renderer(country,total,res)
});


app.post("/add",async (req,res)=>{
  const userInput=req.body["country"];
  var countryList=await db.query("SELECT country_code FROM countries WHERE country_name= $1",[userInput]);
  console.log(userInput);

  if(countryList.rows.length!==0){
    var countryCode=countryList.rows[0].country_code;
    console.log(countryCode);

    var checker=await db.query("SELECT country_code FROM visited_country");
    var checkerRow=checker.rows
    // console.log(checkerRow)
    checkerRow.forEach(i=>{
      // console.log(i.country_code)
      if(i.country_code===countryCode){
        // var data=db.query("SELECT country_code FROM visited_country");
        var country=impData(checker)
        var total=country.length;
        var error="This country is already visited"
        renderer(country,total,res,error)
      }
    })
    db.query("INSERT INTO visited_country (country_code) VALUES ($1)",[countryCode])
    res.redirect('/')
  }else if(countryList.rows.length===0){
    var data=await db.query("SELECT country_code FROM visited_country");
    var row=data.rows;
    let total=row.length;
    let country=[];
    row.forEach(i=>{
      country.push(i.country_code)
    })
    var error="Country does not exist"
    renderer(country,total,res,error)
  }
  {// countryList.forEach(i=>{
  //   var searchName=i.country_name;
  //   console.log(searchName.toLowerCase())
  //   console.log(userInput.toLowerCase())
  //   if(searchName.toLowerCase()===userInput.toLowerCase()){
  //     console.log(i.country_code)
  //     total++;
  //   }
  // })
  // var data=await db.query("SELECT country_code FROM visited_country");
  // let country=[];
  // var row=data.rows;
  // var total=row.length;
  // row.forEach(i=>{
  //   country.push(i.country_code)
  // })
  // console.log(country)
  // res.render('index.ejs',{
  //   total:total,
  //   data:country
  // })
}
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
