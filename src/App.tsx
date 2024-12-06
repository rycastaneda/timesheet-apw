import { useCallback, useEffect, useState } from "react";
import "./App.css";
import ImportButton from "./ImportButton";
import { MergedTimesheetData, TimesheetData } from "./types";
import {
  DataGrid,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { format } from "date-fns";

function ExcelDateToJSDate(serial: number) {
  var utc_days = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);

  var fractional_day = serial - Math.floor(serial) + 0.0000001;

  var total_seconds = Math.floor(86400 * fractional_day);

  var seconds = total_seconds % 60;

  total_seconds -= seconds;

  var hours = Math.floor(total_seconds / (60 * 60));
  var minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds
  );
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentMonth = new Date().getMonth() + 1;

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function App() {
  const [data, setData] = useState<TimesheetData[] | null>(null);
  const [rows, setRows] = useState<MergedTimesheetData[]>([]);
  const [month, setMonth] = useState<number>(currentMonth);
  const [cutoff, setCutoff] = useState<"1st" | "2nd">("1st");
  const [email, setEmail] = useState<string>("ryan.castaneda@aon.com");
  const [emails, setEmails] = useState<string[]>([]);

  const onImport = useCallback(
    (json: string) => {
      const parsed: Record<string, string>[] = JSON.parse(json);
      const newEmails: string[] = [];
      const mapped = parsed.map((item) => {
        const date = item["date"];
        if (!newEmails.includes(item["Email"])) {
          newEmails.push(item["Email"]);
        }
        return {
          id: parseInt(item.ID),
          startTime: ExcelDateToJSDate(+item["Start time"]),
          completionTime: ExcelDateToJSDate(+item["Completion time"]),
          email: item["Email"],
          name: item["Name"],
          date: ExcelDateToJSDate(+date),
          type: item["Time In"],
          remarks: item["Remarks"],
        } as TimesheetData;
      });
      setEmails(newEmails);
      setData(mapped);
    },
    [setData, month]
  );
  const filterByMonth = useCallback(
    (event: SelectChangeEvent) => {
      const month = parseInt(event.target.value);
      setMonth(month);
      // setRows(
      //   data?.filter((item) => {
      //     return item.startTime.getMonth() + 1 === month;
      //   }) ?? []
      // );
    },
    [data]
  );

  const setCutoffDate = useCallback(
    (event: SelectChangeEvent) => {
      const cutoff = event.target.value as "1st" | "2nd";
      setCutoff(cutoff);
      // console.log("cutoff, date", cutoff, data);
      // setRows(
      //   data?.filter((item) => {
      //     if (cutoff === "1st") {
      //       return item.startTime.getDate() <= 15;
      //     } else {
      //       return item.startTime.getDate() > 15;
      //     }
      //   }) ?? []
      // );
    },
    [setCutoff, data]
  );

  const setEmailChange = useCallback(
    (event: SelectChangeEvent) => {
      const email = event.target.value;
      setEmail(email);
    },
    [data]
  );

  useEffect(() => {
    if (data) {
      const entries: Record<string, MergedTimesheetData> = {};

      data
        ?.filter((item) => item.startTime.getMonth() + 1 === month)
        .filter((item) => item.email === email)
        .filter((item) =>
          cutoff === "1st"
            ? item.startTime.getDate() <= 15
            : item.startTime.getDate() > 15
        )
        .map((item) => {
          console.log("item", item);
          const date = format(item.date, "MM/dd/yyyy");

          // const merged: MergedTimesheetData = []
          if (item.type.includes("Time In")) {
            entries[date] = {
              ...item,
              timeIn: item.startTime,
              timeOut: null,
            };
          }
          if (item.type.includes("Time Out")) {
            if (entries[date]) {
              entries[date].timeOut = item.startTime;
            }
          }

          return item;
        });
      setRows(Object.values(entries) ?? []);
    }
  }, [data, month, cutoff, email]);

  return (
    <>
      <div>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <ImportButton onImport={onImport} disabled={false} />

          <Box gap={2} display={"flex"}>
            <Select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={setEmailChange}
              value={email}
            >
              {emails.map((email) => (
                <MenuItem key={email} value={email}>
                  {email}
                </MenuItem>
              ))}
            </Select>
            <Select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={setCutoffDate}
              value={cutoff}
            >
              <MenuItem key="1st" value={"1st"}>
                1st
              </MenuItem>
              <MenuItem key="2nd" value={"2nd"}>
                2nd
              </MenuItem>
            </Select>
            <Select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={filterByMonth}
              value={month.toString()}
            >
              {months.map((month, index) => (
                <MenuItem key={month} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </div>
      <Box height={500} py={2}>
        <DataGrid
          rows={rows || []}
          slots={{
            toolbar: CustomToolbar,
          }}
          columns={[
            // { field: "id", headerName: "ID", width: 90 },
            {
              field: "date",
              headerName: "Date",
              width: 150,
              valueFormatter: (params: Date) => {
                return format(params, "MM/dd/yyyy");
              },
            },
            {
              field: "workSchedule",
              headerName: "Work Schedule",
              valueGetter: () => {
                return "6:30AM - 3:30PM";
              },
            },
            {
              field: "timeIn",
              headerName: "Morning In",
              valueFormatter: (params: Date) => {
                return format(params, "hh:mm a") ?? "";
              },
            },
            {
              field: "morningOut",
              headerName: "Work Schedule",
              valueGetter: () => {
                return "12:00PM";
              },
            },
            {
              field: "afternoonIn",
              headerName: "Work Schedule",
              valueGetter: () => {
                return "1:00PM";
              },
            },
            {
              field: "timeOut",
              headerName: "Afternoon Out",
              valueFormatter: (params: Date) => {
                return params ? format(params, "hh:mm a") : "";
              },
            },
            {
              field: "hours",
              headerName: "Total Hours",
              renderCell: (
                params: GridRenderCellParams<MergedTimesheetData>
              ) => {
                const timeIn = params.row.timeIn;
                const timeOut = params.row.timeOut;
                if (timeIn && timeOut) {
                  const diff = timeOut.getTime() - timeIn.getTime();
                  const hours = diff / 1000 / 60 / 60;
                  return hours.toFixed(2);
                }
                return "";
              },
            },
            { field: "remarks", headerName: "Remarks", width: 150 },
          ]}
        />
      </Box>

      <Box display={"flex"} alignContent={"flex-end"}>
        Coded with ❤️ by Ryan Castaneda
      </Box>
    </>
  );
}

export default App;
