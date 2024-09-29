import * as XLSX from 'xlsx';

export interface SalesData {
  totalPackages: number;
  packageTypes: { [key: string]: number };
  designPackages: { [key: string]: number };
  agents: { [key: string]: AgentData };
  startDate: string;
  endDate: string;
  sales: SaleEntry[];
}

export interface AgentData {
  totalSold: number;
  packageTypes: { [key: string]: number };
  designPackages: { [key: string]: number };
  statuses: { [key: string]: number };
}

export interface SaleEntry {
  date: Date;
  packagePurchased: string;
  designPackage: string;
  agent: string;
  status: string;
}

const FIXED_START_DATE = '2023-11-16';

function parseDate(dateString: string | undefined): Date {
    if (!dateString) {
      console.warn("Encountered an empty date string");
      return new Date();
    }
  
    const parts = dateString.split('/');
    if (parts.length !== 3) {
      console.warn(`Invalid date format: ${dateString}`);
      return new Date();
    }
  
    const [month, day, year] = parts.map(Number);
    const fullYear = year < 100 ? 2000 + year : year;
  
    return new Date(fullYear, month - 1, day);
  }
  
  export function processExcelData(file: File): Promise<SalesData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[];
  
        console.log("First few rows:", jsonData.slice(0, 5));
  
        const salesData: SalesData = {
          totalPackages: 0,
          packageTypes: {},
          designPackages: {},
          agents: {},
          startDate: FIXED_START_DATE,
          endDate: new Date().toISOString().split('T')[0],
          sales: [],
        };
  
        jsonData.forEach((row) => {
          const saleDate = parseDate(row['Date the sale was made']);
          const packagePurchased = row['Package Purchased'] || 'Unknown';
          const designPackage = row['Design Package type'] || 'Free';
          const agent = row['Agent closed'] || 'Unknown';
          const status = row['Status'] || 'Unknown';
  
          salesData.sales.push({
            date: saleDate,
            packagePurchased,
            designPackage,
            agent,
            status,
          });
  
          salesData.totalPackages++;
          salesData.packageTypes[packagePurchased] = (salesData.packageTypes[packagePurchased] || 0) + 1;
          salesData.designPackages[designPackage] = (salesData.designPackages[designPackage] || 0) + 1;
  
          if (!salesData.agents[agent]) {
            salesData.agents[agent] = { totalSold: 0, packageTypes: {}, designPackages: {}, statuses: {} };
          }
          salesData.agents[agent].totalSold++;
          salesData.agents[agent].packageTypes[packagePurchased] = (salesData.agents[agent].packageTypes[packagePurchased] || 0) + 1;
          salesData.agents[agent].designPackages[designPackage] = (salesData.agents[agent].designPackages[designPackage] || 0) + 1;
          salesData.agents[agent].statuses[status] = (salesData.agents[agent].statuses[status] || 0) + 1;
        });
  
        console.log("Start Date:", salesData.startDate);
        console.log("End Date:", salesData.endDate);
  
        resolve(salesData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
  
  export function filterDataByDateRange(data: SalesData, startDate: string, endDate: string): SalesData {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    const filteredSales = data.sales.filter(sale => sale.date >= start && sale.date <= end);
  
    const filteredData: SalesData = {
      totalPackages: filteredSales.length,
      packageTypes: {},
      designPackages: {},
      agents: {},
      startDate,
      endDate,
      sales: filteredSales,
    };
  
    filteredSales.forEach(sale => {
      filteredData.packageTypes[sale.packagePurchased] = (filteredData.packageTypes[sale.packagePurchased] || 0) + 1;
      filteredData.designPackages[sale.designPackage] = (filteredData.designPackages[sale.designPackage] || 0) + 1;
  
      if (!filteredData.agents[sale.agent]) {
        filteredData.agents[sale.agent] = { totalSold: 0, packageTypes: {}, designPackages: {}, statuses: {} };
      }
      filteredData.agents[sale.agent].totalSold++;
      filteredData.agents[sale.agent].packageTypes[sale.packagePurchased] = (filteredData.agents[sale.agent].packageTypes[sale.packagePurchased] || 0) + 1;
      filteredData.agents[sale.agent].designPackages[sale.designPackage] = (filteredData.agents[sale.agent].designPackages[sale.designPackage] || 0) + 1;
      filteredData.agents[sale.agent].statuses[sale.status] = (filteredData.agents[sale.agent].statuses[sale.status] || 0) + 1;
    });
  
    // Add agents with zero sales
    Object.keys(data.agents).forEach(agent => {
      if (!filteredData.agents[agent]) {
        filteredData.agents[agent] = { totalSold: 0, packageTypes: {}, designPackages: {}, statuses: {} };
      }
    });
  
    return filteredData;
  }          