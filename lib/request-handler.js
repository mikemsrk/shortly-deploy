var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req,res){
  Link.findLink(null,function(result){
    res.send(200,result);
  });
};

exports.saveLink = function(req,res){
  var uri = req.body.url;

  if(!util.isValidUrl(uri)){
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findLink({query:'url',target:uri},function(result){
    if(result.length>0) {
      res.send(200,result);
    }
    else{
      Link.createLink(uri,req.headers.origin,function(err,link){
        if(err) res.send(err);
        res.send(200,link);
      });
    }
  });
};

exports.loginUser = function(req,res){
  var username = req.body.username;
  var password = req.body.password;

  User.findUser(username,function(data){
    if(!data.length) res.redirect('/login');
    else{
      var user = data[0];
      user.comparePassword(password,function(match){
        if(match){
          util.createSession(req,res,user);
        }else{
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req,res){
  var username = req.body.username;
  var password = req.body.password;

  User.findUser(username,function(data){
    if(!data.length){
      User.createUser(username,password,function(user){
        util.createSession(req,res,user);
      });
    }else{
      console.log('Account already exists!');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req,res){
  Link.findLink({query:'code',target:req.params[0]},function(result){
    if(!result.length) res.redirect('/');
    else{
      result[0].incrementVisit();
      return res.redirect(result[0].url);
    }
  });
};
