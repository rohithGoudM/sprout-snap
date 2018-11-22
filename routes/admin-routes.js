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

var codes = ['any_codes'];

router.get('/upload', (req, res)=>{
	res.render('upload-pic',{err: null});
});

router.post('/upload', upload.any(), (req, res)=>{

	if(codes.includes(req.body.adminCode)){
		req.files.forEach(function(file){
		var newHomepic = {			
			picName: file.filename,
			picUrl: '/uploads/'+file.filename,
			picStatus: "notFound",
			picAdmin: req.body.adminCode
		}
		new Homepic(newHomepic).save();

		});

	res.redirect('/admin/upload');
	}else{
		// fs.remove uploaded pic
	res.render('upload-pic',{err: 'You are not an admin.'});

	}
});

router.get('/:adminCode', (req, res)=>{
	Homepic.find({picStatus: "userUploadedPic", picAdmin: req.params.adminCode}, function(err, foundpics){
		res.render('admin-home',{pics:foundpics});
	});
});

router.get('/check/:picName', (req, res)=>{
	Homepic.findOne({picName: req.params.picName}, function(err, foundpic){
		res.render('admin-checkpic', {pic: foundpic});
	});
});

router.post('/checkpic/:picName',(req, res)=>{
	Homepic.findOne({picName: req.params.picName}, function(err, foundpic){
		if(req.body.adminAns == "yes"){
			Team.findOne({teamName: foundpic.picTeamName}, function(err, foundTeam){
				foundTeam.teamScore = foundTeam.teamScore + 10;
				foundTeam.save();			
			});
			foundpic.picStatus = "picFound";			
			foundpic.save();
			res.redirect('/admin/'+foundpic.picAdmin);
		}else if(req.body.adminAns == "no"){
			foundpic.picStatus = "notFound";
			foundpic.save();
			res.redirect('/admin/'+foundpic.picAdmin);
		}

		//fs.remove user.uploaded.pic
		fs.unlink(__dirname + "/../public/" +foundpic.picAnsUrl, function(err){
			console.log('removing user uploaded pic');
			if(err){
				console.log(err);
			}else{
				console.log("removed "+ foundpic.picAnsUrl);
			}
		});
	});
});

module.exports = router;