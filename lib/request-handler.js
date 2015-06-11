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
  Link.find().exec(function(err,data){
    res.send(200, data);
  });
};

exports.saveLink = function(req,res){
  var uri = req.body.url;

  if(!util.isValidUrl(uri)){
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find()
    .where('url').equals(uri)
    .exec(function(err,data){
      if(data.length > 0){
        res.send(200,data);
      }else{
        util.getUrlTitle(uri,function(err,title){
          if(err){
            console.log('Error reading URL heading: ', err);
            return res.send(404);
          }
          // create new link
          var link = new Link({
            url: uri,
            title: title,
            base_url: req.headers.origin,
            visits: 0,
            code: '',
            user_id: 0
          });
          // save the thing.
          link.save(function(err){
            res.send(200,link);
          });
        });
      }
    });
};

exports.loginUser = function(req,res){
  var username = req.body.username;
  var password = req.body.password;

  User.find()
    .where('username').equals(username)
    .exec(function(err,data){
      if(!data.length) res.redirect('/login');
      else{
        var user = data[0];
        user.comparePassword(password,function(match){
          if(match){
            util.createSession(req,res,user);
          }else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req,res){
  var username = req.body.username;
  var password = req.body.password;

  // check if user alrdy exist
  User.find()
    .where('username').equals(username)
    .exec(function(err,data){
      if(!data.length){ // good, create user
        var user = new User({username:username,password:password});
        user.save();
        util.createSession(req,res,user);
      }else { // not good
        console.log('Account already exists!');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req,res){
  Link.find()
    .where('code').equals(req.params[0])
    .exec(function(err,data){
      if(!data.length) res.redirect('/');
      else{
        data[0].incrementVisit();
        return res.redirect(data[0].url);
      }
    });
};
