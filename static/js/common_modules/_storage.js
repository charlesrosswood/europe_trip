// Feature test for storage
var hasStorage = function() {
  try {
    var mod = 'europe2015';
    localStorage.setItem(mod, mod);
    localStorage.removeItem();
    return true;
  } catch (exception) {
    return false;
  }
};

exports.hasStorage = hasStorage;