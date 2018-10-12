var fqdn = require("../index"),
    should = require("should");

describe('fqdn', function(){
  describe('async', function(){
    it('should return the fqdn', function(done){
      fqdn(function(err, res){
        should.exist(res);
        done(err);
      });
    });
  });

  describe('sync', function(){
    it('should return the fqdn', function(done){
      should.exist(fqdn());
      done();
    });
  });
});
