var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

db.linkSchema.post('save',function(next){
  console.log('crypting url....');
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);

  var sha = shasum.digest('hex').slice(0, 5);
  this.update({code: sha},function(err,raw){
    if(err)console.log(err);
  });
});

db.linkSchema.methods.incrementVisit = function(){
  console.log('incrementing visit...');
  var link = this;
  this.update({visits: this.visits+1},function(err,raw){
    if(err)console.log(err);
  });
};

var Link = mongoose.model('Link',db.linkSchema);


module.exports = Link;
