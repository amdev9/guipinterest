/////////////////////
// jquery validate //
/////////////////////

$(function() {

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


  $("#edit_form").validate({
    rules: {
      username: "required",
      password: "required",
    },
    messages: {
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