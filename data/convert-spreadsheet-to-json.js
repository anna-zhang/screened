const XLSX = require('xlsx')
const fs = require('fs')

// Load the spreadsheet
const workbook = XLSX.readFile('FOTN24_Country_Score_Data.xlsx') // 2024 Freedom on the Net scores spreadsheet
const sheetName = 'FOTN 2024 score data' // Sheet name
const sheet = workbook.Sheets[sheetName]

// Parse the sheet, considering the second row as the header row
// Convert the spreadsheet to a 2D array where each row is an array of values
const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

// Extract the header row (second row in the spreadsheet)
const headers = jsonData[1]

// Map the subsequent rows to objects using the headers
// Skip the first two rows (actual data starts at row 3)
const data = jsonData.slice(2).map(row => {
  const obj = {}
  headers.forEach((header, index) => {
    obj[header] = row[index]
  })
  return obj
})

// Convert values safely, accounting for undefined or null values
const parseNumber = value =>
  value !== undefined && value !== null && value !== '' ? Number(value) : null

// Extract relevant columns
const processedData = data.map(row => ({
  country: row.Country,
  status: row.Status,
  accessScore: parseNumber(row.A),
  contentScore: parseNumber(row.B),
  rightsScore: parseNumber(row.C),
  internetFreedomScore: parseNumber(row.Total)
}))

// Save the processed data as a JSON file
fs.writeFileSync(
  '2024_internet_freedom_scores.json',
  JSON.stringify(processedData, null, 2)
)

console.log('Data successfully saved to 2024_internet_freedom_scores.json')
