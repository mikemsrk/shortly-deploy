var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var util = require('../../lib/utility');

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


exports.findLink = function(params,callback){
  if(params === null){
    Link.find().exec(function(err,data){
      callback(data);
    });
  }else{
    Link.find()
      .where(params.query).equals(params.target)
      .exec(function(err,data){
        callback(data);
      });
  }
};

exports.createLink = function(uri,baseURL,callback){
  util.getUrlTitle(uri,function(err,title){
    if(err){
      console.log('Error reading URL heading: ', err);
      callback(404,null);
    }
    // create new link
    var link = new Link({
      url: uri,
      title: title,
      base_url: baseURL,
      visits: 0,
      code: '',
      user_id: 0
    });
    // save the thing.
    link.save(function(err){
      callback(null,link);
    });
  });
};