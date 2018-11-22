var express = require("express");
var router  = express.Router();
var fs = require('fs');
const Skill = require('../models/skill-model')
var multer  = require('multer')
var upload = multer({ dest: 'public/uploads/' })
const mongoose = require('mongoose');
var User = require("../models/user-model");
var Team = require("../models/team-model");
var Homepic = require("../models/homepics");

const authCheck = (req, res, next)=>{
	if(req.user){
		//logged in
		next();
	}else{
		//not logged in
		res.redirect('/');
	}
};

//profile home

router.get("/:teamName", authCheck, (req, res)=>{
	//coming soon
	Team.findOne({teamName: req.params.teamName}, function(err, foundTeam){
		Homepic.find({picStatus: "notFound"}, function(err, pics){
			if(foundTeam.teamCode == req.user.id){
				res.render("home",{user: req.user, creator: true,team: foundTeam, homepics: pics});
			}else{
				res.render("home",{user: req.user, creator: false, homepics: pics});
			}
		});
	});
});


// Check if taken by other user
router.get('/checking/:picName',authCheck, (req, res)=>{
	Homepic.findOne({picName: req.params.picName}, function(err, pic){
		if(pic.picStatus == "notFound"){
			pic.picStatus="checkingInProgress";
			pic.picTeamName=req.user.teamName;
			pic.save();
			res.redirect('/profile/upload/'+pic.picName);
		}else{
			res.redirect('/profile/'+req.user.teamName);
		}
	});
});

//load upload page
router.get('/upload/:picName',authCheck,(req, res)=>{
	Homepic.findOne({picName : req.params.picName},function(err, foundpic){
		Team.findOne({teamName: foundpic.picTeamName},function(error, foundTeam){			
			res.render('user-upload',{pic: req.params.picName,team:foundTeam});
		});
	});
});

//after user uploads
router.post('/upload/:picName',authCheck, upload.any(), (req, res)=>{
	Homepic.findOne({picName: req.params.picName}, function(err, pic){
		pic.picAnsName= req.files[0].filename;
		pic.picAnsUrl="/uploads/"+ req.files[0].filename;
		pic.picStatus= "userUploadedPic";
		pic.save();
	});
	res.redirect('/profile/loading/'+req.params.picName);
});

router.get('/loading/:picName',(req, res)=>{
	Homepic.findOne({picName: req.params.picName}, function(err, pic){
		Team.findOne({teamName: pic.picTeamName},function(error, foundTeam){
				if(pic.picStatus=="picFound"){
					//fs.remove admin.uploaded.pic
					fs.unlink(__dirname + "/../public/" +pic.picUrl, function(error){
						console.log('removing user uploaded pic');
						if(error){
							console.log(error);
						}else{
							console.log("removed "+ pic.picUrl);
						}
					});
					res.redirect('/profile/'+pic.picTeamName);
				}else if( pic.picStatus=="notFound"){
					res.redirect('/profile/'+pic.picTeamName);
				}else{			
					res.render('loading-page',{picName: req.params.picName,team: foundTeam});
				}
			
			});
		
	});
});


module.exports = router;