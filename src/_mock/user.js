// fetchClients.js

import { fetchClients } from "../api";

const fetchedClients = [];

const fetchClientsFunc = async () => {
  console.log('Hello')
  try {
    const data = await fetchClients();
    fetchedClients.push(...data);
  } catch (err) {
    console.error(err);
  }
};

fetchClientsFunc()

export default fetchedClients;