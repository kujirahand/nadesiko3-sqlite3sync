// plugin_sqlite3sync.js
const sqlite3 = require('sqlite-sync')
const ERR_OPEN_DB = '『SQLITE3同期開』でデータベースを開く必要があります。'
const PluginSQLite3Sync = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__sqlite3db = null
    }
  },
  // @SQLite3同期
  'SQLITE3開': { // @SQlite3のデータベースFを開いて、データベースオブジェクトを返す // @SQLITE3ひらく
    type: 'func',
    josi: [['を', 'の']],
    fn: function (f, sys) {
      const db = sqlite3.connect(f)
      sys.__sqlite3db = db
      return db
    }
  },
  'SQLITE3閉': { // @アクティブなSQlite3のデータベースを閉じる // @SQLITE3とじる
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__sqlite3db.close()
    },
    return_none: true
  },
  'SQLITE3同期切替': { // @操作対象のデータベースをDB(『SQLITE3同期開』を使用)に切り替える // @SQLITE3どうききりかえる
    type: 'func',
    josi: [['に', 'へ']],
    fn: function (db, sys) {
      sys.__sqlite3db = db
    },
    return_none: true
  },
  'SQLITE3実行': { // @ SQLをパラメータPARAMSで実行する。// @SQLITE3じっこう
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (sql, params, sys) {
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      return db.run(sql, params)
    }
  },
  'INSERT': { // @ INSERT文を実行。TBLへハッシュPARAMSを挿入。// @INSERT
    type: 'func',
    josi: [['に','へ'], ['を']],
    fn: function (tbl, params, sys) {
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      return db.insert(tbl, params)
    }
  },
  'UPDATE': { // @ UPDATE文を実行。TBLのWHEREをPARAMSに更新。// @UPDATE
    type: 'func',
    josi: [['の'], ['を'],['に','へ']],
    fn: function (tbl, where, params, sys) {
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      return db.update(tbl, params, where)
    }
  }
}

module.exports = PluginSQLite3Sync

