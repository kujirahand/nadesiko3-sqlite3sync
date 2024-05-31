// plugin_sqlite3.js
import sqlite3 from 'sqlite3'
const ERR_OPEN_DB = 'SQLITE3の命令を使う前に『SQLITE3開く』でデータベースを開いてください。';
const PluginSQLite3 = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__sqlite3db = null
    }
  },
  // @SQLite3
  'SQLITE3今挿入ID': { type: 'const', value: '?' }, // @SQLITE3いまそうにゅうID
  'SQLITE3開': { // @SQlite3のデータベースを開いて、データベースオブジェクトを返す // @SQLITE3ひらく
    type: 'func',
    josi: [['を', 'の']],
    fn: function (s, sys) {
      const db = new sqlite3.Database(s)
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
  'SQLITE3切替': { // @アクティブなSQlite3のデータベースをDB(SQLITE3開くで開いたもの)に切り替える // @SQLITE3きりかえる
    type: 'func',
    josi: [['に', 'へ']],
    fn: function (db, sys) {
      sys.__sqlite3db = db
    },
    return_none: true
  },
  'SQLITE3実行時': { // @ SQLをパラメータPARAMSで実行する。完了するとコールバック関数Fを実行する。 // @SQLITE3じっこうしたとき
    type: 'func',
    josi: [['に'], ['を'], ['で']],
    fn: function (f, sql, params, sys) {
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      db.run(sql, params, function (err) {
        if (err) throw new Error('SQLITE3実行時のエラー『' + sql + '』' + err.message)
        sys.__v0['SQLITE3今挿入ID'] = this.lastID
        f()
      })
    }
  },
  'SQLITE3取得時': { // @ SQLをパラメータPARAMSで取得実行する。完了するとコールバック関数Fが実行され、結果は第一引数に与えられる。 // @SQLITE3しゅとくしたとき
    type: 'func',
    josi: [['に'], ['を'], ['で']],
    fn: function (f, sql, params, sys) {
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      db.all(sql, params, (err, rows) => {
        if (err) throw err
        f(rows)
      })
    }
  },
  'SQLITE3実行': { // @ SQLをパラメータPARAMSで実行する。 // @SQLITE3じっこう
    type: 'func',
    josi: [['を'], ['で']],
    asyncFn: true,
    fn: function (sql, params, sys) {
      return new Promise((resolve, reject) => {
        if (!sys.__sqlite3db) {
          reject(ERR_OPEN_DB)
          return
        }
        const db = sys.__sqlite3db
        db.run(sql, params, function (err) {
          if (err) {
            console.log('[ERROR]', sql, err)
            reject(err)
            return
          }
          if (this.lastID) {
            sys.__v0['SQLITE3今挿入ID'] = this.lastID
          }
          // console.log(sql, params, err)
          resolve()
        })
      })
    },
    return_none: true
  },
  'SQLITE3取得': { // @ SQLをパラメータPARAMSで取得する。 // @SQLITE3しゅとく
    type: 'func',
    josi: [['を'], ['で']],
    asyncFn: true,
    fn: function (sql, params, sys) {
      return new Promise((resolve, reject) => {
        if (!sys.__sqlite3db) {
          reject(ERR_OPEN_DB)
          return
        }
        const db = sys.__sqlite3db
        db.get(sql, params, (err, row) => {
          if (err) {
            reject(err)
            return
          }
          resolve(row)
        })
      })
    },
    return_none: false
  },
  'SQLITE3全取得': { // @ SQLをパラメータPARAMSで全部取得する。 // @SQLITE3ぜんしゅとく
    type: 'func',
    josi: [['を'], ['で']],
    asyncFn: true,
    fn: function (sql, params, sys) {
      return new Promise((resolve, reject) => {
        if (!sys.__sqlite3db) {
          reject(ERR_OPEN_DB)
          return
        }
        const db = sys.__sqlite3db
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err)
            return
          }
          resolve(rows)
        })
      })
    },
    return_none: false
  },
  // @非推奨
  'SQLITE3逐次実行': { // @(非推奨) 逐次実行構文にて、SQLとパラメータPARAMSでSQLを実行し、変数『対象』に結果を得る。 // @SQLITE3ちくじじっこう
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (sql, params, sys) {
      if (!sys.resolve) throw new Error('『SQLITE3実行』は『逐次実行』構文で使ってください。')
      sys.resolveCount++
      const resolve = sys.resolve
      const reject = sys.reject
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      sys.__sqlite3db.run(sql, params, function (err, res) {
        if (err) {
          reject('SQLITE3逐次実行のエラー『' + sql + '』' + err.message)
          return
        }
        sys.__v0['対象'] = res
        sys.__v0['SQLITE3今挿入ID'] = this.lastID
        resolve()
      })
    },
    return_none: true
  },
  'SQLITE3逐次全取得': { // @(非推奨)逐次実行構文内で、SQLとパラメータPARAMSでSQLを実行して結果を得る。 // @SQLITE3ちくじぜんしゅとく
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (sql, params, sys) {
      if (!sys.resolve) throw new Error('『SQLITE3全取得』は『逐次実行』構文で使ってください。')
      sys.resolveCount++
      const resolve = sys.resolve
      const reject = sys.reject
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      db.all(sql, params, function (err, res) {
        if (err) {
          reject('SQLITE3全取得のエラー『' + sql + '』' + err.message)
          return
        }
        sys.__v0['対象'] = res
        sys.__v0['SQLITE3今挿入ID'] = this.lastID
        resolve(res)
      })
    },
    return_none: true
  },
  'SQLITE3逐次取得': { // @(非推奨)逐次実行構文内で、SQLとパラメータPARAMSでSQLを実行して結果を得る。 // @SQLITE3ちくじしゅとく
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (sql, params, sys) {
      if (!sys.resolve) throw new Error('『SQLITE3取得』は『逐次実行』構文で使ってください。')
      sys.resolveCount++
      const resolve = sys.resolve
      const reject = sys.reject
      if (!sys.__sqlite3db) throw new Error(ERR_OPEN_DB)
      const db = sys.__sqlite3db
      db.get(sql, params, function (err, res) {
        if (err) {
          reject('SQLITE3取得のエラー『' + sql + '』' + err.message)
          return
        }
        sys.__v0['対象'] = res
        resolve(res)
      })
    },
    return_none: true
  }
}

export default PluginSQLite3

// module.exports = PluginSQLite3

