import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import AgentPerformance from "./components/AgentPerformance";
import Charts from "./components/Charts";
import { SalesData, filterDataByDateRange } from "../utils/dataProcessor";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0f0f0",
      paper: "#ffffff",
    },
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

const isDevelopment = process.env.NODE_ENV === "development";

const App: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [filteredData, setFilteredData] = useState<SalesData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  const fetchGoogleSheetsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: SalesData;
      if (window.electron && window.electron.ipcRenderer) {
        data = await window.electron.ipcRenderer.invoke(
          "fetch-google-sheets-data"
        );
      } else if (isDevelopment) {
        data = {
          totalPackages: 100,
          packageTypes: { "Type A": 50, "Type B": 50 },
          designPackages: { "Design A": 70, "Design B": 30 },
          agents: {
            "Agent 1": {
              totalSold: 50,
              packageTypes: { "Type A": 30, "Type B": 20 },
              designPackages: { "Design A": 35, "Design B": 15 },
              statuses: { Closed: 50 },
            },
            "Agent 2": {
              totalSold: 50,
              packageTypes: { "Type A": 20, "Type B": 30 },
              designPackages: { "Design A": 35, "Design B": 15 },
              statuses: { Closed: 50 },
            },
          },
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          sales: [],
        };
      } else {
        throw new Error("Electron API not available");
      }
      setSalesData(data);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setFilteredData(data);
      setDataLoaded(true);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string, isStart: boolean) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleUpdateClick = () => {
    if (salesData && startDate && endDate) {
      const newFilteredData = filterDataByDateRange(
        salesData,
        startDate,
        endDate
      );
      setFilteredData(newFilteredData);
    }
  };

  const handleAgentSelect = (agent: string) => {
    setSelectedAgent(agent);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth={false}
        style={{ padding: "20px", maxWidth: "1980px", height: "1080px" }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          style={{ color: "#333" }}
        >
          BMS Sales Analyzer
        </Typography>

        {!dataLoaded && (
          <Button
            variant="contained"
            color="primary"
            onClick={fetchGoogleSheetsData}
            disabled={isLoading}
            style={{ marginBottom: "20px", display: "block", width: "100%" }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Get BMS Data"}
          </Button>
        )}

        {error && (
          <Typography color="error" style={{ marginBottom: "20px" }}>
            {error}
          </Typography>
        )}

        {filteredData && (
          <Grid container spacing={3} style={{ height: "100%" }}>
            <Grid item xs={4} style={{ height: "100%" }}>
              <Paper
                style={{
                  height: "100%",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box style={{ marginBottom: "-20px" }}>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => handleDateChange(e.target.value, true)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        inputProps: { max: endDate },
                      }}
                      style={{ marginRight: "10px" }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => handleDateChange(e.target.value, false)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        inputProps: { min: startDate },
                      }}
                    />
                  </Box>
                  <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateClick}
                      size="small"
                      style={{ width: "100px" }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
                <Typography variant="h6" style={{ marginTop: "30px" }}>
                  Design Packages
                </Typography>
                <Box style={{ flex: 1 }}>
                  <Charts data={filteredData} chartType="designPackages" />
                </Box>
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                  Agent Performance
                </Typography>
                <Box style={{ flex: 1 }}>
                  <AgentPerformance
                    data={filteredData}
                    onAgentSelect={handleAgentSelect}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={4} style={{ height: "100%" }}>
              <Paper
                style={{
                  height: "100%",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6">Design Packages Summary</Typography>
                <Box style={{ marginBottom: "20px" }}>
                  {Object.entries(filteredData.designPackages).map(
                    ([type, count]) => (
                      <Typography key={type}>
                        {type}: {count}
                      </Typography>
                    )
                  )}
                </Box>
                <Typography variant="h6">Earnings</Typography>
                <Box style={{ flex: 1, marginBottom: "20px" }}>
                  <Typography variant="body1">Coming soon...</Typography>
                </Box>
                <Typography variant="h6">Expenses</Typography>
                <Box style={{ flex: 1, marginBottom: "20px" }}>
                  <Typography variant="body1">Coming soon...</Typography>
                </Box>
                <Typography variant="h6">Profit</Typography>
                <Box style={{ flex: 1 }}>
                  <Typography variant="body1">Coming soon...</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={4} style={{ height: "100%" }}>
              <Paper style={{ height: "100%", padding: "20px" }}>
                <AgentPerformance
                  data={filteredData}
                  showDetails={true}
                  selectedAgent={selectedAgent}
                  onAgentSelect={handleAgentSelect}
                />
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                  Package Types
                </Typography>
                <Box style={{ flex: 1, marginBottom: "60px" }}>
                  <Charts data={filteredData} chartType="packageTypes" />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper style={{ padding: "20px" }}>
                <Typography variant="h6">
                  Total Packages Sold:{" "}
                  {selectedAgent
                    ? salesData?.agents[selectedAgent]?.totalSold
                    : filteredData.totalPackages}
                </Typography>
                <Typography variant="h6">Package Types:</Typography>
                <Box display="flex" flexWrap="wrap">
                  {Object.entries(
                    selectedAgent
                      ? salesData?.agents[selectedAgent]?.packageTypes || {}
                      : filteredData.packageTypes
                  ).map(([type, count]) => (
                    <Box key={type} mr={2} mb={1}>
                      <Typography>
                        {type}: {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
