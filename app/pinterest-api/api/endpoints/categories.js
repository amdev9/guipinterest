const querystring = require('querystring');

function Categories() {}
module.exports = Categories;
var Request = require('../request');

Categories.get = function(session) {
  var data = {
    "browsable_only": "True",
    "add_fields": "category.images[45x,200x]",
    "category_types": "main,non_board,commerce",  
  };
  return new Request(session)
    .setMethod('GET')
    .setResource('categories', { params: querystring.stringify(data) })
    .send();
}
