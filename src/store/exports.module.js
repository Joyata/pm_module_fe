import api from "@/apis/CommonAPI";

export const exports = {
  namespaced: true,

  state: {
    exportStatus: "",
    isExporting: false,
    error: null,
  },

  mutations: {
    SET_EXPORT_STATUS(state, status) {
      state.exportStatus = status;
    },
    SET_IS_EXPORTING(state, status) {
      state.isExporting = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },

  actions: {
    async exportData({ commit }, { data, format, machineId }) {
      commit("SET_IS_EXPORTING", true);
      commit("SET_ERROR", null);

      try {
        // Prepare the data based on format
        let exportData;
        let fileName = `machine_${machineId}_data_${
          new Date().toISOString().split("T")[0]
        }`;

        switch (format) {
          case "csv":
            exportData = convertToCSV(data);
            fileName += ".csv";
            break;

          case "json":
            exportData = JSON.stringify(data, null, 2);
            fileName += ".json";
            break;

          case "xlsx":
            exportData = await convertToExcel(data);
            fileName += ".xlsx";
            break;

          default:
            throw new Error("Unsupported export format");
        }

        // Create and trigger download
        const blob = new Blob([exportData], {
          type: getContentType(format),
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        commit("SET_EXPORT_STATUS", "success");
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_IS_EXPORTING", false);
      }
    },
  },
};

// Helper Functions
function getContentType(format) {
  const contentTypes = {
    csv: "text/csv",
    json: "application/json",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return contentTypes[format] || "text/plain";
}

function convertToCSV(data) {
  const { sensorData, metadata, alertHistory } = data;
  let csvContent = [];

  // Add metadata
  csvContent.push("# Metadata");
  csvContent.push(`Machine ID,${data.machineId}`);
  csvContent.push(`Export Date,${metadata.exportDate}`);
  csvContent.push("");

  // Add sensor information
  csvContent.push("# Sensors");
  csvContent.push("Sensor ID,Name,Unit");
  metadata.sensors.forEach((sensor) => {
    csvContent.push(`${sensor.id},${sensor.name},${sensor.unit}`);
  });
  csvContent.push("");

  // Add sensor data
  csvContent.push("# Sensor Readings");
  csvContent.push("Timestamp,Sensor,Value");

  Object.entries(sensorData).forEach(([sensorType, readings]) => {
    Object.entries(readings).forEach(([axis, values]) => {
      values.forEach((reading) => {
        csvContent.push(
          `${new Date(reading.x).toISOString()},${sensorType}_${axis},${
            reading.y
          }`
        );
      });
    });
  });

  // Add alert history if included
  if (alertHistory?.length) {
    csvContent.push("");
    csvContent.push("# Alert History");
    csvContent.push("Timestamp,Type,Title,Message");
    alertHistory.forEach((alert) => {
      csvContent.push(
        `${alert.timestamp},${alert.type},${alert.title},${alert.message}`
      );
    });
  }

  return csvContent.join("\n");
}

async function convertToExcel(data) {
  // Import SheetJS library
  const XLSX = await import("xlsx");

  const workbook = XLSX.utils.book_new();

  // Create metadata sheet
  const metadataWs = XLSX.utils.aoa_to_sheet([
    ["Machine ID", data.machineId],
    ["Export Date", data.metadata.exportDate],
    [],
    ["Sensor Information"],
    ["Sensor ID", "Name", "Unit"],
    ...data.metadata.sensors.map((s) => [s.id, s.name, s.unit]),
  ]);
  XLSX.utils.book_append_sheet(workbook, metadataWs, "Metadata");

  // Create sensor data sheets
  Object.entries(data.sensorData).forEach(([sensorType, readings]) => {
    const sensorData = [["Timestamp", ...Object.keys(readings)]];

    // Get all unique timestamps
    const timestamps = new Set();
    Object.values(readings).forEach((axisData) => {
      axisData.forEach((reading) => timestamps.add(reading.x));
    });

    // Create rows with data for each timestamp
    [...timestamps].sort().forEach((timestamp) => {
      const row = [new Date(timestamp).toISOString()];
      Object.values(readings).forEach((axisData) => {
        const reading = axisData.find((r) => r.x === timestamp);
        row.push(reading ? reading.y : "");
      });
      sensorData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(sensorData);
    XLSX.utils.book_append_sheet(workbook, ws, sensorType);
  });

  // Create alerts sheet if included
  if (data.alertHistory?.length) {
    const alertsWs = XLSX.utils.json_to_sheet(
      data.alertHistory.map((alert) => ({
        Timestamp: alert.timestamp,
        Type: alert.type,
        Title: alert.title,
        Message: alert.message,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, alertsWs, "Alerts");
  }

  return XLSX.write(workbook, { type: "array" });
}

export default exports;
