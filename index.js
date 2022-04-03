const express = require('express');

const PORT = process.env.PORT || 5000

const app = express();

app.get('/', (req,res) =>{
    res.send('Hello, world!');
});

app.listen(port,()=>{console.log(`Starto il server sulla porta: ${port}!`)});