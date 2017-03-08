var helpers = require('./global-setup')
var path = require('path')
var fs = require('fs');
var os = require('os');
var expect = require('chai').expect;

var describe = global.describe
var it = global.it
var beforeEach = global.beforeEach
var afterEach = global.afterEach

var appPath = path.resolve(__dirname, '../'); 
console.log(appPath);

var config = require('../config/default');
var softname = config.App.softname;
var electronPath = path.resolve('/usr/local/bin/electron');

describe('launch application', function () {
  helpers.setupTimeout(this)

  var app = null

  beforeEach(function () {
    return helpers.startApplication({
      path: electronPath,
      args: [appPath]
    }).then(function (startedApp) { app = startedApp })
  })

  afterEach(function () {
    return helpers.stopApplication(app)
  })
 
  it('opens a window and webcontents finish loading', function () {
    return app.client.waitUntilWindowLoaded()
      .browserWindow.isDevToolsOpened().should.eventually.be.true
      .windowByIndex(1)
      .waitForVisible('#table1').should.eventually.be.true
      .browserWindow.focus()
      .getWindowCount().should.eventually.equal(1)
      .browserWindow.isMinimized().should.eventually.be.false
      .browserWindow.isVisible().should.eventually.be.true
      .browserWindow.isFocused().should.eventually.be.true
      .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
      .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
  })

  it('creates correct title, home, db directory', function () {
    var home = path.join(os.tmpdir(), softname)
    var dbdir = path.join(os.tmpdir(), softname, 'levdb')
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal(softname)
      .then(function() {
        expect(fs.existsSync(home)).to.equal(true)
        expect(fs.existsSync(dbdir)).to.equal(true)
      })
  })
})


describe('navigation menu', function () {
  helpers.setupTimeout(this)

  var app = null

  beforeEach(function () {
    return helpers.startApplication({
      path: electronPath,
      args: [appPath]
    }).then(function (startedApp) { app = startedApp })
  })

  afterEach(function () {
    return helpers.stopApplication(app)
  })

  it('shows correct menu for no rows selected', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1').should.eventually.be.true
      .rightClick("#table1", 10, 10) 
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .then(function() {
        app.client.getText('#context-menu > ul > li').then(function (text) {
          [ 'Добавить аккаунты', 
            'Добавить задание'  ].forEach(function(item) {
            expect(text.indexOf(item)).to.be.above(0)
          })
        })
      })
  })

  it('shows correct menu for one task row selected', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .click("#table1 tbody tr:nth-child(1)", 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .then(function() {
        app.client.getText('#context-menu > ul > li').then(function (text) {
          [ 'Старт', 
            'Редактировать задание', 
            'Удалить выделенное', 
            'Добавить аккаунты', 
            'Показать логи' ].forEach(function(item) {
            expect(text.indexOf(item)).to.be.above(0)
          })
        })
      })
  })

  it('shows correct menu for one user row with task [Shift]', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('tr[data-id="ratm9111"]').should.eventually.be.true
      .click('tr[data-id="ratm9111"]', 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .then(function() {
        app.client.getText('#context-menu > ul > li').then(function (text) {
          [ 'Старт',
            'Редактировать аккаунт',
            'Добавить задание',
            'Редактировать задание',
            'Проверка аккаунта',
            'Удалить выделенное',
            'Добавить аккаунты',
            'Показать логи' ].forEach(function(item) {
            expect(text.indexOf(item)).to.be.above(0)
          })
        })
      })
  })

  it('shows correct menu for two user rows with tasks each [Shift]', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('tr[data-id="ratm9111"]').should.eventually.be.true
      .waitForVisible('tr[data-id="ratm922"]').should.eventually.be.true
      .click('tr[data-id="ratm9111"]', 10, 10)
      .keys('Shift')
      .click('tr[data-id="ratm922"]', 10, 10)
      .keys('NULL')
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .then(function() {
        app.client.getText('#context-menu > ul > li').then(function (text) {
          [ 'Старт',
            'Добавить задание',
            'Проверка аккаунта',
            'Удалить выделенное',
            'Добавить аккаунты',
            'Показать логи' ].forEach(function(item) {
            expect(text.indexOf(item)).to.be.above(0)
          })
        })
      })
  })
  
  it('shows correct menu for row user and row task [Ctrl+A]', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .waitForVisible('tr[data-id="ratm9111"]').should.eventually.be.true
      .keys(['Control', 'a', 'NULL'])
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .then(function() {
        app.client.getText('#context-menu > ul > li').then(function (text) {
          [ 'Старт',
            'Удалить выделенное',
            'Добавить аккаунты',
            'Показать логи' ].forEach(function(item) {
            expect(text.indexOf(item)).to.be.above(0)
          })
        })
      })
  })
})




describe('possible to add users from file', function () {

  helpers.setupTimeout(this)

  var app = null

  beforeEach(function () {
    return helpers.startApplication({
      path: electronPath,
      args: [appPath]
    }).then(function (startedApp) { app = startedApp })
  })

  afterEach(function () {
    return helpers.stopApplication(app)
  })


  it('possible to delete all exist records [Ctrl+A]', function () {
  return app.client.waitUntilWindowLoaded()
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 2
      })
    })
    .windowByIndex(1)
    .waitForVisible('#table1 > tbody > tr:nth-child(1)').should.eventually.be.true
    .keys(['Control', 'a', 'NULL'])
    .rightClick("#table1", 10, 10)
    .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
    .click('#context-menu > ul > li:nth-child(7)', 5, 5)
    .then(function() {
      app.client.getText('#table1 > tbody > tr').then(function (text) {
        expect(text.length).to.equal(0)
      })
    })
  })

  it('possible to add users from file', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1').should.eventually.be.true
      .rightClick("#table1", 10, 10) 
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(8)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .waitForVisible('#add_accounts_form').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal('Добавить аккаунты | ' + softname)
      .setValue('#add_acc_txt_file', '/Users/alex/dev/nodejs/guinstabot/app/test/accounts')
      .click('button[type="submit"]')
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 1
        })
      })
      .windowByIndex(0)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .then(function() {
        app.client.getText('#table1 > tbody > tr').then(function (text) {
          expect(text.length).to.equal(2)
        })
      })
  })

  it('possible to add parse_concurrents task to the user record', function() {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .click("#table1 tbody tr:nth-child(1)", 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(4)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .click("#parse_concurrents_tab", 10, 10)
      .waitForVisible('#parse_concurrents').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal('Добавление задания | ' + softname)
      .setValue('#parsed_conc', 'instagram')
      .click('span[name="follow"]')
      .setValue('#max_limit', '300')
      .setValue('#parsed_accounts', '/Users/alex/dev/nodejs/guinstabot/app/test/parsed')
      .click('button[name="parse_concurrents"]')
      .waitUntil(function() {
        return this.getWindowCount().then(function(count) {
          return count === 1
        })
      })
      .windowByIndex(0)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      // check for correct task added
  })

  it('possible to add filtration task to the user record', function() {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .click("#table1 tbody tr:nth-child(1)", 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(4)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .click("#filtration_tab", 10, 10)
      .waitForVisible('#filtration').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal('Добавление задания | ' + softname)
      .setValue('#inputfile', '/Users/alex/dev/nodejs/guinstabot/app/test/parsed')
      .setValue('#followers_from', '0').setValue('#followers_to', '300')
      .setValue('#subscribers_from', '0').setValue('#subscribers_to', '300')
      .setValue('#publications_from', '0').setValue('#publications_to', '300')
      .click('span[name="avatar"]')
      .selectByValue('#private', 'open')
      .click('span[name="date_checker"]')
      // .setValue('#lastdate', '2017-02-19')
      .setValue('#stop_words_file', '/Users/alex/dev/nodejs/guinstabot/app/test/stop')
      .setValue('#filtered_accounts', '/Users/alex/dev/nodejs/guinstabot/app/test/filtrated')
      .click('button[name="filtration"]')
      .waitUntil(function() {
        return this.getWindowCount().then(function(count) {
          return count === 1
        })
      })
      .windowByIndex(0)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      // check for correct task added
  })

  it('possible to add filtration task', function() {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(4)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .click("#filtration_tab", 10, 10)
      .waitForVisible('#filtration').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal('Добавление задания | ' + softname)
      .setValue('#inputfile', '/Users/alex/dev/nodejs/guinstabot/app/test/parsed')
      .setValue('#proxy_file', '/Users/alex/dev/nodejs/guinstabot/app/test/proxy')
      .setValue('#followers_from', '0').setValue('#followers_to', '300')
      .setValue('#subscribers_from', '0').setValue('#subscribers_to', '300')
      .setValue('#publications_from', '0').setValue('#publications_to', '300')
      .click('span[name="avatar"]')
      .selectByValue('#private', 'open')
      .click('span[name="date_checker"]')
      // .setValue('#lastdate', '2017-02-19')
      .setValue('#stop_words_file', '/Users/alex/dev/nodejs/guinstabot/app/test/stop')
      .setValue('#filtered_accounts', '/Users/alex/dev/nodejs/guinstabot/app/test/filtrated')
      .click('button[name="filtration"]')
      .waitUntil(function() {
        return this.getWindowCount().then(function(count) {
          return count === 1
        })
      })
      .windowByIndex(0)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      // check for correct task added
  })

  it('possible to check logs for user account', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .click('tr[data-id="ratm9111"]', 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(9)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .waitForVisible('#text').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal(`Лог ratm9111 | ${softname}`)

  })

  it('possible to edit user username', function () {
    return app.client.waitUntilWindowLoaded()
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 2
        })
      })
      .windowByIndex(1)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .click('tr[data-id="ratm9111"]', 10, 10)
      .rightClick("#table1", 10, 10)
      .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
      .click('#context-menu > ul > li:nth-child(3)', 5, 5)
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 3
        })
      })
      .windowByIndex(2)
      .waitForVisible('#edit_form').should.eventually.be.true
      .webContents.getTitle().should.eventually.equal('Редактирование аккаунта | ' + softname)
      .setValue('#username', 'username')
      .click('button[type="submit"]')
      .waitUntil(function () {
        return this.getWindowCount().then(function (count) {
          return count === 1
        })
      })
      .windowByIndex(0)
      .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
      .then(function() {
        app.client.getText('#table1 > tbody > tr').then(function (text) {
          expect(text.length).to.equal(2)
        })
      })
  })

  it('possible to edit user password', function () {
  return app.client.waitUntilWindowLoaded()
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 2
      })
    })
    .windowByIndex(1)
    .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
    .click('tr[data-id="ratm9111"]', 10, 10)
    .rightClick("#table1", 10, 10)
    .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
    .click('#context-menu > ul > li:nth-child(3)', 5, 5)
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 3
      })
    })
    .windowByIndex(2)
    .waitForVisible('#edit_form').should.eventually.be.true
    .webContents.getTitle().should.eventually.equal('Редактирование аккаунта | ' + softname)
    .setValue('#password', 'password')
    .click('button[type="submit"]')
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 1
      })
    })
    .windowByIndex(0)
    .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
    .then(function() {
      app.client.getText('#table1 > tbody > tr').then(function (text) {
        expect(text.length).to.equal(2)
      })
    })
  })

  it('possible to edit user proxy', function () {
    return app.client.waitUntilWindowLoaded()
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 2
      })
    })
    .windowByIndex(1)
    .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
    .click('tr[data-id="ratm9111"]', 10, 10)
    .rightClick("#table1", 10, 10)
    .getAttribute('#context-menu', 'class').should.eventually.equal('context-menu context-menu--active')
    .click('#context-menu > ul > li:nth-child(3)', 5, 5)
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 3
      })
    })
    .windowByIndex(2)
    .waitForVisible('#edit_form').should.eventually.be.true
    .webContents.getTitle().should.eventually.equal('Редактирование аккаунта | ' + softname)
    .setValue('#proxy', '1.1.1.1:3030')
    .click('button[type="submit"]')
    .waitUntil(function () {
      return this.getWindowCount().then(function (count) {
        return count === 1
      })
    })
    .windowByIndex(0)
    .waitForVisible('#table1 tbody tr:nth-child(1)').should.eventually.be.true
    .then(function() {
      app.client.getText('#table1 > tbody > tr').then(function (text) {
        expect(text.length).to.equal(2)
      })
    })
  })

})



// session proxy check tests
// validations tests
