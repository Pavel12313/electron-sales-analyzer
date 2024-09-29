import { google } from 'googleapis';
import { getAuthenticatedClient } from './googleSheetsAuth';
import { SalesData, SaleEntry } from './dataProcessor';

const SPREADSHEET_ID = '1Xsz9u5jbZKvtnLpTxLszUFYXTRu_oshLM_8Dprs2-Ok';
const RANGE = "'Form Responses 1'!A:Q"; // Adjust the range based on your actual data columns

export async function fetchGoogleSheetsData(): Promise<SalesData> {
  const auth = await getAuthenticatedClient();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the Google Sheet');
    }

    const salesData: SalesData = {
      totalPackages: 0,
      packageTypes: {},
      designPackages: {},
      agents: {},
      startDate: '2023-11-16',
      endDate: new Date().toISOString().split('T')[0],
      sales: [],
    };

    // Get the header row
    const headers = rows[0];

    // Find the indices of the required columns
    const dateIndex = headers.indexOf('Date the sale was made');
    const packagePurchasedIndex = headers.indexOf('Package Purchased');
    const designPackageIndex = headers.indexOf('Design Package type');
    const agentIndex = headers.indexOf('Agent closed');
    const statusIndex = headers.indexOf('Status');

    // Check if all required columns are present
    if (
      dateIndex === -1 ||
      packagePurchasedIndex === -1 ||
      designPackageIndex === -1 ||
      agentIndex === -1 ||
      statusIndex === -1
    ) {
      throw new Error('Required columns are missing in the Google Sheet');
    }

    // Process the data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const date = row[dateIndex];
      const packagePurchased = row[packagePurchasedIndex] || 'Unknown';
      const designPackage = row[designPackageIndex] || 'Free';
      const agent = row[agentIndex] || 'Unknown';
      const status = row[statusIndex] || 'Unknown';

      // Parse the date
      const saleDate = new Date(date);
      if (isNaN(saleDate.getTime())) {
        console.warn(`Invalid date format in row ${i + 1}: ${date}`);
        continue; // Skip this row if date is invalid
      }

      const saleEntry: SaleEntry = {
        date: saleDate,
        packagePurchased,
        designPackage,
        agent,
        status,
      };

      salesData.sales.push(saleEntry);
      salesData.totalPackages++;

      // Update package types
      salesData.packageTypes[packagePurchased] = (salesData.packageTypes[packagePurchased] || 0) + 1;

      // Update design packages
      salesData.designPackages[designPackage] = (salesData.designPackages[designPackage] || 0) + 1;

      // Update agent data
      if (!salesData.agents[agent]) {
        salesData.agents[agent] = {
          totalSold: 0,
          packageTypes: {},
          designPackages: {},
          statuses: {},
        };
      }
      const agentData = salesData.agents[agent];
      agentData.totalSold++;
      agentData.packageTypes[packagePurchased] = (agentData.packageTypes[packagePurchased] || 0) + 1;
      agentData.designPackages[designPackage] = (agentData.designPackages[designPackage] || 0) + 1;
      agentData.statuses[status] = (agentData.statuses[status] || 0) + 1;
    }

    return salesData;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}
