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
 * @param String table    資料表名稱
 * @param Object criteria 查詢條件
 *   格式：
 *   {
 *     id: 1, name: 'test', ...
 *   }
 * @param Boolean fuzzy   是否為模糊搜尋(預設否)
 *
 * @return Array
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

module.exports = {
  loadDoc,
  getData
}
