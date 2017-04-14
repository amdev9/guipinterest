//////////////////////////////
//// SECURITY CHECK //////////
//////////////////////////////

var https = require('https')
var http = require('http')
var Promise = require('bluebird')
var Registry = require('winreg')
const crypto = require('crypto')
var config = require('./config/default')


var unique = require('node-machine-id');
var machineId = unique.machineId, machineIdSync = unique.machineIdSync;
var host = config.App.hostname

function checkLicense(cb) {
  if (process.platform == 'win32') {

    virtualCheck(cb)
      .then(function(res) {
        console.log(res)
        bios(function(obj) {

          var sendData = obj['memUserDir']+"|"+obj["BIOSVersion"]+"|"+obj["DiskEnum"]+
            "|"+obj["BIOSVendor"]+"|"+obj["SystemManufacturer"]+"|"+obj["BaseBoardManufacturer"];
          var serialKey = obj['memUserDir']+"|"+obj["BIOSVersion"]+"|"+obj["DiskEnum"];
          makePost(sendData, serialKey, cb);

        });
      })
      .catch(function(err) {
        cb('vm');
      })

  } else if (process.platform == 'darwin') {

    var obj = {};
    obj['memUserDir'] = memUserDir(); 
    obj['DiskEnum'] = os.cpus()[0].model; // os.cpus()[0].speed
    obj['BIOSVersion'] = machineIdSync({original: true});
    obj['BaseBoardManufacturer'] = '-';  
    obj['BIOSVendor'] = os.hostname(); 
    obj['SystemManufacturer'] = os.platform();
    
    var sendData = memUserDir()+"|"+obj["BIOSVersion"]+"|"+obj["DiskEnum"]+
      "|"+obj["BIOSVendor"]+"|"+obj["SystemManufacturer"]+"|"+obj["BaseBoardManufacturer"];
    var serialKey = obj['memUserDir']+"|"+obj["BIOSVersion"]+"|"+obj["DiskEnum"];
    makePost(sendData, serialKey, cb);
      
  } else {
    cb('fail')
  }
}

function makePost(sendData, serialKey, cb) {
  var options = {
    hostname: host,
    port: 80,
    path: '/api/uploader',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  callback = function(response) {
    var str = ''
    const secretSerial = 'abcdefg';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {  
      var resp = JSON.parse(str);
      console.log(resp);
      if (resp.status == 'ok') {
        var hash = sha256(sendData, secretSerial);
        if (resp.message == hash) {
          cb("ok");
        } else {
          cb("fail");
        }
      }
    });
  }

  const secretMessage = 'a password';
  var token = sha1(serialKey);
  showLicenseTokenView(token);
  var message = aes192Cipher(sendData, secretMessage);
  var postData = JSON.stringify({
    "token": token,
    "message": message
  });
  var req = http.request(options, callback);
  // console.log(postData);
  req.write(postData);
  req.end();

}

//////////////////////////////
//// WINDOWS APP SECURITY ////
//////////////////////////////

function virtualCheck(cb) {
  return new Promise(function(resolve, reject) {
    
    openWin(function(res) { // FIX find resolve point 
      if(res == 'vm') {
        reject(res);
      }
    });
    networkInt(function(res) {
      if(res == 'vm') {
        reject(res);
      } else {
        taskList(function(res) {
          if(res == 'vm') {
            reject(res);
          } else {
            resolve(res);
          }
        });
      }
    });

  })
}

function diskEnum(cb) {
  regKeyDisk = new Registry({                                       
    hive: Registry.HKLM,                                       
    key: '\\SYSTEM\\CurrentControlSet\\services\\Disk\\Enum'
  })
  regKeyDisk.values(function (err, items ) {
  if (err)
    console.log('ERROR: ' + err);
  else
    for (var i = 0; i < items.length; i++) {
      if (items[i].name == '0') {
        cb(items[i].value);
      }
    }
  });
}

function regParams(cb) {
  regKeyBIOS = new Registry({                                       
    hive: Registry.HKLM,                                       
    key: '\\HARDWARE\\DESCRIPTION\\System\\BIOS'
  })
  regKeyBIOS.values(function (err, items ) {
    if (err) {
      console.log('ERROR: ' + err);
    } else {
      cb(items)
    }
  });
 
}

function memUserDir() {
  return os.totalmem() + '|' + os.userInfo().username + "|" + os.userInfo().homedir;
}

function bios(cb) {
  var obj = {};
  obj['memUserDir'] = memUserDir();
  diskEnum(function(val) {
    obj['DiskEnum'] = val;
    regParams(function(items) {

      if (items.length == 0) { 
        obj['BaseBoardManufacturer'] = '-';
        obj['BIOSVendor'] = '-';
        obj['SystemManufacturer'] = '-';
        obj['BIOSVersion'] = '-';
        cb(obj); 
      }

      for (var i = 0; i < items.length; i++) {
        if (items[i].name == 'BaseBoardManufacturer') {
          obj['BaseBoardManufacturer'] = items[i].value;
        } else if (items[i].name == 'BIOSVendor') {
          obj['BIOSVendor'] = items[i].value;
        } else if (items[i].name == 'SystemManufacturer') {
          obj['SystemManufacturer'] = items[i].value;
        } else if (items[i].name == 'BIOSVersion') {
          obj['BIOSVersion'] = items[i].value;
        }
        if (i == (items.length - 1)) {
          if (!obj['BaseBoardManufacturer']) {
            obj['BaseBoardManufacturer'] = '-';
          } else if(!obj['BIOSVendor']) {
            obj['BIOSVendor'] = '-';
          } else if(!obj['SystemManufacturer']) {
            obj['SystemManufacturer'] = '-';
          } else if(!obj['BIOSVersion']) {
            obj['BIOSVersion'] = '-';
          }
          cb(obj);
        }
      } 
    });
  });
}
 
function taskList(erback) {
  var exec = require('child_process').exec;
  var vm_task_arr = [ 
    'VirtualBox',
    'VBoxTray.exe',
    'VBoxService.exe',
    'Parallels',
    'Workstation',
    'prl_cc.exe',
    'prl_tools.exe',
    'SharedIntApp.exe',
    'Virtual',
    'PC',
    'vmusrvc.exe',
    'vmsrvc.exe',
    'VMware',
    'Workstation',
    'vmtoolsd.exe' ];
  exec('tasklist', function(err, stdout, stderr) {
    vm_task_arr.forEach( function (item, i, arr) {
      if (stdout.indexOf(item) > 0) {
        erback('vm')
      }  
      if (i == arr.length - 1 ) {
        erback('ok')
      }
    });
  });
}

function networkInt(erback) { // on last key resolve
  var key;
  for(key in os.networkInterfaces()) {
    var vm_mac_arr = [
      '00:05:69', '00:0c:29', '00:1c:14', '00:50:56',   // VMware (VMware Workstation)
      '00:03:ff', '00:0d:3a', '00:50:f2', '7c:1e:52', 
      '00:12:5a', '00:15:5d', '00:17:fa', '28:18:78', 
      '7c:ed:8d', '00:1d:d8', '00:22:48', '00:25:ae', 
                              '60:45:bd', 'Dc:b4:c4',   // Microsoft (Virtual PC) 
                                          '08:00:20',   // Oracle (VirtualBox) 
                                          '00:1c:42'];  // Parallels (Parallels Workstation)
    if(vm_mac_arr.indexOf(os.networkInterfaces()[key][0].mac.substring(0,8) ) > 0 ) {
      erback("vm");
    }  
  }
  if (key !== undefined) { // There was at least one element
    erback("ok"); 
  }
}

function openWin(erback) { // resolve add
  var vm_open = [
    'VBoxTrayToolWndClass', 
    'CPInterceptor',  
    'DesktopUtilites', 
    'VMSwitchUserControlClass', 
    'prl.tools.auxwnd', 
    '0843FD01-1D28-44a3-B11D-E3A93A85EA96'
  ];
  var ref = require('ref');
  var ffi = require('ffi');
  var voidPtr = ref.refType(ref.types.void);
  var stringPtr = ref.refType(ref.types.CString);
  var user32 = ffi.Library('user32.dll', {
    EnumWindows: ['bool', [voidPtr, 'int32']],
    GetWindowTextA: ['long', ['long', stringPtr, 'long']]
  });
  windowProc = ffi.Callback('bool', ['long', 'int32'], function(hwnd, lParam) {
    var buf, name, ret;
    buf = new Buffer(255);
    ret = user32.GetWindowTextA(hwnd, buf, 255);
    name = ref.readCString(buf, 0);
    if (vm_open.indexOf(name) > 0) {
      erback('vm');
    }
    return true;
  });
  user32.EnumWindows(windowProc, 0);
}

String.prototype.hexEncode = function() {
  var hex, i;
  var result = "";
  for (i = 0; i < this.length; i++) {
      hex = this.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
  }
  return result
}

String.prototype.hexDecode = function(){
  var j;
  var hexes = this.match(/.{1,4}/g) || [];
  var back = "";
  for(j = 0; j < hexes.length; j++) {
      back += String.fromCharCode(parseInt(hexes[j], 16));
  }
  return back;
}

function sha256(serialKey, secret) {
  const hash = crypto.createHmac('sha256', secret)
                     .update(serialKey)
                     .digest('hex');
  return hash;
}

function aes192Cipher(finalString, secret) {
  const cipher = crypto.createCipher('aes192', secret);
  let encrypted = cipher.update(finalString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function sha1(toHashString) {
  shasum = crypto.createHash('sha1');
  shasum.update(toHashString);
  return shasum.digest('hex');
}

