var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user-model");
var Team = require("../models/team-model");

const authCheck = (req, res, next)=>{
  if(req.user){
    //logged in
    next();
  }else{
    //not logged in
    res.redirect('/');
  }
};


//root route
router.get("/", function(req, res){
  res.render("signIn");

});

router.get("/leaderboard",(req, res)=>{
  Team.find({},
    ['teamName','teamScore'],
    {
      skip: 0,
      sort:{
        teamScore: -1
      }
    },
      function(err, teams){
        res.render('leaderboard',{teams: teams});
  });
});

router.get("/team",authCheck, (req, res)=>{
  if(req.user.teamName){
    res.redirect("/profile/"+req.user.teamName);
  }else{
    res.render("team",{err: false});
  }

});

router.post("/createTeam", (req, res)=>{

  Team.findOne({teamName: req.body.teamName}, function(foundTeam){
    if(foundTeam){
      res.render("team", {err: 'This team already exists. Try another One'});
    }else{
      req.user.teamName = req.body.teamName;
      req.user.save();
      new Team({
        teamName: req.body.teamName,
        teamCode: req.user.id,
        teamScore: 0,
        noOfMem: 1

      }).save();
    res.redirect("/profile/"+req.user.teamName);
    }
  });
});

router.post("/joinTeam", (req,res)=>{
  Team.find({teamCode: req.body.teamCode}, function(foundTeam){
      if(foundTeam){
        if(foundTeam.noOfMem < 3){
          req.user.teamName = foundTeam.teamName;
          req.user.save();
          foundTeam.noOfMem = foundTeam.noOfMem + 1;
          foundTeam.save();
          res.redirect("/profile/"+req.user.teamName);
        }else{
          res.render("team", {err: 'This team already has 3 members. Choose another team or create your own.'});
        }
      }else{
        res.render("team", {err: 'This team doesn\'t exist. Check your teamcode'});
      }
  });
});

router.get("/privacyPolicy",(req,res)=>{
  res.render('signIn');
});
router.get("/termsofService",(req,res)=>{
  res.render('signIn');
});


module.exports = router;