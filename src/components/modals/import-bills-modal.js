import { Box, Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import * as XLSX from 'xlsx';
import { excelDateToJSDate } from '../../utils/formatTime';

const ImportBillsModal = ({ setBillImportModalOpen }) => {
  const [excelData, setExcelData] = useState([]);

  const acceptedFileTypes = /^(?:\.xlsx|\.csv)$/i; // Regular expression for .xlsx or .csv

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.log('Invalid file type. Please select only Excel (.xlsx) or CSV (.csv) files.');
    } else {
      const file = acceptedFiles[0]; // Assuming single file upload
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'array' }); // Parse Excel data
        const sheetName = workbook.SheetNames[0]; // Get the first sheet name
        const worksheet = workbook.Sheets[sheetName]; // Get the worksheet
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const result = jsonData.map((data) => {
          const modifiedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.toLowerCase().replace(/\s+/g, '_'), value])
          );

          modifiedData.invoice_date = excelDateToJSDate(modifiedData.invoice_date)
          modifiedData.payment_date = excelDateToJSDate(modifiedData.payment_date)
          modifiedData.product = [
            {
              name: modifiedData.product,
              stock: modifiedData.stock,
              amount: modifiedData.amount,
              initial_amount: modifiedData.initial_amount,
            },
          ];

          delete modifiedData.mobile_no;
          delete modifiedData.area;
          delete modifiedData['o/s_qty'];
          delete modifiedData.initial_amount;

          return modifiedData
        });

        setExcelData(result)
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  console.log(excelData)


  useEffect(() => {
    if (excelData.length > 0) {
      const confirmAddBills = window.confirm('Do you really want to add bills?');

      if (confirmAddBills) {
        excelData.forEach((data) => {
          try {
            // Convert keys to lowercase and replace spaces with underscores
            // Parse the 'product' property from string to object
            // modifiedData.product = JSON.parse(modifiedData.product);
            axios
              .post('/bills/excel', data)
              .then((response) => {
                // Handle response data here
                // console.log('Response from /bills:', response.data);
                enqueueSnackbar('Bills Added Successfully', { variant: 'success' });
                // Close the modal
                setBillImportModalOpen(false);
              })
              .catch((error) => {
                console.error('Error calling /bills:', error.response.data.error);
                enqueueSnackbar(error.response.data.error, { variant: 'error' });
              });
          } catch (parseError) {
            console.error('Error parsing product data:', parseError);
            enqueueSnackbar('Please Check Headers In Your Excel Or CSV File. Error parsing product data', {
              variant: 'error',
            });
            setBillImportModalOpen(false);
          }
        });
      } else {
        setBillImportModalOpen(false);
      }
    }
  }, [excelData]);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx', 'text/csv': '.csv' },
    multiple: false, // Allow only single file
    validator: (file) => acceptedFileTypes.test(file.name),
  });

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <Box sx={{ height: '100vh' }}>
      <Box m={4} sx={{ bgcolor: 'white', height: '50%' }}>
        <Stack justifyContent={'flex-end'}>
          <Button onClick={() => setBillImportModalOpen(false)} variant="contained" sx={{ m: 2 }}>
            Close
          </Button>
        </Stack>
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          sx={{ width: '100%', height: 'auto', border: '1px dotted #000' }}
          {...getRootProps({ className: 'dropzone' })}
        >
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
          {files}
        </Stack>
      </Box>
    </Box>
  );
};

export default ImportBillsModal;
