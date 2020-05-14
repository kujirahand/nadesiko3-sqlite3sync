const assert = require('assert')
const path = require('path')
const nadesiko3 = require('nadesiko3')
const NakoCompiler = nadesiko3.compiler
const PluginNode = nadesiko3.PluginNode
const PluginSQLite3Sync = require('../index')

describe('sqlite3sync_test', () => {
  const nako = new NakoCompiler()
  nako.addPluginObject('PluginNode', PluginNode)
  nako.addPluginObject('PluginSQLite3Sync', PluginSQLite3Sync)
  // nako.debug = true
  const cmp = (code, res) => {
    if (nako.debug) {
      console.log('code=' + code)
    }
    assert.equal(nako.runReset(code).log, res)
  }
  const cmd = (code) => {
    if (nako.debug) console.log('code=' + code)
    nako.runReset(code)
  }
  // --- test ---
  it('表示', () => {
    cmp('3を表示', '3')
  })
  // SQLite3Syncのテスト ---
  const fname = path.join(__dirname, 'test.sqlite3')
  
  it('SQLite3Sync - create,insert,select', () => {
    const sqlCreate = 'CREATE TABLE IF NOT EXISTS tt (' +
      'tt_id INTEGER PRIMARY KEY,' +
      'key TEXT, value TEXT,' +
      'iv INTEGER DEFAULT 0' +
      ');'
    const sqlInsert = 'INSERT INTO tt (key,iv)VALUES("a",10);'
    const sqlSelect = 'SELECT * FROM tt;'
    cmp(`『${fname}』をSQLITE3開く\n` +
      `『${sqlCreate}』をSQLITE3実行。\n` +
      `『${sqlInsert}』をSQLITE3実行。\n` +
      `R=『${sqlSelect}』をSQLITE3実行。\n` +
      `R[0]['iv']を表示。`, 10)
  })
  
  it('SQLite3Sync - INSERT', () => {
    const sqlSelect = 'SELECT * FROM tt WHERE key="b";'
    cmp(`『${fname}』をSQLITE3開く\n` +
      `「tt」へ{"key":"b","iv":30}をINSERT。\n` +
      `R=『${sqlSelect}』をSQLITE3実行。\n` +
      `R[0]['iv']を表示。`, 30)
  })
  
  it('SQLite3Sync - UPDATE', () => {
    const sqlSelect = 'SELECT * FROM tt WHERE tt_id=3;'
    cmp(`『${fname}』をSQLITE3開く\n` +
      `「tt」の{"tt_id":3}を{"iv":50}へUPDATE。\n` +
      `R=『${sqlSelect}』をSQLITE3実行。\n` +
      `R[0]['iv']を表示。`, 50)
  })
})

