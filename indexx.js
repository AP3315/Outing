// Made for git

import express from "express";
import axios from 'axios'
import env from 'dotenv'

env.config();

const app= express();
const port= process.env.port_env;


app.use(express.urlencoded({extended:true})); 
app.use(express.static('public')); 


app.get('/', (req,res)=>{
    res.render('index.ejs');
})

app.post('/uv', async (req,res)=>{
    try{
        console.log(req.body);
        var lat=req.body.lat, log=req.body.log;
        if(lat<-90 || lat>90){
            throw 'Error: Latitude should be in range [-90, 90].';
        }
        if(log<-180 || log>180){
            throw 'Error: Longitude should be in range [-180, 180].';
        }

        const responseUV=await axios.get(
            // `https://api.openuv.io/api/v1/uv?lat=${req.body.lat}&lng=${req.body.log}`,
            'https://api.openuv.io/api/v1/uv', 
            {
                params:{
                    lat:req.body.lat,
                    lng:req.body.log
                },
                headers:{
                    'x-access-token':process.env.token_env
                }
            }
        );


        const dataUV=responseUV.data
        const uv=dataUV.result.uv;
        // res.send(dataUV.result.uv);
        // console.log(typeof(uv));
        console.log(uv);

        var message;
        if(uv<3){
            message=`Seems like its sunset or sunrise, if around sunset then well good
            otherwise you may need something to protect you from sun.`;
        }
        else if(uv>=3 && uv<6){
            message=`Little risk of harm from unprotected sun exposure, 
            but seek shade during midday for long periods.`
        }
        else if(uv>=6 && uv<8){
            message=`High risk of harm from unprotected sun exposure.`
        }
        else if(uv>=8 && uv<11){
            message=`Very high risk of harm from unprotected sun exposure.`
        }
        else if(uv>=11){
            message=`Extremely high risk of harm from unprotected sun exposure.`
        }

        // 2nd 
        // const responseZone=await axios.get(
        //     'https://timeapi.io/api/Time/current/coordinate',
        //     {
        //         params:{
        //             latitude:req.body.lat,
        //             longitude:req.body.log
        //         }
        //     }
        // );

        // const dataZone=responseZone.data;
        // console.log(dataZone);

        // 3rd 
        const responseWthr=await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params:{
                    lat:req.body.lat,
                    lon:req.body.log,
                    appid: process.env.appId_env,
                    units:'metric'
                }
            }
        );

        var dataWthr=responseWthr.data;
        console.log(dataWthr);
        // res.send(dataWthr);

        // 4th bekar hai ye
        // const responseForecast=await axios.get(
        //     'https://api.openweathermap.org/data/2.5/forecast',
        //     {
        //         params:{
        //             lat:req.body.lat,
        //             lon:req.body.log,
        //             appid: "7757fc7fd537737ec0ef10a2f5a3d118",
        //             units:'metric'
        //         }
        //     }
        // );

        // var dataForecast=responseForecast.data;
        // res.send(dataForecast);

        res.render('index.ejs', {
            // from 1st
            uv,
            message,

            // from 2nd
            // timeZone:dataZone.timeZone,

            // from 3rd
            description:dataWthr.weather[0].description,
            temp:dataWthr.main.temp,
            location:dataWthr.name+', '+dataWthr.sys.country
        })  
    } 
    catch(err){
        res.render('index.ejs', {err});
        // res.send(err.message);
    }
});



app.get('/location', (req,res)=>{
    res.render('latlong.ejs');
    // res.send('hello');
})

app.post('/places', async (req, res)=>{
    // res.send('hello');
    // console.log(req.body.location);
    try{
        const responseLoc= await axios.get('https://geocoding-api.open-meteo.com/v1/search',
            {
                params:{
                    name:req.body.location,
                    count:10
                }
            }
        );
        // console.log(responseLoc.data);
        // console.log(responseLoc.data.results);
        // res.json(responseLoc.data.results);
        if(responseLoc.data.results===undefined){
            res.render('latlong.ejs', {loc: req.body.location, e:'Not found'})
        }
        else{
            res.render('latlong.ejs', {loc: req.body.location, locData: responseLoc.data.results})
        }   
    }
    catch(err){
        res.sendStatus(500).json({error:err.message})
    }

     
    // res.render('latlong.ejs');
})


app.listen(port, ()=>{
    console.log(`server started at port ${port}.`)
})



