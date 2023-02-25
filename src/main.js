//Filtro service.softwareTechnologies

const readline = require('readline');
const axios = require('axios');
const excel = require('excel4node');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_TOKEN = `${process.env.API_TOKEN}`;
const URL_TENANT = `${process.env.URL_TENANT}`;

const getServices = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${URL_TENANT}`,
      headers: {
        'Authorization': `Api-Token ${API_TOKEN}`
      }
      
    });
    return response.data;
  } catch (error) {
    console.log("Token no valido, revisa el URL_TENANT y el API_TOKEN en las variables de entorno en el archivo .env que esten correctamente escritas o revisa en Dynatrace para saber si el token existe o es valido");
  }
};

const askForTypes = (callback) => { 
  rl.question("Ingrese el nombre de la tecnologia en Mayuscula separada por commas Ej: JAVA,GO ('all' para filtrar todos) ", (types) => {
    callback(types.split(',').map(type => type.trim()));
    rl.close();
  });
};

(async () => {

  //Filtrar los servicios no monitoreados y con restartRequired en true
  const services = await getServices();
  const filteredServices = services.filter(service => !service.agent && service.monitoringState.restartRequired === true);

  askForTypes((types) => {

    let filteredByTypes
    if(types.includes('all')){
      filteredByTypes = filteredServices
    }else{
      filteredByTypes = filteredServices.filter(service => types.includes(service.softwareTechnologies[0].type))
    }

    //Crear archivo excel

    const fileName = path.join(__dirname, `${process.env.FILE_NAME}.xlsx`)
    let workbook

    if (fs.existsSync(fileName)){
      workbook = new excel.Workbook()
      workbook.readFile(filename)
      const workSheet = workbook.getWorkSheet(1) || workbook.addWorksheet('sheet 1') 

      const highestRow = workSheet.lastRow.number

      filteredByTypes.forEach((service, index) =>{
        workSheet.cell(highestRow + index + 1, 1).string(service.discoveredName)
        workSheet.cell(highestRow + index + 1, 2).string(service.displayName)
        workSheet.cell(highestRow + index + 1, 3).string(service.metadata.hostGroups)
        workSheet.cell(highestRow + index + 1, 4).string(service.softwareTechnologies[0].type)
        workSheet.cell(highestRow + index + 1, 5).string("TRUE")
      })
      console.log("Archivo actualizado")
    }else{
      workbook = new excel.Workbook()
      const workSheet = workbook.addWorksheet('Sheet 1');

      var discoveredNameHeader = workSheet.cell(1, 1)
      discoveredNameHeader.string('DICOVEREDNAME')
      discoveredNameHeader.style({font: {bold: true}})
    
      var displayNameHeader = workSheet.cell(1, 2)
      displayNameHeader.string('DISPLAYNAME')
      displayNameHeader.style({font: {bold: true}})
    
      var hostGroupsHeader = workSheet.cell(1, 3)
      hostGroupsHeader.string('HOSTGROUPS')
      hostGroupsHeader.style({font: {bold: true}})
    
      var typeHeader = workSheet.cell(1, 4)
      typeHeader.string('TYPE')
      typeHeader.style({font: {bold: true}})
    
      var typeRestart = workSheet.cell(1, 5)
      typeRestart.string('RESTART')
      typeRestart.style({font: {bold: true}})

      filteredByTypes.forEach((service, index) => {
        workSheet.cell(index + 2, 1).string(service.discoveredName)
        workSheet.cell(index + 2, 2).string(service.displayName);
        workSheet.cell(index + 2, 3).string(service.metadata.hostGroups);
        workSheet.cell(index + 2, 4).string(service.softwareTechnologies[0].type);
        workSheet.cell(index + 2, 5).string("TRUE");
      });
      console.log("Archivo creado correctamente");
      workbook.write(`${process.env.FILE_NAME}.xlsx`);
    }
  });
})();