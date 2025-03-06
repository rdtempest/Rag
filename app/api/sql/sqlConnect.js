import { Connection} from 'tedious';
import process from 'process';

async function sqlConnect() {
   var SqlServerName = process.env.SQLSERVERNAME;
   var SqlDatabaseName = process.env.SQLDATABASENAME;
  var SqlUserName = process.env.SQLUSERENAME;
  
  var SqlPassword = process.env.SQLPASSWORD
  // SqlPassword = "AzureAdmin149$^&23!#6^3kL";


  //   //Azure test
  //   SqlServerName ="tcdsbresearchdept.database.windows.net"
  //   SqlDatabaseName ="StudentDataScience"
  //   SqlUserName = "dba_readonly"
  //   SqlPassword = "azuresqlsecretabc12!";
  
  // //local test
  // SqlServerName = "localhost"
  // SqlDatabaseName="robtest"
  // SqlUserName = "test"
  // SqlPassword = "abc";

  //   //SQL 2025 test
  //   SqlServerName = "localhost"
  //   SqlDatabaseName="robtest"
  //   SqlUserName = "test"
  //   SqlPassword = "abc";
  
  /*
    CREATE LOGIN 
  */
  console.log('SqlServerName:' + SqlServerName);
  console.log('SqlDatabaseName:' + SqlDatabaseName);
  console.log('SqlUserName:' + SqlUserName);
  console.log('SqlPassword:' + SqlPassword);
  const config = {
    server: SqlServerName,
    options: {
      trustServerCertificate: true,
      encrypt: true,
      database: SqlDatabaseName
    },
    authentication: {
      type: "default",
      options: {
        userName: SqlUserName,
        password: SqlPassword
      }
    }
  };


  const connection = new Connection(config);

  try {
    return new Promise((resolve, reject) => {
      connection.on('connect', err => {
        if (err) {
          reject(err);
        } else {
          console.log('sqlConnect.js SQL Connected');
          resolve(connection);
        }
      });
      connection.connect();
    });

  } catch (err) {
//    console.error(err);
    console.log('****ERROR CONECTING TO SQL SERVER ******')
    console.log(err);
  }
}

//main();
export { sqlConnect} ;
