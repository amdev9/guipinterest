/////////////////////
// jquery validate //
/////////////////////

$(function() {

  $("#create_accounts_form").validate({
    rules: {
      proxy_file: "required",
      output_file: "required",
      reg_count: "required",
      parsed_own_emails: "required",
      reg_timeout: "required"
    },
    messages: {
      proxy_file: "Выберите файл",
      output_file: "Выберите файл",
      reg_count: "Введите кол-во",
      parsed_own_emails: "Введите почты для регистрации",
      reg_timeout: "Введите задержку"
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',

    submitHandler: function(form) {
      completeTask('create_accounts');
    }
  });



  $("#add_accounts_form").validate({
    rules: {
      add_acc_txt_file: "required",
    },
    messages: {
      add_acc_txt_file: "Выберите файл",
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',
    submitHandler: function(form) {
      parseDataFileToArray('add_acc_txt_file');
    }
  });
 

  $("#parse_concurrents_form").validate({
    rules: {
      parsed_accounts: "required",
      concur_parsed: "required",
      radio_follow: "required",
      from_one: "required",
    },
    messages: {
      parsed_accounts: "Выберите файл",
      concur_parsed: "Введите имена аккаунтов для парсинга",
      radio_follow: "",
      from_one: "Введите кол-во"
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',  // 'help-block',

    submitHandler: function(form) {
      completeTask('parse_concurrents');
    }
  });


  $("#filtration_form").validate({
    rules: {
      proxy_file: "required",
      forFilterFile: "required",
      followers_from: "required",
      followers_to: "required",
      publications_from: "required",
      publications_to: "required",
      subscribers_from: "required",
      subscribers_to: "required",
      filteredAccounts:  "required", 
    },
    messages: {
      proxy_file: "Выберите файл",
      forFilterFile: "Выберите файл",
      filteredAccounts: "Выберите файл"
    },
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-danger');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-danger');
    },
    errorElement: 'span',
    errorClass: 'form-control-feedback form-control-sm',

    submitHandler: function(form) {
      completeTask('filtration');
    }
  });

  function strInt(s) {
    var i = parseInt(s, 10);
    if( i != NaN && i.toString().length == s.length) {
      return i;
    }
  }

  function isIpBlock(number) {
    return number >= 0 && number < 256;
  }

  function ipPortFunc(ip, port) {
    var ipArray = ip.split(".");
    if(ipArray.length == 4 && ipArray.every(isIpBlock)) {} 
    else {
      return false;
    }
    var port = strInt(port);
    if(port && port > 0 && port < 65535) {} 
    else {
      return false;
    }
    return true;
  }

  $.validator.addMethod(
    "proxy_checker",
    function(proxyString, element, flag) {
      var good = true;
      var splited = proxyString.split(":");
      /*  proxy_ip:proxy_port */
      if(splited.length == 2) {
        good = ipPortFunc(splited[0], splited[1]);
      /*  proxy_name:proxy_pass:proxy_ip:proxy_port */
      } else if(splited.length == 4) { 
        good = ipPortFunc(splited[2], splited[3]);
        var name = splited[0];
        if(name.length == 0) {
          good = false;
        }
        var pass = splited[1];
      } else {
        good = false;
      }
      return this.optional(element) || good;
    },
    "Please check your input."
  );

  $("#edit_form").validate({
    rules: {
      username: "required",
      password: "required",
      proxy: {
        required: false,
        proxy_checker: true
      }
    },
    messages: {
      proxy: "Некорректный формат",
      username: "Введите логин",
      password: "Введите пароль",
    },
     highlight: function(element) {
            $(element).closest('.form-group').addClass('has-danger');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-danger');
        },
        errorElement: 'span',
        errorClass: 'form-control-feedback form-control-sm',

    submitHandler: function(form) {
      saveAccountData();
    }
  });


});