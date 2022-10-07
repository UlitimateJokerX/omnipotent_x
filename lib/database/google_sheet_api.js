const { GoogleSpreadsheet } = require('google-spreadsheet')
const config = require('../../config/config')
const credentials = require('../../config/client_secret.json')

// 載入google sheet
async function loadDoc () {
  const doc = new GoogleSpreadsheet(config.doc_id)

  await doc.useServiceAccountAuth(credentials)
  await doc.loadInfo()

  return doc
}

/**
 * 取得資料
 *
 * @param {String} table    資料表名稱
 * @param {Object} criteria 查詢條件
 *   格式：
 *   {
 *     id: 1, name: 'test', ...
 *   }
 * @param {Boolean} fuzzy   是否為模糊搜尋(預設否)
 *
 * @return {Array}
 */
async function getData (table, criteria, fuzzy = false) {
  const doc = await loadDoc()
  const sheet = doc.sheetsByTitle[table]
  let rows = await sheet.getRows()

  // 處理查詢條件
  if (criteria && Object.keys(criteria).length > 0) {
    for (let i of Object.keys(criteria)) {
      rows = rows.filter(row => {
        if (fuzzy) {
          return row[i].includes(criteria[i])
        }

        return row[i] === criteria[i]
      })
    }
  }

  // 整理檔案回傳格式
  const data = []

  for (let row of rows) {
    const rowData = {}

    for (let header of row._sheet.headerValues) {
      rowData[header] = row[header]
    }

    data.push(rowData)
  }

  return data
}

/**
 * 新增資料
 *
 * @param {String} table         資料表名稱
 * @param {Object} newData       新增的資料
 * @param {String} primaryColumn 主鍵欄位名稱
 *
 * @return {Array}
 */
async function addData (table, newData, primaryColumn = '') {
  const doc = await loadDoc()
  const sheet = doc.sheetsByTitle[table]
  let rows = await sheet.getRows()

  // 檢查主鍵是否重複
  if (primaryColumn !== '') {
    rows = rows.filter(row => {
      return row[primaryColumn] === newData[primaryColumn]
    })

    if (rows.length !== 0) {
      throw new Error('Duplicate primary key')
    }
  }

  // 新增
  await sheet.addRow(newData)

  return
}

module.exports = {
  loadDoc,
  getData,
  addData
}
