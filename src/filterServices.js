const axios = require('axios');
const fs = require('fs');
require('dotenv').config()

const API_TOKEN = `${process.env.API_TOKEN}`;
const URL_TENANT = `${process.env.URL_TENANT}`;

const filterServices = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${URL_TENANT}`,
      headers: {
        'Authorization': `Api-Token ${API_TOKEN}`
      }
    });
    const services = response.data;
    const filteredServices = services.filter(service => !service.agent && service.monitoringState.restartRequired === true  && !service.fromRelationships.isNetworkClientOf);
    fs.writeFile('filteredServices.json', JSON.stringify(filteredServices, null, 2), (err) => {
      if (err) throw err;
      console.log('El archivo filteredServices.json ha sido creado');
    });
  } catch (error) { 
    console.log("Token no valido, revisa el URL_TENANT y el API_TOKEN en las variables de entorno en el archivo .env que esten correctamente escritas o revisa en Dynatrace para saber si el token existe o es valido");
  }
};

filterServices();