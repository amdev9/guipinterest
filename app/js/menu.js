
function clickInsideElement( e, className ) {
  var el = e.srcElement || e.target;
  if ( el.classList.contains(className) ) {
    return el;
  } else {
    while ( el = el.parentNode ) {
      if ( el.classList && el.classList.contains(className) ) {
        return el;
      }
    }
  }
  return false;
}

function getPosition(e) {
  var posx = 0;
  var posy = 0;
  if (!e) var e = window.event;
  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return {
    x: posx,
    y: posy
  }
}

var contextMenuLinkClassName = "context-menu__link";
var contextMenuActive = "context-menu--active";
var taskItemClassName = "content";
var taskItemInContext;
var clickCoords;
var clickCoordsX;
var clickCoordsY;
var menu = document.querySelector("#context-menu");
var menuState = 0;
var menuWidth;
var menuHeight;
var windowWidth;
var windowHeight;

/**
 * Initialise our application's code.
 */
function init() {
  contextListener();
  clickListener();
  keyupListener();
  resizeListener();
}

/**
 * Listens for contextmenu events.
 */
function contextListener() {
  document.addEventListener( "contextmenu", function(e) {
    e.preventDefault();
    toggleMenuOn();
    positionMenu(e);
  });
}

/**
 * Listens for click events.
 */
function clickListener() {
  document.addEventListener( "click", function(e) {
    var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );
    if ( clickeElIsLink ) {
      e.preventDefault();
      menuItemListener( clickeElIsLink );
    } else {
      var button = e.which || e.button;
      if ( button === 1 ) {
        toggleMenuOff();
      }
    }
  });
}

/**
 * Listens for keyup events.
 */
function keyupListener() {
  window.onkeyup = function(e) {
    if ( e.keyCode === 27 ) {
      toggleMenuOff();
    }
  }
}

/**
 * Window resize event listener
 */
function resizeListener() {
  window.onresize = function(e) {
    toggleMenuOff();
  };
}

/**
 * Turns the custom context menu on.
 */
function toggleMenuOn() {
  if ( menuState !== 1 ) {
    if (!taskItemInContext || !taskItemInContext[0] ) {
      selectEmptyMenuOn();
    } else if (taskItemInContext.length == 1) {
      if($(".table-info").find("td").eq(2).html() == '-') {
        selectOneNoTaskMenuOn();
      } else if ($(".table-info").find("td").eq(1).html() == '-' && $(".table-info").find("td").eq(0).html() == '-') {
        selectTaskMenuOn();
      } else {
        selectUserTaskMenuOn();
      }
    } else if (taskItemInContext.length > 1) {
      multipleMenuOn(taskItemInContext);
    }
    menuState = 1;
    menu.classList.add( contextMenuActive );
  }
}

function multipleMenuOn(taskItems) {
  // console.log("multipleMenuOn");
  var toHideItems = ['tasks_start', 'tasks_stop' , 'edit_account', 'add_tasks', 'edit_tasks'];
  var filled = true;
  $(".table-info").each(function (i, val) {
    if ( $(this).find("td").eq(2).html() == '-') {
      filled = false;
    }
  });
  if (filled) {
    var stopFlag = true;
    for (var t =0; t < taskItems.length; t++ ) {
      if (taskItems[t].getAttribute("state") != 'stopped') {
        stopFlag = false;
        break;
      }  
    }
    if (stopFlag == true) {
       toHideItems = ['tasks_stop', 'edit_account', 'add_tasks', 'edit_tasks'];
    } else {
       toHideItems = ['tasks_start', 'edit_account', 'add_tasks', 'edit_tasks'];
    }
  }
  var checkFlag = true;
  for (var k =0; k < taskItems.length; k++ ) {
    if (taskItems[k].getAttribute("type") == 'task') {
      checkFlag = false;
      break;
    }  
  }
  var checkArray = [];
  if (!checkFlag) {
    checkArray = ['check_accounts'];
  }
  var toHideItems = toHideItems.concat(checkArray);
  $('.context-menu__item > a').each(function(i, val) {
    if( toHideItems.indexOf($(this).attr("data-action") ) !== -1 ) {
      $('.context-menu__item').eq(i).addClass("hidden");
    }
  });
}

function selectUserTaskMenuOn() {
  // console.log("selectUserTaskMenuOn");
  var additionalItemsToHide = [];
  var state = taskItemInContext[0].getAttribute("state");
  if ( state == 'run' ) {
    additionalItemsToHide = ['tasks_start'];
  } else if (state == 'stop') {
    additionalItemsToHide = ['tasks_start', 'tasks_stop'];
  } else if (state == 'stopped') {
    additionalItemsToHide = ['tasks_stop'];
  }
  var toHideItems = [].concat(additionalItemsToHide);
  $('.context-menu__item > a').each(function(i, val) {
    if( toHideItems.indexOf($(this).attr("data-action") ) !== -1 ) {
      $('.context-menu__item').eq(i).addClass("hidden");
    }
  });
}

function selectTaskMenuOn() {
  // console.log("selectTaskMenuOn");
  var additionalItemsToHide = [];
  var state = taskItemInContext[0].getAttribute("state");
  if ( state == 'run' ) {
    additionalItemsToHide = ['tasks_start'];
  } else if (state == 'stop') {
    additionalItemsToHide = ['tasks_start', 'tasks_stop'];
  } else if (state == 'stopped') {
    additionalItemsToHide = ['tasks_stop'];
  }
  var toHideItems = ['edit_account', 'add_tasks', 'check_accounts'].concat(additionalItemsToHide);
  $('.context-menu__item > a').each(function(i, val) {
    if( toHideItems.indexOf($(this).attr("data-action") ) !== -1 ) {
      $('.context-menu__item').eq(i).addClass("hidden");
    }
  });
}

function selectOneNoTaskMenuOn() {
  // console.log("selectOneNoTaskMenu");
  $('.context-menu__item > a').each(function(i, val) {
    if($(this).attr("data-action") == 'tasks_start' || $(this).attr("data-action") == 'tasks_stop' || $(this).attr("data-action") == 'edit_tasks') {
      $('.context-menu__item').eq(i).addClass("hidden");
    }
  });
}

function selectEmptyMenuOn() {
  // console.log("selectEmptyMenuOn");
  $('.context-menu__item > a').each(function(i, val) {
    if($(this).attr("data-action") != 'add_tasks' && $(this).attr("data-action") != 'add_accounts') {
      $('.context-menu__item').eq(i).addClass("hidden");
    }
  });
}

function selectEmptyMenuOff() {
  // console.log("selectEmptyMenuOff"); 
  $('.context-menu__item > a').each(function(i, val) {
    $('.context-menu__item').eq(i).removeClass("hidden");
  });
}

/**
 * Turns the custom context menu off.
 */
function toggleMenuOff() {
  if ( menuState !== 0 ) {
    selectEmptyMenuOff();
    menuState = 0;
    menu.classList.remove( contextMenuActive );
  }
}

/**
 * Positions the menu properly.
 * 
 * @param {Object} e The event
 */
function positionMenu(e) {
  clickCoords = getPosition(e);
  clickCoordsX = clickCoords.x;
  clickCoordsY = clickCoords.y;
  menuWidth = menu.offsetWidth + 4;
  menuHeight = menu.offsetHeight + 4;
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  if ( (windowWidth - clickCoordsX) < menuWidth ) {
    menu.style.left = windowWidth - menuWidth + "px";
  } else {
    menu.style.left = clickCoordsX + "px";
  }
  if ( (windowHeight - clickCoordsY) < menuHeight ) {
    menu.style.top = windowHeight - menuHeight + "px";
  } else {
    menu.style.top = clickCoordsY + "px";
  }
}

/**
 * Dummy action function that logs an action when a menu item link is clicked
 * 
 * @param {HTMLElement} link The link that was clicked
 */
function menuItemListener( link ) {
  var array_child = [];
  if (taskItemInContext) {
    for (var i = 0; i < taskItemInContext.length; i++) {
      let stringer = taskItemInContext[i].getAttribute("data-id"); 
      array_child.push(stringer);
    }
  }
  switch ( link.getAttribute("data-action") ) {
    case "add_accounts":
      addUsersController();
      break;
    case "delete_rows":
      deleteRowsDb(array_child);
      taskItemInContext = null;
      break;
    case "check_accounts":
      checkAccountsDb(array_child);
      break;
    case "add_tasks":
      tasksController('add', array_child);
      break;
    case "edit_tasks":
      tasksController('edit', array_child);
      break;
    case "tasks_stop":
      addStopStateView(array_child)
      // stopTasksDb(array_child);
      break;
    case "tasks_start":
      runTasksDb(array_child); 
      break;
    case "edit_account":
      editUserController(array_child);
      break;
    case "show_logs":
      showLogsController(array_child);
    default:
      break;
  }
  toggleMenuOff();
}

/**
 * Run the app.
 */
init();


