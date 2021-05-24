const express = require('express');
const cors = require('cors');
const router = express();

const ip = "localhost";
const port = 3000;


router.use(cors({
  origin: '*'
}));

router.use(express.static(__dirname + '/js'));


const homeController = require("./controllers/homeController.js");

router.use("/", homeController);


router.listen(port, ip, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
