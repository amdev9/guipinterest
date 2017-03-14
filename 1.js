
var iterator = 0;
var pin_array = [1,2,3,5];
var promiseWhile = function(action) {
  return new Promise(function(resolve, reject) {
    var func = function(iterator) {
      if (iterator) {
        console.log(iterator)
      }
      if ( iterator >= pin_array.length) { 
        return reject(new Error("stop"));
      }
      return Promise.resolve(action())
        .then(func)
        .catch(function() {
          reject();
        });
    }
    process.nextTick(func)
  })
}

promiseWhile(function() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(iterator);
      iterator++;
    }, 1000);
  });
}).catch(function (err) {
  if(err.message == 'stop') {
    
    console.log('stop')
  } else {
    console.log(err.message);
  }
});