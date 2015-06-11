var bcrypt = require('bcrypt-nodejs');
var db = require('../config');
var Promise = require('bluebird');
var mongoose = require('mongoose');

db.userSchema.pre('save',function(next){
  var user = this;
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password,null,null).bind(this)
    .then(function(hash){
      console.log('Hashing password....' + hash);
      user.password = hash;
      next();
    });
});

db.userSchema.methods.comparePassword = function(attemptedPassword,callback){
  bcrypt.compare(attemptedPassword,this.password, function(err,isMatch){
    callback(isMatch);
  });
};

var User = mongoose.model('User',db.userSchema);


module.exports = User;
